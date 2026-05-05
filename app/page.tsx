import { Activity, CheckSquare, FileText, Shield, TerminalSquare } from "lucide-react";
import Link from "next/link";
import { sections } from "@/lib/commands";

const sectionCardAccents = [
  { icon: "text-core", title: "text-gradient-cool", meta: "text-adblue/85" },
  { icon: "text-violet", title: "text-violet", meta: "text-post/85" },
  { icon: "text-post", title: "text-gradient-warm", meta: "text-success/85" },
  { icon: "text-success", title: "text-success", meta: "text-core/85" },
  { icon: "text-adblue", title: "text-adblue", meta: "text-violet/85" },
  { icon: "text-orange", title: "text-orange", meta: "text-core/85" },
];

export default function Home() {
  const quick = [
    { href: "/revshell", label: "Rev Shell Generator", icon: TerminalSquare, iconClass: "text-core", titleClass: "text-core" },
    { href: "/checklist", label: "Exam Checklist", icon: CheckSquare, iconClass: "text-success", titleClass: "text-success" },
    { href: "/report", label: "Report Builder", icon: FileText, iconClass: "text-post", titleClass: "text-post" },
    { href: "/workflow", label: "Workflow Board", icon: Activity, iconClass: "text-violet", titleClass: "text-violet" },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-heading text-5xl text-gradient-brand">OSCP WIKI</h1>
        <p className="max-w-xl text-bright/80">
          <span className="text-core">Local-only</span> personal knowledge base —{" "}
          <span className="text-violet">recon</span>, <span className="text-post">exploit</span>,{" "}
          <span className="text-success">privesc</span>, <span className="text-adblue">report</span>.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quick.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="color-panel rounded-md p-4 transition hover:border-violet/50"
            >
              <Icon size={18} className={`mb-2 ${item.iconClass}`} />
              <p className={`font-heading text-lg ${item.titleClass}`}>{item.label}</p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section, i) => {
          const accent = sectionCardAccents[i % sectionCardAccents.length];
          const cmdCount = section.groups.reduce((a, g) => a + g.commands.length, 0);
          return (
            <Link
              key={section.id}
              href={`/${section.slug}`}
              className="color-panel rounded-md p-4 transition hover:border-core/40"
            >
              <Shield size={18} className={`mb-2 ${accent.icon}`} />
              <p className={`font-heading text-lg ${accent.title}`}>{section.title}</p>
              <p className={`text-sm ${accent.meta}`}>
                <span className="text-violet/90">{section.groups.length}</span> groups ·{" "}
                <span className="text-core/90">{cmdCount}</span> commands
              </p>
            </Link>
          );
        })}
      </section>

      <p className="font-mono text-sm">
        <span className="text-warn">Tip:</span> <span className="text-dim">Press</span>{" "}
        <span className="text-gradient-mono">Ctrl+K</span> <span className="text-dim">for global command search.</span>
      </p>
    </div>
  );
}
