"use client";

import { Check, Copy, Star } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Command } from "@/lib/commands";
import { useVariables } from "@/components/VariablesProvider";
import { applyVariables, missingVariables } from "@/lib/variables";

const tagStyles: Record<string, string> = {
  linux: "bg-success/15 text-success border-success/50",
  windows: "bg-core/15 text-core border-core/50",
  ad: "bg-adblue/15 text-adblue border-adblue/50",
  web: "bg-post/15 text-post border-post/50",
  all: "bg-dim/20 text-bright border-border",
};

export default function CommandCard({ command }: { command: Command }) {
  const [copied, setCopied] = useState(false);
  const { values, copyMode, toggleFavorite, isFavorite, pushHistory } = useVariables();
  const rendered = applyVariables(command.cmd, values);
  const missing = missingVariables(command.cmd, values);
  const favorite = isFavorite(command.id);
  const primaryTag = command.tags.find((tag) => tag !== "all") || "all";
  const accentColor =
    primaryTag === "linux" ? "bg-success" : primaryTag === "windows" ? "bg-core" : primaryTag === "ad" ? "bg-adblue" : primaryTag === "web" ? "bg-post" : "bg-cyan";

  const onCopy = async () => {
    const copiedCmd = copyMode === "template" ? command.cmd : rendered;
    await navigator.clipboard.writeText(copiedCmd);
    pushHistory({ id: command.id, cmd: copiedCmd });
    setCopied(true);
    toast.success(copyMode === "template" ? "Copied template!" : "Copied rendered command!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="color-panel group relative rounded-md p-4 pl-5 hover:border-violet/70">
      <div className={`absolute left-0 top-0 h-full w-[2px] rounded-l-md ${accentColor}`} />
      <button
        onClick={onCopy}
        className="absolute right-3 top-3 inline-flex items-center gap-1 rounded border border-border bg-surface px-2 py-1 text-xs text-dim hover:border-violet hover:text-violet"
      >
        {copied ? <Check size={12} /> : <Copy size={12} />}
        {copied ? "OK" : "COPY"}
      </button>
      <button
        onClick={() => toggleFavorite(command.id)}
        className={`absolute right-24 top-3 inline-flex items-center rounded border px-2 py-1 text-xs ${favorite ? "border-orange text-orange" : "border-border text-dim hover:text-orange"}`}
      >
        <Star size={12} className={favorite ? "fill-orange" : ""} />
      </button>
      <p className="pr-20 font-mono text-sm leading-relaxed text-success break-all select-text">{rendered}</p>
      {rendered !== command.cmd ? (
        <p className="mt-1 font-mono text-[11px]">
          <span className="text-post">template:</span> <span className="text-dim">{command.cmd}</span>
        </p>
      ) : null}
      <p className="mt-2 text-sm italic text-adblue/90">{command.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {command.tags.map((tag) => (
          <span key={`${command.id}-${tag}`} className={`rounded border px-2 py-0.5 font-mono text-xs uppercase ${tagStyles[tag]}`}>
            {tag}
          </span>
        ))}
        {missing.length > 0 ? (
          <span className="rounded border border-danger/50 bg-danger/10 px-2 py-0.5 font-mono text-xs uppercase text-danger">
            missing: {missing.join(",")}
          </span>
        ) : null}
      </div>
    </article>
  );
}
