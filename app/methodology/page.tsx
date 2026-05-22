"use client";

import Link from "next/link";
import {
  Radar, Skull, Globe, Zap, Activity,
  ArrowLeftRight, Database, KeyRound,
  TrendingUp, FileText, Network, Shield,
  CheckCircle2, Circle, AlertTriangle, ChevronRight,
  Layers,
} from "lucide-react";

interface CheckItem { text: string; warn?: boolean }
interface DecisionItem { condition: string; action: string; href?: string; warn?: boolean }
interface Step { label: string; href?: string; icon?: React.ElementType }

interface Phase {
  num: string;
  title: string;
  subtitle: string;
  accent: string;
  bg: string;
  border: string;
  badgeBg: string;
  goal: string;
  steps: Step[];
  decisions: DecisionItem[];
  before: CheckItem[];
}

const phases: Phase[] = [
  {
    num: "01",
    title: "Recon & Enumeration",
    subtitle: "Map every attack surface before you touch anything.",
    accent: "text-core",
    bg: "bg-core/5",
    border: "border-core/30",
    badgeBg: "bg-core/20 text-core border-core/40",
    goal: "Build a complete picture of the target: open ports, service versions, web paths, users, shares, and potential CVEs. Do not skip this — a missed port is a missed vector.",
    steps: [
      { label: "Full TCP port scan (all 65535)", href: "/recon" },
      { label: "Service version + script scan on open ports", href: "/recon" },
      { label: "UDP scan (top 20: 161, 53, 69, 123…)", href: "/recon" },
      { label: "Web directory + vhost brute force", href: "/recon" },
      { label: "SMB / RPC / LDAP enumeration if applicable", href: "/recon" },
      { label: "Searchsploit every identified version", href: "/recon" },
      { label: "Note all credentials, usernames, and shares found", href: "/loot" },
    ],
    decisions: [
      { condition: "Web server found (80/443/8080…)", action: "→ Phase 2: Web Attacks", href: "/web" },
      { condition: "SMB open (445)", action: "→ Enum shares, null session, spray creds" },
      { condition: "LDAP / Kerberos (389/88)", action: "→ Likely AD environment — plan Phase 5", href: "/ad-recon" },
      { condition: "Unknown service / custom port", action: "→ Searchsploit + manual banner grab", href: "/recon" },
      { condition: "SSH / RDP only", action: "→ Try found/default credentials first" },
      { condition: "NFS / RPC open", action: "→ Mount and inspect shares for creds/keys" },
    ],
    before: [
      { text: "All 65535 TCP ports scanned" },
      { text: "Every service version identified" },
      { text: "Web directories enumerated (if applicable)" },
      { text: "SMB/LDAP/RPC enumerated (if applicable)" },
      { text: "Searchsploit run against all versions" },
      { text: "Attack vector(s) identified — know what to try next", warn: true },
    ],
  },
  {
    num: "02",
    title: "Initial Access",
    subtitle: "Exploit a vector and get a shell on the target.",
    accent: "text-post",
    bg: "bg-post/5",
    border: "border-post/30",
    badgeBg: "bg-post/20 text-post border-post/40",
    goal: "Turn a discovered vulnerability into code execution. Your goal is a stable reverse shell. Don't move to post-exploitation until you have a reliable foothold.",
    steps: [
      { label: "Web: try SQLi, LFI, file upload, SSTI, XXE, SSRF", href: "/web" },
      { label: "API: test for IDOR, auth bypass, injection", href: "/api-attacks" },
      { label: "Service exploit: searchsploit → download → adapt → run", href: "/recon" },
      { label: "Custom service: buffer overflow methodology", href: "/bof" },
      { label: "Catch reverse shell — set listener first", href: "/shells" },
      { label: "Stabilize TTY immediately (pty.spawn → stty raw)", href: "/shells" },
    ],
    decisions: [
      { condition: "Got RCE via web vuln", action: "→ Upgrade to reverse shell one-liner", href: "/shells" },
      { condition: "Got file upload", action: "→ Upload webshell → execute → reverse shell" },
      { condition: "Got credentials from recon", action: "→ Try SSH / RDP / SMB / WinRM login" },
      { condition: "Public exploit exists", action: "→ Download, read the code, adapt LHOST/PORT" },
      { condition: "No vector working", action: "→ Go back to Phase 1 — you missed something", warn: true },
      { condition: "Shell dies quickly", action: "→ Use pwncat-cs or socat for stable TTY" },
    ],
    before: [
      { text: "Stable shell obtained (not just one-shot RCE)" },
      { text: "Shell stabilized with full TTY" },
      { text: "Know current user: id / whoami" },
      { text: "Know hostname and OS: uname -a / systeminfo" },
      { text: "local.txt found and captured (if low-priv box)", warn: true },
    ],
  },
  {
    num: "03",
    title: "Post Exploitation",
    subtitle: "Establish your foothold — gather intel and transfer tools.",
    accent: "text-warn",
    bg: "bg-warn/5",
    border: "border-warn/30",
    badgeBg: "bg-warn/20 text-warn border-warn/40",
    goal: "You have a shell. Before chasing root, gather everything you can: credentials, hashes, config files, network intel. These often unlock other machines or shortcuts to privesc.",
    steps: [
      { label: "Transfer linpeas / winpeas to target", href: "/file-transfer" },
      { label: "Run automated enum (linpeas / winpeas)", href: "/linux-privesc" },
      { label: "Loot: bash_history, config files, env, shadow", href: "/loot" },
      { label: "Check for reusable credentials across services", href: "/loot" },
      { label: "Map internal network: ip addr, arp, routes", href: "/tunneling" },
      { label: "Crack any found hashes offline", href: "/passwords" },
    ],
    decisions: [
      { condition: "Found plaintext credentials", action: "→ Reuse on other services / users immediately" },
      { condition: "Found NTLM hashes", action: "→ Crack offline or Pass-the-Hash", href: "/passwords" },
      { condition: "Found internal subnets / hosts", action: "→ Set up pivot tunnel (Phase 5)", href: "/tunneling" },
      { condition: "Found SSH private key", action: "→ Try key against root and other users" },
      { condition: "Found DB config (wp-config, etc.)", action: "→ Connect to DB and dump users/hashes" },
      { condition: "Found AD service account", action: "→ Kerberoasting / ASREPRoasting", href: "/ad-attacks" },
    ],
    before: [
      { text: "Automated enum (linpeas/winpeas) completed" },
      { text: "Bash history, config files, env checked" },
      { text: "All found credentials documented" },
      { text: "Internal network topology mapped" },
      { text: "Privesc vectors identified — at least one path to root/SYSTEM", warn: true },
    ],
  },
  {
    num: "04",
    title: "Privilege Escalation",
    subtitle: "Escalate to root or SYSTEM.",
    accent: "text-success",
    bg: "bg-success/5",
    border: "border-success/30",
    badgeBg: "bg-success/20 text-success border-success/40",
    goal: "Leverage the privesc vector you found in Phase 3 to get full control of the machine. Work the checklist — SUID before kernel exploits on Linux; token impersonation before service abuse on Windows.",
    steps: [
      { label: "Linux: check sudo -l first (fastest win)", href: "/linux-privesc" },
      { label: "Linux: SUID, capabilities, writable crons, PATH", href: "/linux-privesc" },
      { label: "Windows: whoami /priv — SeImpersonate → Potato", href: "/windows-privesc" },
      { label: "Windows: unquoted paths, weak service ACLs", href: "/windows-privesc" },
      { label: "Windows: dump credentials (mimikatz / reg save)", href: "/loot" },
      { label: "Kernel exploits: last resort — noisy and unstable", href: "/linux-privesc" },
    ],
    decisions: [
      { condition: "sudo -l shows NOPASSWD entry", action: "→ GTFOBins immediately", href: "/linux-privesc" },
      { condition: "SeImpersonatePrivilege on Windows", action: "→ GodPotato / PrintSpoofer", href: "/windows-privesc" },
      { condition: "Writable cron job / script", action: "→ Inject reverse shell payload" },
      { condition: "SUID binary found", action: "→ Check GTFOBins for shell escape" },
      { condition: "AlwaysInstallElevated set", action: "→ Generate .msi payload with msfvenom" },
      { condition: "No obvious vector", action: "→ Re-run linpeas with -a flag or check pspy64" },
    ],
    before: [
      { text: "Root / SYSTEM shell obtained" },
      { text: "proof.txt captured", warn: true },
      { text: "Screenshot: whoami (or id) + proof.txt contents" },
      { text: "Dumped local hashes for reuse (secretsdump / hashdump)" },
    ],
  },
  {
    num: "05",
    title: "Lateral Movement",
    subtitle: "Pivot to internal hosts and own the domain.",
    accent: "text-adblue",
    bg: "bg-adblue/5",
    border: "border-adblue/30",
    badgeBg: "bg-adblue/20 text-adblue border-adblue/40",
    goal: "Use tunnels and obtained credentials to reach internal machines. In AD environments, chain from low-priv user to Domain Admin using BloodHound-identified paths.",
    steps: [
      { label: "Set up tunnel (Ligolo-ng / Chisel) to reach internals", href: "/tunneling" },
      { label: "Re-run Phase 1 recon against internal hosts", href: "/recon" },
      { label: "AD: run BloodHound — identify shortest DA path", href: "/ad-recon" },
      { label: "AS-REP Roast (no pre-auth users) + Kerberoast (SPNs)", href: "/ad-attacks" },
      { label: "Pass-the-Hash / Pass-the-Ticket if hashes found", href: "/ad-attacks" },
      { label: "Lateral: psexec / wmiexec / winrm with DA creds", href: "/ad-lateral" },
    ],
    decisions: [
      { condition: "Have Domain Admin hash", action: "→ DCSync / Pass-the-Hash to DC", href: "/ad-attacks" },
      { condition: "Found Kerberoastable account", action: "→ GetUserSPNs → crack offline", href: "/ad-attacks" },
      { condition: "Found AS-REP Roastable user", action: "→ GetNPUsers → crack offline", href: "/ad-attacks" },
      { condition: "ADCS (cert services) running", action: "→ Check for ESC1–ESC8 with Certipy", href: "/ad-attacks" },
      { condition: "Got DA — want persistence", action: "→ Golden/Silver ticket or DSRM account", href: "/persistence" },
      { condition: "Tunnel keeps dropping", action: "→ Switch to Ligolo-ng (more stable than chisel)", href: "/tunneling" },
    ],
    before: [
      { text: "All in-scope machines owned" },
      { text: "All flags (local.txt + proof.txt) collected", warn: true },
      { text: "All screenshots taken (whoami + flag file)" },
      { text: "Credentials, hashes, and notes documented for report" },
    ],
  },
];

const osrcpTips = [
  { tip: "Take a screenshot immediately after every flag — with whoami/id visible.", type: "flag" },
  { tip: "Revert the machine if behaviour seems wrong — stale state is a common trap.", type: "warn" },
  { tip: "Don't rabbit-hole. If a vector takes >45 min with no progress, move on and come back.", type: "time" },
  { tip: "Read the full service banner and all web pages before trying exploits — the hint is usually there.", type: "recon" },
  { tip: "Always try credential reuse across every discovered service immediately after finding creds.", type: "creds" },
  { tip: "Document every step as you go. You will need it for the report. Screenshots > notes.", type: "report" },
  { tip: "The BOF machine has a pattern. Fuzz → find offset → control EIP → bad chars → shellcode.", type: "bof" },
  { tip: "In AD labs, BloodHound is not optional. Run it early and trust the shortest-path query.", type: "ad" },
];

export default function MethodologyPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="color-panel rounded-md p-5">
        <div className="flex items-center gap-3 mb-2">
          <Layers className="text-violet" size={22} />
          <h1 className="font-heading text-3xl text-gradient-brand">Attack Methodology</h1>
        </div>
        <p className="text-sm text-dim max-w-2xl">
          A phase-by-phase OSCP engagement workflow. Each phase answers <span className="text-bright">what to do</span>, <span className="text-bright">what to decide</span>, and <span className="text-bright">when to move on</span>. Follow the phases in order — skipping recon causes 90% of stuck sessions.
        </p>
      </header>

      {/* Phase flow strip */}
      <div className="flex flex-wrap gap-2">
        {phases.map((p, i) => (
          <a key={p.num} href={`#phase-${p.num}`} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-xs text-dim hover:text-bright hover:border-violet/50 transition">
            <span className={`font-bold ${p.accent}`}>{p.num}</span>
            <span>{p.title}</span>
            {i < phases.length - 1 && <ChevronRight size={10} className="text-border" />}
          </a>
        ))}
      </div>

      {/* Phase cards */}
      {phases.map((phase) => (
        <section key={phase.num} id={`phase-${phase.num}`} className={`rounded-lg border ${phase.border} ${phase.bg} p-5 space-y-5 scroll-mt-4`}>
          {/* Phase header */}
          <div className="flex flex-wrap items-start gap-3">
            <span className={`rounded border px-2.5 py-1 font-mono text-xs font-bold ${phase.badgeBg}`}>
              PHASE {phase.num}
            </span>
            <div>
              <h2 className={`font-heading text-xl ${phase.accent}`}>{phase.title}</h2>
              <p className="text-xs text-dim mt-0.5">{phase.subtitle}</p>
            </div>
          </div>

          {/* Goal */}
          <p className="text-sm text-slate-300 border-l-2 border-border pl-3">{phase.goal}</p>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Steps */}
            <div className="md:col-span-1 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-dim mb-2">Steps</p>
              <div className="space-y-1">
                {phase.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className={`mt-0.5 font-mono text-[10px] ${phase.accent} shrink-0`}>{String(i + 1).padStart(2, "0")}</span>
                    {step.href ? (
                      <Link href={step.href} className="hover:text-bright hover:underline underline-offset-2 transition">
                        {step.label}
                      </Link>
                    ) : (
                      <span>{step.label}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Decision points */}
            <div className="md:col-span-1 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-dim mb-2">Decision Points</p>
              <div className="space-y-2">
                {phase.decisions.map((d, i) => (
                  <div key={i} className="rounded border border-border bg-surface/60 p-2 text-xs">
                    <p className="text-dim">{d.condition}</p>
                    {d.href ? (
                      <Link href={d.href} className={`font-mono ${phase.accent} hover:underline underline-offset-2`}>
                        {d.action}
                      </Link>
                    ) : (
                      <p className={`font-mono ${d.warn ? "text-warn" : phase.accent}`}>{d.action}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Before moving on */}
            <div className="md:col-span-1 space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-dim mb-2">Before Moving On</p>
              <div className="space-y-1.5">
                {phase.before.map((item, i) => (
                  <div key={i} className={`flex items-start gap-2 text-xs rounded px-2 py-1 ${item.warn ? "bg-warn/10 border border-warn/30" : "bg-surface/60"}`}>
                    {item.warn
                      ? <AlertTriangle size={11} className="text-warn mt-0.5 shrink-0" />
                      : <Circle size={11} className="text-dim mt-0.5 shrink-0" />
                    }
                    <span className={item.warn ? "text-warn" : "text-slate-300"}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* OSCP-specific tips */}
      <section className="color-panel rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-violet" />
          <h2 className="font-heading text-lg text-gradient-brand">OSCP Exam Tips</h2>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {osrcpTips.map((t, i) => (
            <div key={i} className="flex items-start gap-2.5 rounded border border-border bg-surface/60 p-3 text-xs text-slate-300">
              <span className="font-mono text-[10px] text-violet/60 shrink-0 mt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <span>{t.tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick-reference machine type checklists */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Linux standalone */}
        <section className="color-panel rounded-lg p-4 space-y-3">
          <h3 className="font-mono text-sm text-success">Linux Standalone</h3>
          <div className="space-y-1 text-xs text-slate-300">
            {[
              "Full port scan → service enum",
              "Web/service exploit → shell",
              "TTY stabilize",
              "sudo -l → SUID → caps → cron",
              "linpeas for automation",
              "Credential hunt (history, configs)",
              "Capture local.txt + proof.txt",
              "Screenshot id + flag",
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <Circle size={8} className="text-success/50 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Windows standalone */}
        <section className="color-panel rounded-lg p-4 space-y-3">
          <h3 className="font-mono text-sm text-core">Windows Standalone</h3>
          <div className="space-y-1 text-xs text-slate-300">
            {[
              "Full port scan → service enum",
              "Web/SMB/service exploit → shell",
              "whoami /priv → token abuse",
              "SeImpersonate → Potato family",
              "winPEAS + PowerUp",
              "Unquoted paths, weak services",
              "Credential hunt (reg, cmdkey, history)",
              "Capture local.txt + proof.txt",
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <Circle size={8} className="text-core/50 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* AD environment */}
        <section className="color-panel rounded-lg p-4 space-y-3">
          <h3 className="font-mono text-sm text-adblue">Active Directory</h3>
          <div className="space-y-1 text-xs text-slate-300">
            {[
              "Enumerate DC / domain name",
              "Kerbrute user enum if no creds",
              "AS-REP Roast (no pre-auth)",
              "Get foothold on any domain host",
              "Run BloodHound (SharpHound)",
              "Kerberoast SPNs → crack",
              "Follow BloodHound shortest path",
              "ADCS: certipy find --vulnerable",
              "DA → DCSync → golden ticket",
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <Circle size={8} className="text-adblue/50 shrink-0" />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
