import { ExploitStep, ReportData, Target, Vulnerability } from "./types";
import { defaultBackupFilename, downloadFile } from "./utils";

/**
 * Produce a Markdown rendering of the report. Inline screenshots stay as
 * `![caption](data:...)` so the .md file is self-contained — viewable in any
 * markdown renderer (VS Code, Obsidian, gh issues, etc.).
 *
 * If `data.useOfficialTemplate` is true, sections follow the Offsec PWK
 * template structure (4.X.1 Service Enumeration → 4.X.6 Proof).
 */
export function buildReportMarkdown(data: ReportData): string {
  const official = !!data.useOfficialTemplate;
  const figCounter = { n: 0 };
  const lines: string[] = [];

  // ── Cover ───────────────────────────────────────────────────────────────
  lines.push(
    official
      ? "# Offensive Security PWK Exam Report"
      : "# OSCP+ Penetration Test Report",
    "",
    "| Field | Value |",
    "|---|---|",
    `| Candidate | ${data.candidateName || "—"} |`,
    `| OS-ID | ${data.osid || "—"} |`,
    `| Email | ${data.email || "—"} |`,
    `| Exam Date | ${data.examDate || "—"} |`,
    `| Report Date | ${data.reportDate || "—"} |`,
    `| Version | ${data.version || "1.0"} |`,
    `| Classification | **CONFIDENTIAL** |`,
    "",
    "---",
    "",
  );

  // ── TOC ─────────────────────────────────────────────────────────────────
  lines.push("## Table of Contents", "");
  if (official) {
    lines.push(
      "- 1.0 Offensive Security PWK Exam Documentation",
      "- 2.0 High-Level Summary",
      "- 3.0 Methodologies",
      "- 4.0 Findings",
    );
    data.targets.forEach((t, i) => {
      lines.push(`  - 4.${i + 1} ${t.name || `Target ${i + 1}`} (${t.ip || "N/A"})`);
    });
    if (data.targets.some((t) => t.isAD)) lines.push("- 5.0 Active Directory Set");
    lines.push("- Appendix");
  } else {
    lines.push("- 1.0 Executive Summary", "- 2.0 Methodology");
    data.targets.forEach((t, i) => {
      lines.push(`- ${i + 3}.0 ${t.name || `Target ${i + 1}`} (${t.ip || "N/A"})`);
    });
    if (data.targets.some((t) => t.isAD)) lines.push("- Active Directory Attack Chain");
    lines.push("- Appendix");
  }
  lines.push("", "---", "");

  // ── Front matter ────────────────────────────────────────────────────────
  if (official) {
    lines.push(
      "## 1.0 Offensive Security PWK Exam Documentation",
      "",
      "### 1.1 Objective",
      "",
      "The objective of this assessment is to perform an internal penetration test against the Offensive Security PWK Exam environment. The student is tasked with following methodical approach in obtaining access to the objective goals. This test should simulate an actual penetration test and how you would start from beginning to end, including the overall report.",
      "",
      "### 1.2 Requirements",
      "",
      "The student will be required to fill out this penetration testing report fully and to include the following sections:",
      "",
      "- Overall High-Level Summary and Recommendations (non-technical)",
      "- Methodology walkthrough and detailed outline of steps taken",
      "- Each finding with included screenshots, walkthrough, sample code, and proof.txt / local.txt if applicable.",
      "- Any additional items that were not included",
      "",
      "## 2.0 High-Level Summary",
      "",
      data.executiveSummary || "_No executive summary provided._",
      "",
      "### 2.1 Recommendations",
      "",
      "It is recommended that the customer patch the vulnerabilities identified during the testing to ensure that an attacker cannot exploit these systems in the future. One thing to remember is that these systems require frequent patching and once patched, should remain on a regular patch program to protect additional vulnerabilities that are discovered at a later date.",
      "",
      "## 3.0 Methodologies",
      "",
      data.methodology || "_No methodology provided._",
      "",
    );
    if (data.toolsUsed) {
      lines.push("### Tools Used", "", data.toolsUsed, "");
    }
  } else {
    lines.push("## 1.0 Executive Summary", "", data.executiveSummary || "_No executive summary provided._", "");
    lines.push("## 2.0 Methodology", "", data.methodology || "_No methodology provided._", "");
    if (data.toolsUsed) lines.push("### Tools Used", "", data.toolsUsed, "");
  }
  lines.push("---", "");

  // ── Findings (per target) ──────────────────────────────────────────────
  if (official) lines.push("## 4.0 Findings", "");
  data.targets.forEach((t, i) => {
    const prefix = official ? `4.${i + 1}` : `${i + 3}.0`;
    lines.push(
      `## ${prefix} — ${t.name || `Target ${i + 1}`} (${t.ip || "N/A"})`,
      "",
      "| Field | Value |",
      "|---|---|",
      `| Hostname | ${t.name || "—"} |`,
      `| IP Address | ${t.ip || "—"} |`,
      `| Operating System | ${t.os} |`,
      ...(t.isAD ? ["| Type | Active Directory |"] : []),
      "",
    );

    lines.push(`### ${prefix}.1 Service Enumeration`, "");
    if (t.ports) lines.push("```\n" + t.ports + "\n```", "");
    if (t.enumeration) lines.push(t.enumeration, "");

    lines.push(`### ${prefix}.2 Vulnerability Analysis`, "");
    const namedVulns = t.vulnerabilities.filter((v) => v.title);
    if (namedVulns.length === 0) {
      lines.push("_No vulnerabilities documented._", "");
    } else {
      namedVulns.forEach((v) => lines.push(...renderVuln(v)));
    }

    lines.push(
      official ? `### ${prefix}.3 Initial Access` : `### ${prefix}.3 Exploitation`,
      "",
    );
    const exploitSteps = renderStepsMd(t.exploitationSteps, figCounter, "exploitation");
    if (exploitSteps) lines.push(exploitSteps, "");
    if (t.exploitation) lines.push(t.exploitation, "");
    if (!exploitSteps && !t.exploitation) lines.push("—", "");

    lines.push(`### ${prefix}.4 Privilege Escalation`, "");
    const privescSteps = renderStepsMd(t.privescSteps, figCounter, "privesc");
    if (privescSteps) lines.push(privescSteps, "");
    if (t.privesc) lines.push(t.privesc, "");
    if (!privescSteps && !t.privesc) lines.push("—", "");

    lines.push(
      official ? `### ${prefix}.5 Maintaining Access` : `### ${prefix}.5 Post-Exploitation`,
      "",
    );
    lines.push(t.postExploitation || "—", "");

    lines.push(`### ${prefix}.6 Proof`, "");
    lines.push(
      "| Flag | Value |",
      "|---|---|",
      `| local.txt | \`${t.localTxt || "—"}\` |`,
      `| proof.txt | \`${t.proofTxt || "—"}\` |`,
      "",
    );
    if (t.localScreenshot) {
      figCounter.n += 1;
      lines.push(
        `![Figure ${figCounter.n}: local.txt proof](${t.localScreenshot.dataUrl})`,
        `*Figure ${figCounter.n}: local.txt proof*`,
        "",
      );
    }
    if (t.proofScreenshot) {
      figCounter.n += 1;
      lines.push(
        `![Figure ${figCounter.n}: proof.txt proof](${t.proofScreenshot.dataUrl})`,
        `*Figure ${figCounter.n}: proof.txt proof*`,
        "",
      );
    }

    if (t.screenshots.length > 0) {
      lines.push("#### Supporting Screenshots", "");
      t.screenshots.forEach((s) => {
        figCounter.n += 1;
        const caption = s.caption || s.name;
        lines.push(
          `![Figure ${figCounter.n}: ${caption}](${s.dataUrl})`,
          `*Figure ${figCounter.n}: ${caption}*`,
          "",
        );
      });
    }

    if (t.notes) lines.push("#### Additional Notes", "", t.notes, "");
    lines.push("---", "");
  });

  // ── AD chain ────────────────────────────────────────────────────────────
  const adTargets = data.targets.filter((t) => t.isAD);
  if (adTargets.length > 0) {
    lines.push(official ? "## 5.0 Active Directory Set" : "## Active Directory Attack Chain", "");
    lines.push(
      `**AD Targets:** ${adTargets.map((t) => `${t.name || "?"} (${t.ip || "?"})`).join(" → ")}`,
      "",
    );
    if (data.adChainSummary) lines.push(data.adChainSummary, "");
    lines.push("---", "");
  }

  // ── Appendix ────────────────────────────────────────────────────────────
  lines.push("## Appendix", "");
  lines.push("### Proof Summary", "");
  lines.push(
    "| Target | IP | local.txt | proof.txt |",
    "|---|---|---|---|",
    ...data.targets.map(
      (t) => `| ${t.name || "—"} | ${t.ip || "—"} | \`${t.localTxt || "—"}\` | \`${t.proofTxt || "—"}\` |`,
    ),
    "",
  );
  if (data.appendix) lines.push("### Additional Information", "", data.appendix, "");

  return lines.join("\n");
}

function renderVuln(v: Vulnerability): string[] {
  const out: string[] = [];
  out.push(
    `#### ${v.title}  *(${v.severity}${v.cvss ? ` · CVSS ${v.cvss}` : ""}${v.cve ? ` · ${v.cve}` : ""})*`,
    "",
  );
  if (v.description) out.push("**Description:** " + v.description, "");
  if (v.impact) out.push("**Impact:** " + v.impact, "");
  if (v.remediation) out.push("**Remediation:** " + v.remediation, "");
  return out;
}

function renderStepsMd(
  steps: ExploitStep[] | undefined,
  figCounter: { n: number },
  sectionLabel: string,
): string {
  if (!steps || steps.length === 0) return "";
  const out: string[] = [];
  steps.forEach((s, i) => {
    out.push(`#### Step ${i + 1}${s.title ? ` — ${s.title}` : ""}`, "");
    if (s.description) out.push(s.description, "");
    if (s.command) out.push("```bash\n" + s.command + "\n```", "");
    if (s.output) out.push("```\n" + s.output + "\n```", "");
    if (s.screenshot) {
      figCounter.n += 1;
      const caption = s.screenshot.caption || `${sectionLabel} step ${i + 1}`;
      out.push(
        `![Figure ${figCounter.n}: ${caption}](${s.screenshot.dataUrl})`,
        `*Figure ${figCounter.n}: ${caption}*`,
        "",
      );
    }
  });
  return out.join("\n");
}

export function exportReportMarkdown(data: ReportData) {
  const filename = defaultBackupFilename(data.osid, "md");
  downloadFile(filename, buildReportMarkdown(data), "text/markdown");
}
