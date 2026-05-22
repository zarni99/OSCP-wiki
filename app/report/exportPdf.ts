import { marked } from "marked";
import { ExploitStep, ReportData } from "./types";

/**
 * Render an array of structured exploit steps with figure cross-references.
 * Each figure gets a globally unique number so the PDF reads naturally.
 * Returns "" if the array is empty.
 */
function renderSteps(steps: ExploitStep[] | undefined, figureStart: { n: number }, sectionLabel: string): string {
  if (!steps || steps.length === 0) return "";
  return steps
    .map((s, i) => {
      const figs: string[] = [];
      if (s.screenshot) {
        figureStart.n += 1;
        const num = figureStart.n;
        figs.push(
          `<figure><img src="${s.screenshot.dataUrl}" /><figcaption>Figure ${num}: ${escapeHtml(s.screenshot.caption || `${sectionLabel} step ${i + 1}`)}</figcaption></figure>`,
        );
      }
      return `
        <div class="step">
          <h4>Step ${i + 1}${s.title ? ` — ${escapeHtml(s.title)}` : ""}</h4>
          ${s.description ? `<div class="md">${md(s.description)}</div>` : ""}
          ${s.command ? `<pre class="code-block"><code>${escapeHtml(s.command)}</code></pre>` : ""}
          ${s.output ? `<pre class="code-block output"><code>${escapeHtml(s.output)}</code></pre>` : ""}
          ${figs.join("")}
        </div>`;
    })
    .join("");
}

const severityColor: Record<string, string> = {
  Critical: "#ff5f7f",
  High: "#ffb14a",
  Medium: "#ffd166",
  Low: "#49b8ff",
  Informational: "#90a0bf",
};

// Configure marked for predictable, sync output suitable for print HTML.
marked.setOptions({
  gfm: true,
  breaks: true, // single newlines → <br>, matches textarea editing model
});

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Render markdown to HTML for the print document. Falls back to escaped text on errors. */
function md(str: string): string {
  if (!str) return "";
  try {
    return marked.parse(str, { async: false }) as string;
  } catch {
    return escapeHtml(str).replace(/\n/g, "<br>");
  }
}


export function exportReport(data: ReportData) {
  const win = window.open("", "_blank");
  if (!win) return;

  // Shared figure counter across the whole document for cross-references.
  const figCounter = { n: 0 };
  const official = !!data.useOfficialTemplate;

  // Section label helpers — Offsec template names differ from the flexible one.
  const labelExploit = official ? "Initial Access" : "Exploitation";
  const labelPostEx = official ? "Maintaining Access" : "Post-Exploitation";
  const labelFindingsHeader = official
    ? `<section class="page"><h2>4.0 — Findings</h2><p>Each target was assessed for known and unknown vulnerabilities. Confirmed findings, exploit chains, and proof of compromise are documented below.</p></section>`
    : "";

  const targetPages = data.targets
    .map((t, i) => {
      const exploitStepsHtml = renderSteps(t.exploitationSteps, figCounter, labelExploit.toLowerCase());
      const privescStepsHtml = renderSteps(t.privescSteps, figCounter, "privesc");
      // Numbering: flexible uses N.0 starting at 3 (after Exec Summary + Methodology pages).
      // Official uses 4.X (within the Findings chapter).
      const prefix = official ? `4.${i + 1}` : `${i + 1 + 2}.0`;
      const sub = (n: number) => (official ? `${prefix}.${n}` : `${i + 1 + 2}.${n}`);
      return `
    <section class="page">
      <h2>${prefix} — ${escapeHtml(t.name || `Target ${i + 1}`)} (${escapeHtml(t.ip || "N/A")})</h2>
      <table class="info-table">
        <tr><td class="label">Hostname</td><td>${escapeHtml(t.name)}</td></tr>
        <tr><td class="label">IP Address</td><td>${escapeHtml(t.ip)}</td></tr>
        <tr><td class="label">Operating System</td><td>${escapeHtml(t.os)}</td></tr>
        ${t.isAD ? '<tr><td class="label">Type</td><td style="color:#7a8dff">Active Directory</td></tr>' : ""}
      </table>

      <h3>${sub(1)} — Service Enumeration</h3>
      ${t.ports ? `<pre class="code-block">${escapeHtml(t.ports)}</pre>` : ""}
      ${t.enumeration ? `<div class="content md">${md(t.enumeration)}</div>` : ""}

      <h3>${sub(2)} — Vulnerability Analysis</h3>
      ${t.vulnerabilities
        .filter((v) => v.title)
        .map(
          (v) => `
        <div class="vuln-card">
          <div class="vuln-header" style="border-left:4px solid ${severityColor[v.severity] || "#90a0bf"}">
            <strong>${escapeHtml(v.title)}</strong>
            <span class="severity" style="color:${severityColor[v.severity] || "#90a0bf"}">${v.severity}${v.cvss ? ` (CVSS: ${escapeHtml(v.cvss)})` : ""}${v.cve ? ` — ${escapeHtml(v.cve)}` : ""}</span>
          </div>
          ${v.description ? `<p><strong>Description:</strong></p><div class="md">${md(v.description)}</div>` : ""}
          ${v.impact ? `<p><strong>Impact:</strong></p><div class="md">${md(v.impact)}</div>` : ""}
          ${v.remediation ? `<p><strong>Remediation:</strong></p><div class="md">${md(v.remediation)}</div>` : ""}
        </div>`,
        )
        .join("")}

      <h3>${sub(3)} — ${labelExploit}</h3>
      ${exploitStepsHtml}
      ${t.exploitation ? `<div class="md">${md(t.exploitation)}</div>` : (!exploitStepsHtml ? "<p>—</p>" : "")}

      <h3>${sub(4)} — Privilege Escalation</h3>
      ${privescStepsHtml}
      ${t.privesc ? `<div class="md">${md(t.privesc)}</div>` : (!privescStepsHtml ? "<p>—</p>" : "")}

      <h3>${sub(5)} — ${labelPostEx}</h3>
      ${t.postExploitation ? `<div class="md">${md(t.postExploitation)}</div>` : "<p>—</p>"}

      <h3>${sub(6)} — ${official ? "Proof" : "Proof of Exploitation"}</h3>
      <table class="proof-table">
        <tr><td class="label" style="color:#ffd166">local.txt</td><td class="flag">${escapeHtml(t.localTxt || "—")}</td></tr>
        <tr><td class="label" style="color:#66ffb2">proof.txt</td><td class="flag">${escapeHtml(t.proofTxt || "—")}</td></tr>
      </table>
      ${t.localScreenshot ? (() => { figCounter.n += 1; return `<figure><img src="${t.localScreenshot.dataUrl}" /><figcaption>Figure ${figCounter.n}: local.txt proof</figcaption></figure>`; })() : ""}
      ${t.proofScreenshot ? (() => { figCounter.n += 1; return `<figure><img src="${t.proofScreenshot.dataUrl}" /><figcaption>Figure ${figCounter.n}: proof.txt proof</figcaption></figure>`; })() : ""}

      ${
        t.screenshots.length > 0
          ? `<h3>Supporting Screenshots</h3><div class="shots">${t.screenshots
              .map((s) => {
                figCounter.n += 1;
                return `<figure><img src="${s.dataUrl}" /><figcaption>Figure ${figCounter.n}: ${escapeHtml(s.caption || s.name)}</figcaption></figure>`;
              })
              .join("")}</div>`
          : ""
      }
      ${t.notes ? `<h3>Additional Notes</h3><div class="md">${md(t.notes)}</div>` : ""}
    </section>`;
    })
    .join("");

  const adTargets = data.targets.filter((t) => t.isAD);
  const adSection = adTargets.length > 0 ? `
    <section class="page">
      <h2>${official ? "5.0 — Active Directory Set" : "Active Directory Attack Chain"}</h2>
      <p><strong>AD Targets:</strong> ${adTargets.map((t) => `${escapeHtml(t.name)} (${escapeHtml(t.ip)})`).join(" → ")}</p>
      ${data.adChainSummary ? `<div class="md">${md(data.adChainSummary)}</div>` : ""}
    </section>` : "";

  win.document.write(`<!DOCTYPE html><html><head><title>OSCP Penetration Test Report — ${escapeHtml(data.osid || "Report")}</title>
<style>
  @page { margin: 20mm; size: A4; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; line-height: 1.6; padding: 0; margin: 0; }
  .cover { display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; text-align: center; page-break-after: always; border-top: 6px solid #2563eb; padding: 60px 40px; }
  .cover h1 { font-size: 28px; color: #2563eb; margin: 0 0 4px; }
  .cover .subtitle { font-size: 18px; color: #64748b; margin-bottom: 40px; }
  .cover .meta { margin-top: 30px; }
  .cover .meta p { margin: 4px 0; font-size: 14px; color: #475569; }
  .cover .confidential { margin-top: 60px; font-size: 11px; color: #ef4444; letter-spacing: 3px; text-transform: uppercase; border: 1px solid #ef4444; padding: 6px 20px; }
  .page { page-break-after: always; padding: 10px 0; }
  h2 { font-size: 20px; color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 6px; margin-top: 30px; }
  h3 { font-size: 15px; color: #475569; margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
  .info-table, .proof-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  .info-table td, .proof-table td { padding: 6px 12px; border: 1px solid #e2e8f0; font-size: 13px; }
  .info-table .label, .proof-table .label { background: #f8fafc; font-weight: 600; width: 160px; }
  .flag { font-family: 'Courier New', monospace; font-size: 12px; word-break: break-all; }
  .code-block { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 12px; font-family: 'Courier New', monospace; font-size: 12px; white-space: pre-wrap; word-wrap: break-word; overflow-x: auto; line-height: 1.5; }
  .content { font-size: 13px; margin: 8px 0; }
  .vuln-card { border: 1px solid #e2e8f0; border-radius: 4px; margin: 10px 0; padding: 12px; }
  .vuln-header { padding: 8px 12px; margin: -12px -12px 12px; background: #f8fafc; display: flex; justify-content: space-between; align-items: center; }
  .severity { font-size: 12px; font-weight: 600; }
  .vuln-card p { font-size: 13px; margin: 6px 0; }
  .step {
    border-left: 3px solid #2563eb; background: #f8fafc;
    padding: 8px 14px; margin: 10px 0; page-break-inside: avoid;
  }
  .step h4 { color: #1e3a8a; margin: 0 0 6px; font-size: 14px; }
  .code-block.output {
    background: #1e293b; border-color: #334155; color: #cbd5e1;
  }
  .shots { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 12px 0; }
  figure { margin: 10px 0; page-break-inside: avoid; }
  img { max-width: 100%; border: 1px solid #e2e8f0; border-radius: 4px; }
  figcaption { font-size: 11px; color: #64748b; margin-top: 4px; text-align: center; font-style: italic; }
  .toc { page-break-after: always; }
  .toc h2 { border-bottom: none; }
  .toc ul { list-style: none; padding: 0; }
  .toc li { padding: 4px 0; font-size: 14px; border-bottom: 1px dotted #e2e8f0; }
  /* Markdown-rendered content (executive summary, methodology, exploitation, etc.) */
  .md { font-size: 13px; line-height: 1.55; margin: 8px 0; }
  .md p { margin: 6px 0; }
  .md h1, .md h2, .md h3, .md h4 { color: #1e3a8a; margin: 14px 0 6px; line-height: 1.3; }
  .md h1 { font-size: 17px; }
  .md h2 { font-size: 15px; }
  .md h3 { font-size: 14px; }
  .md h4 { font-size: 13px; }
  .md ul, .md ol { margin: 6px 0; padding-left: 22px; }
  .md li { margin: 2px 0; }
  .md a { color: #2563eb; text-decoration: underline; }
  .md strong { color: #0f172a; }
  .md code {
    background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 3px;
    padding: 1px 5px; font-family: 'Courier New', monospace; font-size: 12px; color: #be123c;
  }
  .md pre {
    background: #0f172a; color: #f1f5f9; border-radius: 4px; padding: 10px 12px;
    font-family: 'Courier New', monospace; font-size: 11px; overflow-x: auto;
    white-space: pre-wrap; word-wrap: break-word; margin: 8px 0;
    page-break-inside: avoid;
  }
  .md pre code { background: transparent; border: 0; padding: 0; color: inherit; font-size: 11px; }
  .md blockquote {
    border-left: 3px solid #2563eb; padding: 4px 10px; margin: 6px 0;
    background: #f8fafc; color: #475569;
  }
  .md img {
    max-width: 100%; height: auto; border: 1px solid #e2e8f0; border-radius: 4px;
    margin: 6px 0; page-break-inside: avoid;
  }
  .md table { border-collapse: collapse; margin: 8px 0; font-size: 12px; }
  .md th, .md td { border: 1px solid #e2e8f0; padding: 4px 8px; text-align: left; }
  .md th { background: #f1f5f9; font-weight: 600; }
  .md hr { border: 0; border-top: 1px solid #e2e8f0; margin: 10px 0; }
  @media print { .page { break-after: page; } body { padding: 0; } }
</style></head><body>
  <div class="cover">
    <h1>Offensive Security</h1>
    <div class="subtitle">OSCP+ Penetration Test Report</div>
    <div style="width:200px;height:2px;background:linear-gradient(90deg,#2563eb,#7c3aed,#2563eb);margin:20px auto;"></div>
    <div class="meta">
      <p><strong>Candidate:</strong> ${escapeHtml(data.candidateName || "—")}</p>
      <p><strong>OS-ID:</strong> ${escapeHtml(data.osid || "—")}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.email || "—")}</p>
      <p><strong>Exam Date:</strong> ${escapeHtml(data.examDate || "—")}</p>
      <p><strong>Report Date:</strong> ${escapeHtml(data.reportDate || "—")}</p>
      <p><strong>Version:</strong> ${escapeHtml(data.version || "1.0")}</p>
    </div>
    <div class="confidential">Confidential</div>
  </div>

  <div class="toc">
    <h2>Table of Contents</h2>
    <ul>
      ${
        official
          ? `<li>1.0 — Offensive Security PWK Exam Documentation</li>
             <li>2.0 — High-Level Summary</li>
             <li>3.0 — Methodologies</li>
             <li>4.0 — Findings</li>
             ${data.targets.map((t, i) => `<li>&nbsp;&nbsp;&nbsp;&nbsp;4.${i + 1} — ${escapeHtml(t.name || `Target ${i + 1}`)} (${escapeHtml(t.ip || "N/A")})</li>`).join("")}
             ${adTargets.length > 0 ? "<li>5.0 — Active Directory Set</li>" : ""}`
          : `<li>1.0 — Executive Summary</li>
             <li>2.0 — Methodology</li>
             ${data.targets.map((t, i) => `<li>${i + 3}.0 — ${escapeHtml(t.name || `Target ${i + 1}`)} (${escapeHtml(t.ip || "N/A")})</li>`).join("")}
             ${adTargets.length > 0 ? "<li>Active Directory Attack Chain</li>" : ""}`
      }
      <li>Appendix</li>
    </ul>
  </div>

  ${
    official
      ? `
  <section class="page">
    <h2>1.0 — Offensive Security PWK Exam Documentation</h2>
    <h3>1.1 — Objective</h3>
    <div class="md"><p>The objective of this assessment is to perform an internal penetration test against the Offensive Security PWK Exam environment. The student is tasked with following a methodical approach to obtain access to the objective goals. This test should simulate an actual penetration test, from start to finish, including the overall report.</p></div>
    <h3>1.2 — Requirements</h3>
    <div class="md">
      <p>The student is required to complete this penetration testing report fully and include the following sections:</p>
      <ul>
        <li>Overall High-Level Summary and Recommendations (non-technical)</li>
        <li>Methodology walkthrough and detailed outline of steps taken</li>
        <li>Each finding with included screenshots, walkthrough, sample code, and proof.txt / local.txt if applicable</li>
        <li>Any additional items that were not included</li>
      </ul>
    </div>
  </section>

  <section class="page">
    <h2>2.0 — High-Level Summary</h2>
    <div class="md">${data.executiveSummary ? md(data.executiveSummary) : "<p>—</p>"}</div>
    <h3>2.1 — Recommendations</h3>
    <div class="md"><p>It is recommended that the customer patch the vulnerabilities identified during the testing to ensure that an attacker cannot exploit these systems in the future. One thing to remember is that these systems require frequent patching and, once patched, should remain on a regular patch program to protect against additional vulnerabilities discovered at a later date.</p></div>
  </section>

  <section class="page">
    <h2>3.0 — Methodologies</h2>
    <div class="md">${data.methodology ? md(data.methodology) : "<p>—</p>"}</div>
    ${data.toolsUsed ? `<h3>Tools Used</h3><div class="md">${md(data.toolsUsed)}</div>` : ""}
  </section>

  ${labelFindingsHeader}`
      : `
  <section class="page">
    <h2>1.0 — Executive Summary</h2>
    <div class="md">${data.executiveSummary ? md(data.executiveSummary) : "<p>—</p>"}</div>
  </section>

  <section class="page">
    <h2>2.0 — Methodology</h2>
    <div class="md">${data.methodology ? md(data.methodology) : "<p>—</p>"}</div>
    ${data.toolsUsed ? `<h3>Tools Used</h3><div class="md">${md(data.toolsUsed)}</div>` : ""}
  </section>`
  }

  ${targetPages}
  ${adSection}

  <section class="page">
    <h2>Appendix</h2>
    <h3>Proof Summary</h3>
    <table class="info-table">
      <tr style="background:#f8fafc;font-weight:600"><td>Target</td><td>IP</td><td>local.txt</td><td>proof.txt</td></tr>
      ${data.targets.map((t) => `<tr><td>${escapeHtml(t.name || "—")}</td><td>${escapeHtml(t.ip || "—")}</td><td class="flag">${escapeHtml(t.localTxt || "—")}</td><td class="flag">${escapeHtml(t.proofTxt || "—")}</td></tr>`).join("")}
    </table>
    ${data.appendix ? `<h3>Additional Information</h3><div class="md">${md(data.appendix)}</div>` : ""}
  </section>
</body></html>`);
  win.document.close();
  win.focus();
  win.print();
  // Close the window after the print dialog is dismissed.
  win.addEventListener("afterprint", () => win.close());
}
