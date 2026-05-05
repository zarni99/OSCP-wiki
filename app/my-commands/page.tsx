"use client";

import { useState } from "react";
import CommandCard from "@/components/CommandCard";
import { useVariables } from "@/components/VariablesProvider";
import { Tag } from "@/lib/commands";

const tags: Tag[] = ["linux", "windows", "ad", "web", "all"];

export default function MyCommandsPage() {
  const { customCommands, addCustomCommand, removeCustomCommand } = useVariables();
  const [cmd, setCmd] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>(["all"]);

  const toggleTag = (tag: Tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((v) => v !== tag) : [...prev, tag]));
  };

  return (
    <div className="space-y-5">
      <header className="color-panel rounded-md p-4">
        <h1 className="font-heading text-3xl text-gradient-brand">My Commands</h1>
        <p className="text-sm">
          <span className="text-violet">Save</span> <span className="text-dim">your own commands and</span>{" "}
          <span className="text-success">payload</span> <span className="text-dim">snippets.</span>
        </p>
      </header>

      <section className="color-panel rounded-md p-4">
        <div className="space-y-3">
          <textarea
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder="Command template, e.g. crackmapexec smb {RHOST} -u {USER} -p {PASS}"
            className="min-h-20 w-full rounded border border-violet/40 bg-surface2 px-3 py-2 font-mono text-sm text-success outline-none focus:border-core"
            spellCheck={false}
            autoComplete="off"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            className="w-full rounded border border-violet/40 bg-surface2 px-3 py-2 text-sm text-bright outline-none focus:border-violet"
            spellCheck={false}
            autoComplete="off"
          />
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`rounded border px-2 py-1 font-mono text-xs uppercase ${
                  selectedTags.includes(tag) ? "border-core bg-core/10 text-core" : "border-border bg-surface2 text-dim hover:border-violet/40"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              if (!cmd.trim()) return;
              addCustomCommand({
                cmd: cmd.trim(),
                description: description.trim() || "Custom command",
                tags: selectedTags.length ? selectedTags : ["all"],
              });
              setCmd("");
              setDescription("");
              setSelectedTags(["all"]);
            }}
            className="rounded border border-core bg-gradient-to-r from-core/15 to-violet/10 px-3 py-1.5 font-mono text-xs text-core hover:border-core/80"
          >
            Save Command
          </button>
        </div>
      </section>

      <section className="space-y-3">
        {customCommands.map((command) => (
          <div key={command.id}>
            <div className="mb-1 flex items-center justify-between">
              <p className="text-xs text-dim">Custom</p>
              <button onClick={() => removeCustomCommand(command.id)} className="text-xs text-danger hover:underline">
                Delete
              </button>
            </div>
            <CommandCard command={command} />
          </div>
        ))}
        {customCommands.length === 0 ? <p className="text-sm text-dim">No custom commands saved yet.</p> : null}
      </section>
    </div>
  );
}
