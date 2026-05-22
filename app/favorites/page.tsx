"use client";

import { Download, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import CommandCard from "@/components/CommandCard";
import { useVariables } from "@/components/VariablesProvider";
import { getAllCommands } from "@/lib/commands";
import { Tag } from "@/lib/commands";
import { applyVariables } from "@/lib/variables";

const allCommands = getAllCommands();

const tagFilters: { label: string; value: Tag | "all-tags" }[] = [
  { label: "All", value: "all-tags" },
  { label: "Linux", value: "linux" },
  { label: "Windows", value: "windows" },
  { label: "AD", value: "ad" },
  { label: "Web", value: "web" },
];

export default function FavoritesPage() {
  const { favorites, values } = useVariables();
  const [tag, setTag] = useState<Tag | "all-tags">("all-tags");
  const [query, setQuery] = useState("");

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCommands
      .filter((cmd) => favorites.includes(cmd.id))
      .filter((cmd) => tag === "all-tags" || cmd.tags.includes(tag) || cmd.tags.includes("all"))
      .filter((cmd) => !q || `${cmd.cmd} ${cmd.description}`.toLowerCase().includes(q));
  }, [favorites, tag, query]);

  // Group by section
  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const cmd of items) {
      const key = cmd.section;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(cmd);
    }
    return Array.from(map.entries());
  }, [items]);

  const exportMarkdown = () => {
    const varSummary = Object.entries(values)
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `| ${k} | \`${v}\` |`)
      .join("\n");

    const sections = grouped
      .map(([sectionName, cmds]) => {
        const cmdLines = cmds
          .map((cmd) => {
            const rendered = applyVariables(cmd.cmd, values);
            const lines = [`### ${cmd.description || cmd.cmd}`, `\`\`\``, rendered, `\`\`\``];
            if (rendered !== cmd.cmd) lines.push(`> Template: \`${cmd.cmd}\``);
            if (cmd.tip) lines.push(`> 💡 ${cmd.tip}`);
            return lines.join("\n");
          })
          .join("\n\n");
        return `## ${sectionName}\n\n${cmdLines}`;
      })
      .join("\n\n---\n\n");

    const header = [
      `# OSCP Cheatsheet — ${items.length} commands`,
      `> Generated ${new Date().toLocaleString()}`,
      varSummary
        ? `\n## Active Variables\n\n| Variable | Value |\n|---|---|\n${varSummary}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const md = `${header}\n\n---\n\n${sections}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oscp-cheatsheet-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`Exported ${items.length} commands as Markdown`);
  };

  const exportText = () => {
    const lines = grouped.flatMap(([sectionName, cmds]) => [
      `\n═══ ${sectionName.toUpperCase()} ═══\n`,
      ...cmds.map((cmd) => {
        const rendered = applyVariables(cmd.cmd, values);
        return `# ${cmd.description}\n${rendered}\n`;
      }),
    ]);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oscp-cheatsheet-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast.success(`Exported ${items.length} commands as plain text`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="font-heading text-3xl text-bright">Favorites</h1>
        <span className="rounded border border-orange/40 bg-orange/10 px-2.5 py-1 font-mono text-xs text-orange">
          {items.length} saved
        </span>
        {items.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-[10px] text-dim/60 font-mono sm:inline">export cheatsheet →</span>
            <button
              onClick={exportMarkdown}
              title="Export as Markdown with variables substituted"
              className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-mono text-xs text-dim hover:border-violet/50 hover:text-violet transition"
            >
              <FileText size={12} /> MD
            </button>
            <button
              onClick={exportText}
              title="Export as plain text"
              className="inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 font-mono text-xs text-dim hover:border-violet/50 hover:text-violet transition"
            >
              <Download size={12} /> TXT
            </button>
          </div>
        )}
      </header>

      {favorites.length === 0 ? (
        <p className="text-sm text-dim">No favorites yet. Click the ★ on any command card.</p>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {tagFilters.map((f) => (
              <button
                key={f.value}
                onClick={() => setTag(f.value)}
                className={`rounded border px-3 py-1 font-mono text-xs uppercase transition-colors ${
                  tag === f.value
                    ? "border-orange/60 bg-orange/10 text-orange"
                    : "border-border bg-surface2 text-dim hover:text-bright"
                }`}
              >
                {f.label}
              </button>
            ))}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter favorites..."
              className="ml-auto rounded border border-border bg-surface px-3 py-1 font-mono text-sm text-bright outline-none placeholder:text-dim focus:border-orange/50"
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-dim">No favorites match this filter.</p>
          ) : (
            <div className="space-y-8">
              {grouped.map(([sectionName, cmds]) => (
                <div key={sectionName}>
                  <div className="mb-3 border-b border-border pb-1">
                    <p className="font-mono text-xs uppercase tracking-widest text-dim">{sectionName}</p>
                  </div>
                  <div className="space-y-2">
                    {cmds.map((cmd) => (
                      <div key={cmd.id}>
                        <p className="mb-1 font-mono text-[10px] text-dim/60">{cmd.group}</p>
                        <CommandCard command={cmd} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
