"use client";

import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  CheckSquare,
  Crosshair,
  Database,
  FileText,
  GitBranch,
  GitMerge,
  Globe,
  Home,
  KeyRound,
  Monitor,
  MoveRight,
  Network,
  Plug,
  Radar,
  Shield,
  Skull,
  Star,
  Terminal,
  TrendingUp,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections } from "@/lib/commands";
import { useVariables } from "@/components/VariablesProvider";

const RECON   = "RECON";
const EXPLOIT = "EXPLOIT";
const POST    = "POST EXPLOIT";
const PRIVESC = "PRIVESC";
const AD      = "ACTIVE DIRECTORY";
const WORK    = "WORKSPACE";
const REF     = "REFERENCE";

const nav = [
  { href: "/",                label: "Dashboard",         icon: Home                                              },
  // ── RECON ──────────────────────────────────────────────
  { href: "/recon",           label: "Recon & Enum",      icon: Radar,        category: RECON,   slug: "recon"   },
  // ── EXPLOIT ────────────────────────────────────────────
  { href: "/shells",          label: "Shells & Payloads", icon: Skull,        category: EXPLOIT, countKey: "shells"       },
  { href: "/web",             label: "Web Attacks",       icon: Globe,        category: EXPLOIT, slug: "web"              },
  { href: "/api-attacks",     label: "API Attacks",       icon: Plug,         category: EXPLOIT, countKey: "api"          },
  { href: "/bof",             label: "Buffer Overflow",   icon: Activity,     category: EXPLOIT, slug: "bof"              },
  // ── POST EXPLOIT ───────────────────────────────────────
  { href: "/file-transfer",   label: "File Transfer",     icon: ArrowLeftRight, category: POST,  countKey: "fileTransfer" },
  { href: "/loot",            label: "Loot & Creds",      icon: Database,     category: POST,    countKey: "loot"         },
  { href: "/passwords",       label: "Hash Cracking",     icon: KeyRound,     category: POST,    slug: "passwords"        },
  { href: "/tunneling",       label: "Tunneling & Pivot", icon: Network,      category: POST,    countKey: "tunneling"    },
  // ── PRIVESC ────────────────────────────────────────────
  { href: "/linux-privesc",   label: "Linux PrivEsc",     icon: TrendingUp,   category: PRIVESC, countKey: "linuxPrivesc"   },
  { href: "/windows-privesc", label: "Windows PrivEsc",   icon: Monitor,      category: PRIVESC, countKey: "windowsPrivesc" },
  // ── ACTIVE DIRECTORY ───────────────────────────────────
  { href: "/ad-recon",        label: "AD Recon",          icon: Shield,       category: AD,      countKey: "adRecon"   },
  { href: "/ad-attacks",      label: "AD Attacks",        icon: Crosshair,    category: AD,      countKey: "adAttacks" },
  { href: "/ad-lateral",      label: "AD Lateral",        icon: MoveRight,    category: AD,      countKey: "adLateral" },
  // ── WORKSPACE ──────────────────────────────────────────
  { href: "/exam",            label: "Exam Dashboard",    icon: Trophy,       category: WORK },
  { href: "/workflow",        label: "Workflow Board",    icon: GitBranch,    category: WORK },
  { href: "/report",          label: "Report Builder",    icon: FileText,     category: WORK },
  { href: "/favorites",       label: "Favorites",         icon: Star,         category: WORK },
  { href: "/my-commands",     label: "My Commands",       icon: Terminal,     category: WORK, countKey: "customCommands" },
  // ── REFERENCE ──────────────────────────────────────────
  { href: "/methodology",     label: "Methodology",       icon: BookOpen,     category: REF },
  { href: "/chains",          label: "Attack Chains",     icon: GitMerge,     category: REF },
  { href: "/cve",             label: "CVE Reference",     icon: AlertTriangle, category: REF },
  { href: "/checklist",       label: "Exam Checklist",    icon: CheckSquare,  category: REF },
];

const categories = [RECON, EXPLOIT, POST, PRIVESC, AD, WORK, REF];

const categoryColor: Record<string, string> = {
  [RECON]:   "text-core",
  [EXPLOIT]: "text-post",
  [POST]:    "text-warn",
  [PRIVESC]: "text-success",
  [AD]:      "text-adblue",
  [WORK]:    "text-custom",
  [REF]:     "text-dim",
};

const _exploit = sections.find((s) => s.slug === "exploit");
const _privesc = sections.find((s) => s.slug === "privesc");
const _post    = sections.find((s) => s.slug === "post");
const _ad      = sections.find((s) => s.slug === "ad");

const commandCountBySlug = sections.reduce<Record<string, number>>((acc, section) => {
  acc[section.slug] = section.groups.reduce((sum, g) => sum + g.commands.length, 0);
  return acc;
}, {});

const staticCounts: Record<string, number> = {
  shells: _exploit
    ? _exploit.groups
        .filter((g) => ["Reverse Shells", "Listeners", "Shell Stabilization TTY", "MSFvenom Payloads", "Windows Execution & Shells"].includes(g.title))
        .reduce((sum, g) => sum + g.commands.length, 0)
    : 0,
  api: _exploit?.groups.find((g) => g.title === "API Attacks")?.commands.length || 0,
  linuxPrivesc: _privesc
    ? _privesc.groups.reduce((sum, g) => sum + g.commands.filter((c) => c.tags.includes("linux") || c.tags.includes("all")).length, 0)
    : 0,
  windowsPrivesc: _privesc
    ? _privesc.groups.reduce((sum, g) => sum + g.commands.filter((c) => c.tags.includes("windows") || c.tags.includes("all")).length, 0)
    : 0,
  tunneling:    _post?.groups.find((g) => g.title === "Pivoting & Tunneling")?.commands.length || 0,
  fileTransfer: _post?.groups.filter((g) => g.title.includes("File Transfer")).reduce((sum, g) => sum + g.commands.length, 0) || 0,
  loot:
    (_post?.groups.filter((g) => ["Linux Looting", "Windows Looting"].includes(g.title)).reduce((sum, g) => sum + g.commands.length, 0) || 0) +
    (_privesc?.groups.filter((g) => ["Credential Hunting Linux", "Windows Credential Dumping"].includes(g.title)).reduce((sum, g) => sum + g.commands.length, 0) || 0),
  adRecon: _ad?.groups.filter((g) => g.title === "AD Enumeration").reduce((sum, g) => sum + g.commands.length, 0) || 0,
  adAttacks: _ad?.groups
    .filter((g) => ["ASREPRoasting", "Kerberoasting", "Pass-the-Hash", "Credential Dumping", "Golden/Silver Tickets", "ADCS Abuse", "Shadow Credentials", "NTLM Relay", "Delegation Abuse"].includes(g.title))
    .reduce((sum, g) => sum + g.commands.length, 0) || 0,
  adLateral: _ad?.groups
    .filter((g) => ["NetExec / nxc", "MSSQL Attacks", "Lateral Movement"].includes(g.title))
    .reduce((sum, g) => sum + g.commands.length, 0) || 0,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { customCommands } = useVariables();
  const counts: Record<string, number> = { ...staticCounts, customCommands: customCommands.length };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r border-border bg-surface px-2 py-4">
      {/* Logo */}
      <div className="mb-3 border-b border-border pb-3 px-2">
        <p className="font-mono text-base tracking-widest text-orange">OSCP/WIKI</p>
        <p className="font-mono text-[11px] text-dim mt-0.5">by Neo · v2</p>
      </div>

      {/* Nav */}
      <nav className="h-[calc(100vh-108px)] overflow-auto pr-0.5">
        {/* Dashboard */}
        {nav
          .filter((item) => !item.category)
          .map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex items-center gap-2 rounded px-2.5 py-1.5 font-mono text-xs transition-colors border-l-2 ${
                  active
                    ? "border-orange bg-orange/10 text-orange"
                    : "border-transparent text-dim hover:bg-white/5 hover:text-bright"
                }`}
              >
                <Icon size={13} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

        {/* Category groups */}
        {categories.map((category) => {
          const items = nav.filter((item) => item.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category} className="mt-3 border-t border-border/40 pt-2.5">
              <p className={`mb-1 px-2 font-mono text-[10px] font-medium tracking-widest ${categoryColor[category]}`}>
                {category}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  const count = item.slug
                    ? commandCountBySlug[item.slug]
                    : item.countKey
                    ? counts[item.countKey]
                    : undefined;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between rounded px-2.5 py-1.5 font-mono text-xs transition-colors border-l-2 ${
                        active
                          ? "border-orange bg-orange/10 text-orange"
                          : "border-transparent text-dim hover:bg-white/5 hover:text-bright"
                      }`}
                    >
                      <span className="inline-flex min-w-0 items-center gap-2">
                        <Icon size={12} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {count !== undefined && count > 0 && (
                        <span className="ml-2 shrink-0 font-mono text-[10px] text-dim/50">{count}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
