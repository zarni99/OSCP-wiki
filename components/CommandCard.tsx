"use client";

import { Check, Copy, Lightbulb, Star } from "lucide-react";
import { useState } from "react";

const VAR_RE_OUTER = /(\{[A-Z0-9_]+\})/g;
import toast from "react-hot-toast";
import { Command } from "@/lib/commands";
import { useVariables } from "@/components/VariablesProvider";
import { applyVariables, missingVariables } from "@/lib/variables";

const VAR_RE = /(\{[A-Z0-9_]+\})/g;

/** Splits a string into text segments and {VAR} tokens. */
function tokenize(text: string): Array<{ value: string; isVar: boolean }> {
  const parts = text.split(VAR_RE);
  return parts.map((part) => ({ value: part, isVar: VAR_RE.test(part) }));
}

/**
 * Renders command text with inline variable highlighting.
 * - Unfilled {VARS} → amber
 * - Normal text  → inherits parent color (terminal green or dim)
 */
function CommandText({
  text,
  baseClass,
  varClass,
}: {
  text: string;
  baseClass: string;
  varClass: string;
}) {
  const tokens = tokenize(text);
  return (
    <>
      {tokens.map((tok, i) =>
        tok.isVar ? (
          <span key={i} className={varClass}>
            {tok.value}
          </span>
        ) : (
          <span key={i} className={baseClass}>
            {tok.value}
          </span>
        ),
      )}
    </>
  );
}

const tagStyles: Record<string, string> = {
  linux:   "bg-success/15 text-success border-success/40",
  windows: "bg-core/15 text-core border-core/40",
  ad:      "bg-adblue/15 text-adblue border-adblue/40",
  web:     "bg-post/15 text-post border-post/40",
  all:     "bg-dim/10 text-dim border-border",
};

const accentColors: Record<string, string> = {
  linux:   "bg-success",
  windows: "bg-core",
  ad:      "bg-adblue",
  web:     "bg-post",
  all:     "bg-dim/40",
};

export default function CommandCard({ command }: { command: Command }) {
  const [copied, setCopied] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const { values, copyMode, toggleFavorite, isFavorite, pushHistory } = useVariables();

  const rendered = applyVariables(command.cmd, values);
  const missing  = missingVariables(command.cmd, values);
  const favorite = isFavorite(command.id);
  const primaryTag  = command.tags.find((t) => t !== "all") || "all";
  const accentColor = accentColors[primaryTag] ?? "bg-dim/40";
  const hasVars     = VAR_RE.test(command.cmd);
  // Reset lastIndex after the .test() call above so future uses of the regex work
  VAR_RE.lastIndex = 0;

  const onCopy = async () => {
    const copiedCmd = copyMode === "template" ? command.cmd : rendered;
    try {
      await navigator.clipboard.writeText(copiedCmd);
      pushHistory({ id: command.id, cmd: copiedCmd });
      setCopied(true);
      toast.success(copyMode === "template" ? "Copied template!" : "Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Clipboard access denied");
    }
  };

  return (
    <article className="group flex overflow-hidden rounded border border-border bg-surface transition-colors hover:border-orange/40">
      {/* Category accent bar */}
      <div className={`w-[3px] shrink-0 ${accentColor}`} />

      <div className="min-w-0 flex-1 p-4">

        {/* ── Command text — click anywhere to copy ── */}
        <div
          role="button"
          tabIndex={0}
          onClick={onCopy}
          onKeyDown={(e) => e.key === "Enter" && onCopy()}
          title={`Click to copy${hasVars ? (copyMode === "template" ? " template" : " rendered") : ""}`}
          className="group/cmd cursor-pointer select-text rounded px-1 py-0.5 -mx-1 -my-0.5 transition-colors hover:bg-orange/5"
        >
          <p className="break-all font-mono text-sm leading-relaxed">
            <CommandText
              text={rendered}
              baseClass="text-success"
              varClass="text-orange font-semibold"
            />
          </p>
        </div>

        {/* Template line — shown only when variables are filled in */}
        {rendered !== command.cmd ? (
          <p className="mt-1 break-all font-mono text-[11px]">
            <span className="text-post/60">tmpl: </span>
            <CommandText
              text={command.cmd}
              baseClass="text-dim"
              varClass="text-orange/70"
            />
          </p>
        ) : null}

        {/* Description + optional tip toggle */}
        <div className="mt-2 flex items-start gap-2">
          <p className="flex-1 text-sm leading-snug text-dim">{command.description}</p>
          {command.tip ? (
            <button
              type="button"
              onClick={() => setTipOpen((v) => !v)}
              title={tipOpen ? "Hide tip" : "Show tip"}
              className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9px] transition-colors ${
                tipOpen
                  ? "border-orange/50 bg-orange/10 text-orange"
                  : "border-border text-dim/50 hover:border-orange/40 hover:text-orange/70"
              }`}
            >
              <Lightbulb size={9} className="inline" /> tip
            </button>
          ) : null}
        </div>

        {/* Tip body — revealed on toggle */}
        {command.tip && tipOpen ? (
          <p className="mt-2 flex items-start gap-2 rounded border border-orange/20 bg-orange/5 px-2.5 py-1.5 text-xs text-dim/80">
            <Lightbulb size={11} className="mt-0.5 shrink-0 text-orange/60" />
            {command.tip}
          </p>
        ) : null}

        {/* Footer: tags left, star + copy right */}
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {command.tags.map((tag) => (
              <span
                key={`${command.id}-${tag}`}
                className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${tagStyles[tag] ?? "bg-dim/10 text-dim border-border"}`}
              >
                {tag}
              </span>
            ))}
            {missing.length > 0 ? (
              <span className="rounded border border-orange/50 bg-orange/10 px-1.5 py-0.5 font-mono text-[10px] uppercase text-orange">
                needs: {missing.join(", ")}
              </span>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => toggleFavorite(command.id)}
              title={favorite ? "Remove favorite" : "Add to favorites"}
              className={`rounded border px-2 py-1 transition-colors ${
                favorite
                  ? "border-orange/60 text-orange"
                  : "border-border text-dim hover:border-orange/40 hover:text-orange"
              }`}
            >
              <Star size={11} className={favorite ? "fill-orange" : ""} />
            </button>

            <button
              onClick={onCopy}
              title={copyMode === "template" ? "Copy template (with {VARS})" : "Copy rendered command"}
              className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[11px] transition-colors ${
                copied
                  ? "border-success/60 bg-success/10 text-success"
                  : "border-border text-dim hover:border-orange/40 hover:text-orange"
              }`}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
              {copied ? "OK" : copyMode === "template" ? "COPY TMPL" : "COPY"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
