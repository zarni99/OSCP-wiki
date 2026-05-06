"use client";

import {
  ArrowLeftRight,
  Activity,
  CheckSquare,
  FileText,
  Globe,
  Home,
  KeyRound,
  Network,
  Skull,
  Database,
  GitBranch,
  Radar,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { sections } from "@/lib/commands";
import { useVariables } from "@/components/VariablesProvider";

const nav = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/recon", label: "Recon", icon: Radar, category: "OSCP+ CORE", slug: "recon" },
  { href: "/web", label: "Web Attacks", icon: Globe, category: "OSCP+ CORE", slug: "web" },
  { href: "/api-attacks", label: "API Attacks", icon: Zap, category: "OSCP+ CORE", countKey: "api" },
  { href: "/shells", label: "Shells", icon: Skull, category: "OSCP+ CORE", countKey: "shells", hot: true },
  { href: "/linux-privesc", label: "Linux PrivEsc", icon: TrendingUp, category: "OSCP+ CORE", countKey: "linuxPrivesc" },
  { href: "/windows-privesc", label: "Windows PrivEsc", icon: FileText, category: "OSCP+ CORE", countKey: "windowsPrivesc" },
  { href: "/tunneling", label: "Tunneling", icon: Network, category: "OSCP+ CORE", countKey: "tunneling" },
  { href: "/file-transfer", label: "File Transfer", icon: ArrowLeftRight, category: "OSCP+ CORE", countKey: "fileTransfer" },
  { href: "/passwords", label: "Hash Cracking", icon: KeyRound, category: "POST-EXPLOITATION", slug: "passwords" },
  { href: "/loot", label: "Loot / Credentials", icon: Database, category: "POST-EXPLOITATION", countKey: "loot" },
  { href: "/bof", label: "Buffer Overflow", icon: Activity, category: "OSCP+ CORE", slug: "bof" },
  { href: "/ad-recon", label: "AD Recon", icon: Shield, category: "ACTIVE DIRECTORY", countKey: "adRecon" },
  { href: "/ad-attacks", label: "AD Attacks", icon: Zap, category: "ACTIVE DIRECTORY", countKey: "adAttacks" },
  { href: "/ad-lateral", label: "AD Lateral", icon: ArrowLeftRight, category: "ACTIVE DIRECTORY", countKey: "adLateral" },
  { href: "/persistence", label: "Persistence", icon: CheckSquare, category: "ACTIVE DIRECTORY", countKey: "persistence" },
  { href: "/checklist", label: "Exam Checklist", icon: CheckSquare, category: "CUSTOM" },
  { href: "/workflow", label: "Workflow Board", icon: GitBranch, category: "CUSTOM" },
  { href: "/report", label: "Report Builder", icon: FileText, category: "CUSTOM" },
  { href: "/favorites", label: "Favorites", icon: Star, category: "CUSTOM" },
  { href: "/my-commands", label: "My Commands", icon: Zap, category: "CUSTOM", countKey: "customCommands" },
];

const categories = ["OSCP+ CORE", "ACTIVE DIRECTORY", "POST-EXPLOITATION", "CUSTOM"];
const categoryStyles: Record<string, string> = {
  "OSCP+ CORE": "text-core",
  "ACTIVE DIRECTORY": "text-adblue",
  "POST-EXPLOITATION": "text-post",
  CUSTOM: "text-custom",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { customCommands } = useVariables();
  const commandCountBySlug = sections.reduce<Record<string, number>>((acc, section) => {
    acc[section.slug] = section.groups.reduce((sum, group) => sum + group.commands.length, 0);
    return acc;
  }, {});
  const exploit = sections.find((section) => section.slug === "exploit");
  const privesc = sections.find((section) => section.slug === "privesc");
  const post = sections.find((section) => section.slug === "post");
  const derivedCounts: Record<string, number> = {
    shells: exploit
      ? exploit.groups
          .filter((group) => ["Shell Stabilization TTY", "MSFvenom Payloads", "Listeners", "Windows Execution & Shells"].includes(group.title))
          .reduce((sum, group) => sum + group.commands.length, 0)
      : 0,
    api: exploit?.groups.find((group) => group.title === "API Attacks")?.commands.length || 0,
    linuxPrivesc: privesc
      ? privesc.groups.reduce((sum, group) => sum + group.commands.filter((command) => command.tags.includes("linux") || command.tags.includes("all")).length, 0)
      : 0,
    windowsPrivesc: privesc
      ? privesc.groups.reduce((sum, group) => sum + group.commands.filter((command) => command.tags.includes("windows") || command.tags.includes("all")).length, 0)
      : 0,
    tunneling: post?.groups.find((group) => group.title === "Pivoting & Tunneling")?.commands.length || 0,
    fileTransfer: post
      ? post.groups.filter((group) => group.title.includes("File Transfer")).reduce((sum, group) => sum + group.commands.length, 0)
      : 0,
    loot:
      (post?.groups.filter((group) => ["Meterpreter"].includes(group.title)).reduce((sum, group) => sum + group.commands.length, 0) || 0) +
      (privesc?.groups.filter((group) => ["Credential Hunting"].includes(group.title)).reduce((sum, group) => sum + group.commands.length, 0) || 0),
    adRecon: sections
      .find((section) => section.slug === "ad")
      ?.groups.filter((group) => ["BloodHound"].includes(group.title))
      .reduce((sum, group) => sum + group.commands.length, 0) || 0,
    adAttacks: sections
      .find((section) => section.slug === "ad")
      ?.groups.filter((group) => ["ASREPRoasting", "Kerberoasting", "Pass-the-Hash", "Credential Dumping", "ADCS Abuse", "Delegation Abuse"].includes(group.title))
      .reduce((sum, group) => sum + group.commands.length, 0) || 0,
    adLateral: sections
      .find((section) => section.slug === "ad")
      ?.groups.filter((group) => ["Lateral Movement"].includes(group.title))
      .reduce((sum, group) => sum + group.commands.length, 0) || 0,
    persistence:
      (sections
        .find((section) => section.slug === "ad")
        ?.groups.filter((group) => ["Golden/Silver Tickets"].includes(group.title))
        .reduce((sum, group) => sum + group.commands.length, 0) || 0) +
      (sections
        .find((section) => section.slug === "post")
        ?.groups.filter((group) => ["Persistence Quick Ops"].includes(group.title))
        .reduce((sum, group) => sum + group.commands.length, 0) || 0),
    customCommands: customCommands.length,
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-violet/30 bg-[#090f1e] px-4 py-5">
      <div className="mb-4 border-b border-border pb-4">
        <p className="font-mono text-xl tracking-wide text-gradient-mono">OSCP/WIKI</p>
        <p className="font-mono text-xs text-violet/80">by Neo</p>
        <p className="font-mono text-[10px] text-violet/50 mt-0.5">version 1</p>
      </div>
      <nav className="h-[calc(100vh-160px)] space-y-3 overflow-auto pr-1">
        {categories.map((category) => (
          <div key={category}>
            <p className={`mb-1 px-2 font-mono text-[10px] uppercase tracking-[0.2em] ${categoryStyles[category]}`}>{category}</p>
            <div className="space-y-1">
              {nav.filter((item) => item.category === category).map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                const count = item.slug ? commandCountBySlug[item.slug] : item.countKey ? derivedCounts[item.countKey] : undefined;
                const activeColor =
                  category === "ACTIVE DIRECTORY"
                    ? "border-adblue/70 bg-adblue/10 text-adblue"
                    : category === "POST-EXPLOITATION"
                      ? "border-post/70 bg-post/10 text-post"
                      : category === "CUSTOM"
                        ? "border-custom/70 bg-custom/10 text-custom"
                        : "border-core/70 bg-core/10 text-core";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between rounded-md border px-2.5 py-1.5 text-sm ${
                      active
                        ? `${activeColor} shadow-[0_0_0_1px_rgba(255,255,255,0.05)_inset]`
                        : "border-transparent text-slate-300 hover:border-violet/40 hover:bg-violet/10 hover:text-bright"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Icon size={14} />
                      {item.label}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      {item.hot ? (
                        <span className="rounded bg-post/20 px-1.5 py-0.5 font-mono text-[10px] text-post">HOT</span>
                      ) : null}
                      {count ? <span className="rounded-full bg-gradient-to-r from-violet/40 to-core/40 px-1.5 py-0.5 font-mono text-[10px] text-bright">{count}</span> : null}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="absolute bottom-4 left-4 right-4 border-t border-border pt-3 font-mono text-xs">
        <p className="text-warn/90">LOCAL ONLY</p>
        <p className="text-custom/90">OSCP 2026</p>
      </div>
    </aside>
  );
}
