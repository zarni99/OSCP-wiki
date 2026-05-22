import { Activity, CheckSquare, FileText, GitMerge, Shield, TerminalSquare, Trophy, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { sections } from "@/lib/commands";

const sectionCardAccents = [
  { icon: "text-core",   title: "text-core" },
  { icon: "text-violet", title: "text-violet" },
  { icon: "text-post",   title: "text-post" },
  { icon: "text-success",title: "text-success" },
  { icon: "text-adblue", title: "text-adblue" },
  { icon: "text-orange", title: "text-orange" },
];

// Port → attack decision table
const PORT_MAP = [
  { port: "21", proto: "FTP", attacks: ["Anonymous login", "Creds spray", "File upload"], color: "text-core" },
  { port: "22", proto: "SSH", attacks: ["Key auth bypass", "Creds spray", "User enum (timing)"], color: "text-success" },
  { port: "25", proto: "SMTP", attacks: ["User enum (VRFY)", "Relay abuse", "Attachment phishing"], color: "text-dim" },
  { port: "53", proto: "DNS", attacks: ["Zone transfer (AXFR)", "Subdomain enum", "PTR records"], color: "text-core" },
  { port: "80/443", proto: "HTTP/S", attacks: ["Dir/file fuzz", "SQLi/SSTI/LFI", "Auth bypass"], color: "text-post" },
  { port: "88", proto: "Kerberos", attacks: ["AS-REP roast", "Kerberoast", "User enum"], color: "text-adblue" },
  { port: "389", proto: "LDAP", attacks: ["Anonymous bind", "User/group enum", "Password spray"], color: "text-adblue" },
  { port: "445", proto: "SMB", attacks: ["Null/anon session", "EternalBlue", "Relay / PtH"], color: "text-warn" },
  { port: "1433", proto: "MSSQL", attacks: ["xp_cmdshell", "Linked servers", "UNC hash capture"], color: "text-post" },
  { port: "3306", proto: "MySQL", attacks: ["Default creds (root:)", "UDF shell", "DB dump"], color: "text-success" },
  { port: "3389", proto: "RDP", attacks: ["BlueKeep", "Creds spray", "Pass-the-hash (RDP NLA off)"], color: "text-orange" },
  { port: "5985", proto: "WinRM", attacks: ["evil-winrm with creds", "PtH (admin hash)", "nxc winrm"], color: "text-adblue" },
];

export default function Home() {
  const quick = [
    { href: "/revshell", label: "Rev Shell Generator", icon: TerminalSquare, iconClass: "text-core", titleClass: "text-core" },
    { href: "/exam", label: "Exam Dashboard", icon: Trophy, iconClass: "text-orange", titleClass: "text-orange" },
    { href: "/chains", label: "Attack Chains", icon: GitMerge, iconClass: "text-adblue", titleClass: "text-adblue" },
    { href: "/cve", label: "CVE Reference", icon: AlertTriangle, iconClass: "text-red", titleClass: "text-red" },
    { href: "/checklist", label: "Exam Checklist", icon: CheckSquare, iconClass: "text-success", titleClass: "text-success" },
    { href: "/report", label: "Report Builder", icon: FileText, iconClass: "text-post", titleClass: "text-post" },
    { href: "/workflow", label: "Workflow Board", icon: Activity, iconClass: "text-violet", titleClass: "text-violet" },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-heading text-5xl text-gradient-brand">OSCP WIKI</h1>
        <p className="text-sm text-dim">
          <span className="text-core">Local-only</span> · recon · exploit · privesc · report
        </p>
      </header>

      {/* Unified card grid — tools + sections together, same card height */}
      <section className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {/* Tool cards */}
        {quick.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="color-panel flex flex-col gap-1.5 rounded-md p-4 transition hover:border-violet/40"
            >
              <Icon size={16} className={item.iconClass} />
              <p className={`font-heading text-sm leading-snug ${item.titleClass}`}>{item.label}</p>
            </Link>
          );
        })}

        {/* Section cards */}
        {sections.map((section, i) => {
          const accent = sectionCardAccents[i % sectionCardAccents.length];
          const cmdCount = section.groups.reduce((a, g) => a + g.commands.length, 0);
          return (
            <Link
              key={section.id}
              href={`/${section.slug}`}
              className="color-panel flex flex-col gap-1.5 rounded-md p-4 transition hover:border-core/30"
            >
              <Shield size={16} className={accent.icon} />
              <p className={`font-heading text-sm leading-snug ${accent.title}`}>{section.title}</p>
              <p className="font-mono text-[10px] text-dim/60">
                {section.groups.length}g · {cmdCount}c
              </p>
            </Link>
          );
        })}
      </section>

      {/* Port → Attack decision table */}
      <section>
        <h2 className="mb-3 font-mono text-sm uppercase tracking-widest text-dim">Port → Attack</h2>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {PORT_MAP.map((row) => (
            <div key={row.port} className="color-panel rounded-md px-3 py-2.5 flex items-start gap-3">
              <div className="shrink-0 text-right" style={{ minWidth: "3.5rem" }}>
                <span className={`font-mono text-sm font-bold ${row.color}`}>{row.port}</span>
                <p className="font-mono text-[10px] text-dim/60">{row.proto}</p>
              </div>
              <div className="min-w-0">
                <ul className="space-y-0.5">
                  {row.attacks.map((a) => (
                    <li key={a} className="font-mono text-[11px] text-dim before:mr-1.5 before:content-['›'] before:text-orange/50">{a}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="font-mono text-sm">
        <span className="text-warn">Tip:</span> <span className="text-dim">Press</span>{" "}
        <span className="text-gradient-mono">Ctrl+K</span> <span className="text-dim">for global command search.</span>
      </p>
    </div>
  );
}
