"use client";

import { useMemo, useRef, useState } from "react";
import CommandCard from "@/components/CommandCard";
import { Section, Tag } from "@/lib/commands";

const filters: { label: string; value: Tag | "all-tags" }[] = [
  { label: "All", value: "all-tags" },
  { label: "Linux", value: "linux" },
  { label: "Windows", value: "windows" },
  { label: "AD", value: "ad" },
  { label: "Web", value: "web" },
];

const sectionAccentMap: Record<string, string> = {
  ad:      "text-adblue border-adblue/40 bg-adblue/10",
  web:     "text-post border-post/40 bg-post/10",
  api:     "text-post border-post/40 bg-post/10",
  post:    "text-warn border-warn/40 bg-warn/10",
  tunnel:  "text-warn border-warn/40 bg-warn/10",
  loot:    "text-warn border-warn/40 bg-warn/10",
  custom:  "text-custom border-custom/40 bg-custom/10",
  workflow:"text-custom border-custom/40 bg-custom/10",
};

function getSectionAccent(slug: string, id: string): string {
  for (const [key, cls] of Object.entries(sectionAccentMap)) {
    if (slug.includes(key) || id.includes(key)) return cls;
  }
  return "text-core border-core/40 bg-core/10";
}

function groupId(title: string) {
  return `group-${title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`;
}

function scrollToGroup(title: string) {
  const el = document.getElementById(groupId(title));
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function SectionPage({ section }: { section: Section }) {
  const [tag, setTag] = useState<Tag | "all-tags">("all-tags");
  const [query, setQuery] = useState("");
  const [jumpOpen, setJumpOpen] = useState(false);
  const jumpRef = useRef<HTMLDivElement>(null);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return section.groups
      .map((group) => ({
        ...group,
        commands: group.commands.filter((command) => {
          const tagMatch = tag === "all-tags" ? true : command.tags.includes(tag) || command.tags.includes("all");
          const textMatch = q.length === 0 ? true : `${command.cmd} ${command.description}`.toLowerCase().includes(q);
          return tagMatch && textMatch;
        }),
      }))
      .filter((group) => group.commands.length > 0);
  }, [query, section, tag]);

  const visibleCount = filteredGroups.reduce((sum, group) => sum + group.commands.length, 0);
  const sectionAccent = getSectionAccent(section.slug, section.id);
  const showJump = filteredGroups.length >= 4;

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-3 border-b border-border pb-3">
        <h1 className="font-heading text-3xl text-bright">{section.title}</h1>
        <span className={`rounded border px-2.5 py-1 font-mono text-xs ${sectionAccent}`}>{visibleCount} commands</span>
      </header>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Tag filters */}
        {filters.map((f) => (
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

        {/* Search — inline right of filters */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter…"
          className="ml-auto w-44 rounded border border-border bg-surface px-3 py-1 font-mono text-xs text-bright outline-none placeholder:text-dim/50 focus:border-orange/50 focus:w-64 transition-all"
          spellCheck={false}
          autoComplete="off"
        />

        {/* Jump nav — only shown when 4+ groups are visible */}
        {showJump && (
          <div className="relative" ref={jumpRef}>
            <button
              onClick={() => setJumpOpen((v) => !v)}
              className={`rounded border px-3 py-1 font-mono text-xs uppercase transition-colors ${
                jumpOpen ? "border-orange/60 bg-orange/10 text-orange" : "border-border text-dim hover:text-bright"
              }`}
            >
              ↓ Group
            </button>
            {jumpOpen && (
              <div className="absolute right-0 top-full z-30 mt-1 min-w-[220px] rounded border border-border bg-surface shadow-xl">
                {filteredGroups.map((group) => (
                  <button
                    key={group.title}
                    onClick={() => { scrollToGroup(group.title); setJumpOpen(false); }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-surface2"
                  >
                    <span className="font-mono text-xs text-bright">{group.title}</span>
                    <span className="font-mono text-[10px] text-dim">{group.commands.length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Command groups */}
      <div className="space-y-6">
        {filteredGroups.map((group) => (
          <section key={group.title} id={groupId(group.title)} className="scroll-mt-16 space-y-2">
            <div className="border-b border-border pb-2">
              <h2 className="font-mono text-sm uppercase tracking-wide">
                <span className="text-orange">▶</span>{" "}
                <span className="text-bright">{group.title}</span>
                <span className="ml-2 font-mono text-[10px] text-dim/60">{group.commands.length}</span>
              </h2>
              {group.subtitle ? (
                <p className="ml-5 mt-0.5 text-xs text-dim">{group.subtitle}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              {group.commands.map((command) => (
                <CommandCard key={command.id} command={command} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
