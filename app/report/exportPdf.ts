import { ReportData } from "./types";

const severityColor: Record<string, string> = {
  Critical: "#ff5f7f",
  High: "#ffb14a",
  Medium: "#ffd166",
  Low: "#49b8ff",
  Informational: "#90a0bf",
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function nl2br(str: string): string {
  return escapeHtml(str).replace(/\n/g, "<br>");
}

export function exportReport(data: ReportData) {
  const win = window.open("", "_blank");
  if (!win) return;

  const targetPages = data.targets
    .map(
      (t, i) => `
    <section class="page">
      <h2>${i + 1 + 2}.0 — ${escapeHtml(t.name || `Target ${i + 1}`)} (${escapeHtml(t.ip || "N/A")})</h2>
      <table class="info-table">
        <tr><td class="label">Hostname</td><td>${escapeHtml(t.name)}</td></tr>
        <tr><td class="label">IP Address</td><td>${escapeHtml(t.ip)}</td></tr>
        <tr><td class="label">Operating System</td><td>${escapeHtml(t.os)}</td></tr>
        ${t.isAD ? '<tr><td class="label">Type</td><td style="color:#7a8dff">Active Directory</td></tr>' : ""}
      </table>

      <h3>${i + 1 + 2}.1 — Service Enumeration</h3>
      ${t.ports ? `<pre class="code-block">${escapeHtml(t.ports)}</pre>` : ""}
      ${t.enumeration ? `<div class="content">${nl2br(t.enumeration)}</div>` : ""}

      <h3>${i + 1 + 2}.2 — Vulnerability Analysis</h3>
      ${t.vulnerabilities
        .filter((v) => v.title)
        .map(
          (v) => `
        <div class="vuln-card">
          <div class="vuln-header" style="border-left:4px solid ${severityColor[v.severity] || "#90a0bf"}">
            <strong>${escapeHtml(v.title)}</strong>
            <span class="severity" style="color:${severityColor[v.severity] || "#90a0bf"}">${v.severity}${v.cvss ? ` (CVSS: ${escapeHtml(v.cvss)})` : ""}${v.cve ? ` — ${escapeHtml(v.cve)}` : ""}</span>
          </div>
          ${v.description ? `<p><strong>Description:</strong> ${nl2br(v.description)}</p>` : ""}
          ${v.impact ? `<p><strong>Impact:</strong> ${nl2br(v.impact)}</p>` : ""}
          ${v.remediation ? `<p><strong>Remediation:</strong> ${nl2br(v.remediation)}</p>` : ""}
        </div>`
        )
        .join("")}

      <h3>${i + 1 + 2}.3 — Exploitation</h3>
      ${t.exploitation ? `<pre class="code-block">${escapeHtml(t.exploitation)}</pre>` : "<p>—</p>"}

      <h3>${i + 1 + 2}.4 — Privilege Escalation</h3>
      ${t.privesc ? `<pre class="code-block">${escapeHtml(t.privesc)}</pre>` : "<p>—</p>"}

      <h3>${i + 1 + 2}.5 — Post-Exploitation</h3>
      ${t.postExploitation ? `<div class="content">${nl2br(t.postExploitation)}</div>` : "<p>—</p>"}

      <h3>${i + 1 + 2}.6 — Proof of Exploitation</h3>
      <table class="proof-table">
        <tr><td class="label" style="color:#ffd166">local.txt</td><td class="flag">${escapeHtml(t.localTxt || "—")}</td></tr>
        <tr><td class="label" style="color:#66ffb2">proof.txt</td><td class="flag">${escapeHtml(t.proofTxt || "—")}</td></tr>
      </table>
      ${t.localScreenshot ? `<figure><img src="${t.localScreenshot.dataUrl}" /><figcaption>Figure: local.txt proof</figcaption></figure>` : ""}
      ${t.proofScreenshot ? `<figure><img src="${t.proofScreenshot.dataUrl}" /><figcaption>Figure: proof.txt proof</figcaption></figure>` : ""}

      ${
        t.screenshots.length > 0
          ? `<h3>Supporting Screenshots</h3><div class="shots">${t.screenshots.map((s) => `<figure><img src="${s.dataUrl}" /><figcaption>${escapeHtml(s.caption || s.name)}</figcaption></figure>`).join("")}</div>`
          : ""
      }
      ${t.notes ? `<h3>Additional Notes</h3><div class="content">${nl2br(t.notes)}</div>` : ""}
    </section>`
    )
    .join("");

  const adTargets = data.targets.filter((t) => t.isAD);
  const adSection = adTargets.length > 0 ? `
    <section class="page">
      <h2>Active Directory Attack Chain</h2>
      <p><strong>AD Targets:</strong> ${adTargets.map((t) => `${escapeHtml(t.name)} (${escapeHtml(t.ip)})`).join(" → ")}</p>
      ${data.adChainSummary ? `<pre class="code-block">${escapeHtml(data.adChainSummary)}</pre>` : ""}
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
  .shots { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin: 12px 0; }
  figure { margin: 10px 0; page-break-inside: avoid; }
  img { max-width: 100%; border: 1px solid #e2e8f0; border-radius: 4px; }
  figcaption { font-size: 11px; color: #64748b; margin-top: 4px; text-align: center; font-style: italic; }
  .toc { page-break-after: always; }
  .toc h2 { border-bottom: none; }
  .toc ul { list-style: none; padding: 0; }
  .toc li { padding: 4px 0; font-size: 14px; border-bottom: 1px dotted #e2e8f0; }
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
      <li>1.0 — Executive Summary</li>
      <li>2.0 — Methodology</li>
      ${data.targets.map((t, i) => `<li>${i + 3}.0 — ${escapeHtml(t.name || `Target ${i + 1}`)} (${escapeHtml(t.ip || "N/A")})</li>`).join("")}
      ${adTargets.length > 0 ? "<li>Active Directory Attack Chain</li>" : ""}
      <li>Appendix</li>
    </ul>
  </div>

  <section class="page">
    <h2>1.0 — Executive Summary</h2>
    <div class="content">${data.executiveSummary ? nl2br(data.executiveSummary) : "<p>—</p>"}</div>
  </section>

  <section class="page">
    <h2>2.0 — Methodology</h2>
    <div class="content">${data.methodology ? nl2br(data.methodology) : "<p>—</p>"}</div>
    ${data.toolsUsed ? `<h3>Tools Used</h3><div class="content">${nl2br(data.toolsUsed)}</div>` : ""}
  </section>

  ${targetPages}
  ${adSection}

  <section class="page">
    <h2>Appendix</h2>
    <h3>Proof Summary</h3>
    <table class="info-table">
      <tr style="background:#f8fafc;font-weight:600"><td>Target</td><td>IP</td><td>local.txt</td><td>proof.txt</td></tr>
      ${data.targets.map((t) => `<tr><td>${escapeHtml(t.name || "—")}</td><td>${escapeHtml(t.ip || "—")}</td><td class="flag">${escapeHtml(t.localTxt || "—")}</td><td class="flag">${escapeHtml(t.proofTxt || "—")}</td></tr>`).join("")}
    </table>
    ${data.appendix ? `<h3>Additional Information</h3><pre class="code-block">${escapeHtml(data.appendix)}</pre>` : ""}
  </section>
</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}
