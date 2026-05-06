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
  exploitation: string;
  postExploitation: string;
  privesc: string;
  screenshots: Screenshot[];
  notes: string;
  isAD: boolean;
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
  id: crypto.randomUUID(),
  title: "",
  severity: "High",
  cvss: "",
  cve: "",
  description: "",
  impact: "",
  remediation: "",
});

export const emptyTarget = (): Target => ({
  id: crypto.randomUUID(),
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
  postExploitation: "",
  privesc: "",
  screenshots: [],
  notes: "",
  isAD: false,
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
});
