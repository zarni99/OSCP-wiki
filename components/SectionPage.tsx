"use client";

import { useMemo, useState } from "react";
import CommandCard from "@/components/CommandCard";
import { Section, Tag } from "@/lib/commands";

const filters: { label: string; value: Tag | "all-tags" }[] = [
  { label: "All", value: "all-tags" },
  { label: "Linux", value: "linux" },
  { label: "Windows", value: "windows" },
  { label: "AD", value: "ad" },
  { label: "Web", value: "web" },
];

export default function SectionPage({ section }: { section: Section }) {
  const [tag, setTag] = useState<Tag | "all-tags">("all-tags");
  const [query, setQuery] = useState("");

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
  }, [query, section.groups, tag]);

  const visibleCount = filteredGroups.reduce((sum, group) => sum + group.commands.length, 0);
  const sectionAccent =
    section.slug.includes("ad") || section.id.includes("ad")
      ? "text-adblue border-adblue/40 bg-adblue/10"
      : section.slug.includes("web") || section.slug.includes("api")
        ? "text-post border-post/40 bg-post/10"
        : section.slug.includes("post") || section.slug.includes("tunnel") || section.slug.includes("loot")
          ? "text-orange border-orange/40 bg-orange/10"
          : section.slug.includes("custom") || section.slug.includes("workflow") || section.slug.includes("my-commands")
            ? "text-custom border-custom/40 bg-custom/10"
            : "text-core border-core/40 bg-core/10";

  return (
    <div className="space-y-6">
      <header className="color-panel flex flex-wrap items-center gap-3 rounded-md p-4">
        <h1 className="font-heading text-3xl text-gradient-brand">{section.title}</h1>
        <span className={`rounded-full border px-2.5 py-1 font-mono text-xs ${sectionAccent}`}>{visibleCount} commands</span>
      </header>

      <div className="color-panel flex flex-wrap gap-2 rounded-md p-3">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setTag(f.value)}
            className={`rounded-full border px-3 py-1 font-mono text-xs uppercase ${
              tag === f.value ? "border-violet bg-violet/10 text-violet" : "border-border bg-surface2 text-dim hover:text-bright"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter commands in this section..."
        className="w-full rounded-md border border-violet/40 bg-surface px-3 py-2 text-success outline-none focus:border-core"
        spellCheck={false}
        autoComplete="off"
      />

      <div className="space-y-8">
        {filteredGroups.map((group) => (
          <section key={group.title} className="color-panel space-y-3 rounded-md p-3">
            <h2 className="font-mono text-sm uppercase tracking-wide">
              <span className="text-core">▶</span>{" "}
              <span className="text-violet">{group.title}</span>
            </h2>
            <div className="space-y-3">
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
