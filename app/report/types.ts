export function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export interface Screenshot {
  id: string;
  name: string;
  dataUrl: string;
  caption: string;
}

export interface Vulnerability {
  id: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Informational";
  cvss: string;
  cve: string;
  description: string;
  impact: string;
  remediation: string;
}

/**
 * A discrete step in exploitation or privilege escalation.
 * Optional. When present, the PDF renders numbered steps with figure refs.
 * If steps are empty, the PDF falls back to the markdown `exploitation`/`privesc` field.
 */
export interface ExploitStep {
  id: string;
  title: string;
  description: string; // markdown
  command: string;     // raw shell — rendered in a code block
  output: string;      // raw text — rendered in a code block
  screenshot: Screenshot | null;
}

export const emptyStep = (): ExploitStep => ({
  id: generateId(),
  title: "",
  description: "",
  command: "",
  output: "",
  screenshot: null,
});

export interface Target {
  id: string;
  name: string;
  ip: string;
  os: "Linux" | "Windows" | "Unknown";
  ports: string;
  services: string;
  localTxt: string;
  proofTxt: string;
  localScreenshot: Screenshot | null;
  proofScreenshot: Screenshot | null;
  vulnerabilities: Vulnerability[];
  enumeration: string;
  exploitation: string;            // markdown — legacy free-form
  exploitationSteps?: ExploitStep[]; // structured steps; when present they take precedence in PDF
  postExploitation: string;
  privesc: string;                 // markdown — legacy free-form
  privescSteps?: ExploitStep[];
  screenshots: Screenshot[];
  notes: string;
  isAD: boolean;
  /** Exam tracker fields — shared with /exam dashboard */
  examPoints?: number;       // 10 / 20 (AD client / DC or standalone)
  localCaptured?: boolean;   // exam tracker checkbox; derived initial value: !!localTxt
  proofCaptured?: boolean;   // exam tracker checkbox; derived initial value: !!proofTxt
  examNotes?: string;        // short tracker notes (creds, vectors, blockers)
}

export interface ReportData {
  candidateName: string;
  osid: string;
  email: string;
  examDate: string;
  reportDate: string;
  version: string;
  executiveSummary: string;
  methodology: string;
  adChainSummary: string;
  appendix: string;
  toolsUsed: string;
  targets: Target[];
  /**
   * When true, exporters (PDF + Markdown) follow Offsec's PWK template
   * structure exactly: 1.0 Documentation → 2.0 High-Level Summary →
   * 3.0 Methodologies → 4.0 Findings → 5.0 Active Directory → Appendix,
   * with required boilerplate (Objective, Requirements, Recommendations).
   */
  useOfficialTemplate?: boolean;
}

export type ReportTab = "cover" | "summary" | "targets" | "ad-chain" | "appendix";

export const SEVERITY_COLORS: Record<Vulnerability["severity"], string> = {
  Critical: "text-red bg-red/15 border-red/40",
  High: "text-orange bg-orange/15 border-orange/40",
  Medium: "text-warn bg-warn/15 border-warn/40",
  Low: "text-core bg-core/15 border-core/40",
  Informational: "text-dim bg-dim/15 border-dim/40",
};

export const emptyVulnerability = (): Vulnerability => ({
  id: generateId(),
  title: "",
  severity: "High",
  cvss: "",
  cve: "",
  description: "",
  impact: "",
  remediation: "",
});

export const emptyTarget = (): Target => ({
  id: generateId(),
  name: "",
  ip: "",
  os: "Unknown",
  ports: "",
  services: "",
  localTxt: "",
  proofTxt: "",
  localScreenshot: null,
  proofScreenshot: null,
  vulnerabilities: [emptyVulnerability()],
  enumeration: "",
  exploitation: "",
  exploitationSteps: [],
  postExploitation: "",
  privesc: "",
  privescSteps: [],
  screenshots: [],
  notes: "",
  isAD: false,
  examPoints: 20,
  localCaptured: false,
  proofCaptured: false,
  examNotes: "",
});

export const emptyReport = (): ReportData => ({
  candidateName: "",
  osid: "",
  email: "",
  examDate: "",
  reportDate: new Date().toISOString().split("T")[0],
  version: "1.0",
  executiveSummary: "",
  methodology: `1. Information Gathering & Service Enumeration
   - Port scanning with Nmap
   - Service version detection
   - Web application enumeration

2. Vulnerability Analysis
   - Manual testing of discovered services
   - Identification of known CVEs
   - Web application vulnerability assessment

3. Exploitation
   - Exploitation of identified vulnerabilities
   - Initial foothold establishment

4. Post-Exploitation & Privilege Escalation
   - Local enumeration
   - Privilege escalation vector identification
   - Root/SYSTEM access achievement

5. Proof Collection
   - Capture of local.txt and proof.txt flags
   - Screenshot documentation`,
  adChainSummary: "",
  appendix: "",
  toolsUsed: "Nmap, Gobuster, Burp Suite, Metasploit (if allowed), LinPEAS, WinPEAS, Chisel, Ligolo-ng, Hashcat, John the Ripper, Impacket, BloodHound, Certipy",
  targets: [emptyTarget()],
  useOfficialTemplate: false,
});
