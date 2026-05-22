"use client";

import { ArrowDown, ArrowUp, Camera, Plus, Trash2, X } from "lucide-react";
import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";
import { ExploitStep, emptyStep, generateId } from "./types";
import { compressImage } from "./utils";
import MarkdownEditor from "./MarkdownEditor";

interface Props {
  steps: ExploitStep[];
  onChange: (next: ExploitStep[]) => void;
  /** Accent color class (e.g. "text-post" for exploitation, "text-success" for privesc). */
  accent?: string;
}

/**
 * Editor for an ordered list of exploit/privesc steps.
 * Each step has:
 *   - title  (one-line summary, e.g. "Discovered SQL injection in /login")
 *   - description (markdown — context, screenshots inline)
 *   - command (monospace text — rendered as a code block in PDF)
 *   - output  (monospace text — rendered as a code block in PDF)
 *   - screenshot (single image attached to the step, rendered with caption)
 *
 * Output in the PDF: "Step N: title" headers with figure cross-references.
 * The first step is always expanded; others are collapsible.
 */
export default function StepEditor({ steps, onChange, accent = "text-orange" }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const isOpen = (s: ExploitStep) => {
    if (expanded[s.id] !== undefined) return expanded[s.id];
    // Expand by default only if the step has no title yet (freshly created or incomplete).
    // Explicitly added steps are expanded via setExpanded in addStep, so this only
    // affects steps loaded from storage.
    return !s.title;
  };

  const toggle = (id: string) =>
    setExpanded((p) => ({ ...p, [id]: !(p[id] ?? true) }));

  const updateStep = (id: string, patch: Partial<ExploitStep>) => {
    onChange(steps.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addStep = () => {
    const fresh = emptyStep();
    onChange([...steps, fresh]);
    setExpanded((p) => ({ ...p, [fresh.id]: true }));
  };

  const removeStep = (id: string) => {
    const step = steps.find((s) => s.id === id);
    const hasContent = step && (step.title || step.command || step.description || step.output || step.screenshot);
    if (hasContent && !confirm("Remove this step?")) return;
    onChange(steps.filter((s) => s.id !== id));
  };

  const moveStep = (idx: number, dir: -1 | 1) => {
    const next = [...steps];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const handleScreenshot = async (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const dataUrl = await compressImage(file);
      updateStep(id, {
        screenshot: { id: generateId(), name: file.name, dataUrl, caption: "" },
      });
    } catch {
      toast.error("Could not process image");
    }
  };

  if (steps.length === 0) {
    return (
      <div className="rounded border border-dashed border-border bg-surface2/30 p-6 text-center">
        <p className="font-mono text-xs text-dim mb-2">No steps yet.</p>
        <button
          type="button"
          onClick={addStep}
          className={`inline-flex items-center gap-1.5 rounded border border-orange/40 bg-orange/10 px-3 py-1.5 font-mono text-xs text-orange hover:bg-orange/15`}
        >
          <Plus size={11} /> Add first step
        </button>
        <p className="mt-2 font-mono text-[10px] text-dim/60">
          Or use the free-form markdown box below for an unstructured walkthrough.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {steps.map((step, idx) => {
        const open = isOpen(step);
        return (
          <div key={step.id} className="rounded border border-border bg-surface/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-3 py-2 bg-surface2/50">
              <span className={`shrink-0 font-mono text-xs font-bold ${accent}`}>
                Step {idx + 1}
              </span>
              <button
                type="button"
                onClick={() => toggle(step.id)}
                className="flex-1 min-w-0 text-left"
              >
                <input
                  value={step.title}
                  onChange={(e) => updateStep(step.id, { title: e.target.value })}
                  placeholder="Step title (e.g. Discovered SQL injection in login form)"
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent font-mono text-xs text-bright placeholder:text-dim/50 outline-none"
                />
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveStep(idx, -1)}
                  disabled={idx === 0}
                  title="Move up"
                  aria-label="Move step up"
                  className="text-dim hover:text-bright disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                >
                  <ArrowUp size={11} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => moveStep(idx, 1)}
                  disabled={idx === steps.length - 1}
                  title="Move down"
                  aria-label="Move step down"
                  className="text-dim hover:text-bright disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                >
                  <ArrowDown size={11} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => removeStep(step.id)}
                  title="Remove step"
                  aria-label="Remove step"
                  className="text-dim hover:text-red p-0.5"
                >
                  <Trash2 size={11} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => toggle(step.id)}
                  className="font-mono text-[10px] text-dim hover:text-bright px-1"
                >
                  {open ? "−" : "+"}
                </button>
              </div>
            </div>

            {open && (
              <div className="border-t border-border p-3 space-y-3">
                {/* Description (markdown) */}
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-dim">Description</p>
                  <MarkdownEditor
                    value={step.description}
                    onChange={(next) => updateStep(step.id, { description: next })}
                    placeholder="What did you do, why, and what was the result? Paste screenshots inline."
                    minHeight={80}
                  />
                </div>

                {/* Command + Output side by side */}
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-dim">Command</p>
                    <textarea
                      value={step.command}
                      onChange={(e) => updateStep(step.id, { command: e.target.value })}
                      placeholder="$ exploit_command --target 10.10.10.X"
                      className="w-full resize-y rounded border border-violet/30 bg-surface px-3 py-2 font-mono text-xs text-success outline-none focus:border-core/60 placeholder:text-dim/50"
                      style={{ minHeight: 70 }}
                      spellCheck={false}
                    />
                  </div>
                  <div>
                    <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-dim">Output (optional)</p>
                    <textarea
                      value={step.output}
                      onChange={(e) => updateStep(step.id, { output: e.target.value })}
                      placeholder="Command output, error messages, response..."
                      className="w-full resize-y rounded border border-violet/30 bg-surface px-3 py-2 font-mono text-xs text-bright outline-none focus:border-core/60 placeholder:text-dim/50"
                      style={{ minHeight: 70 }}
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Screenshot */}
                <div>
                  <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-dim">Screenshot (optional)</p>
                  {step.screenshot ? (
                    <div className="relative inline-block">
                      <img src={step.screenshot.dataUrl} alt="" className="max-h-40 rounded border border-border" />
                      <button
                        type="button"
                        onClick={() => updateStep(step.id, { screenshot: null })}
                        className="absolute top-1 right-1 rounded bg-bg/80 p-0.5 text-red hover:bg-bg"
                      >
                        <X size={11} />
                      </button>
                      <input
                        value={step.screenshot.caption}
                        onChange={(e) =>
                          updateStep(step.id, {
                            screenshot: step.screenshot ? { ...step.screenshot, caption: e.target.value } : null,
                          })
                        }
                        placeholder="Figure caption..."
                        className="mt-1 w-full rounded border border-border bg-surface px-2 py-1 text-xs text-bright placeholder:text-dim/50 outline-none focus:border-violet/60"
                        spellCheck={false}
                      />
                    </div>
                  ) : (
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded border border-dashed border-violet/40 px-3 py-1.5 font-mono text-[10px] text-dim hover:text-violet hover:border-violet">
                      <Camera size={11} /> Attach screenshot
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleScreenshot(step.id, e)}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addStep}
        className={`inline-flex items-center gap-1.5 rounded border border-dashed border-orange/40 px-3 py-1.5 font-mono text-xs text-dim hover:text-orange hover:border-orange transition-colors`}
      >
        <Plus size={11} /> Add step
      </button>
    </div>
  );
}
