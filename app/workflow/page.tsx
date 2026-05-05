"use client";

import { useEffect, useMemo, useState } from "react";
import { useVariables } from "@/components/VariablesProvider";

const stages = ["Recon", "Initial Foothold", "PrivEsc", "Proof", "Reported"];
const key = "oscp-machine-workflow";

export default function WorkflowPage() {
  const { machines, activeMachineId, setActiveMachineId, removeMachine, timeline, clearTimeline } = useVariables();
  const [state, setState] = useState<Record<string, Record<string, boolean>>>({});

  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (raw) setState(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [state]);

  const activeTimeline = useMemo(
    () => timeline.filter((entry) => entry.machineId === activeMachineId).slice(0, 100),
    [activeMachineId, timeline],
  );
  const activeWorkflow = state[activeMachineId] || {};
  const done = stages.filter((s) => activeWorkflow[s]).length;
  const suggestion = useMemo(() => {
    const latest = activeTimeline[0]?.cmd.toLowerCase() || "";
    if (latest.includes("nmap") || latest.includes("enum4linux") || latest.includes("ffuf")) return "Recon";
    if (latest.includes("shell") || latest.includes("evil-winrm") || latest.includes("psexec")) return "Initial Foothold";
    if (latest.includes("linpeas") || latest.includes("winpeas") || latest.includes("printspoofer") || latest.includes("sudo -l")) return "PrivEsc";
    if (latest.includes("local.txt") || latest.includes("proof.txt")) return "Proof";
    return null;
  }, [activeTimeline]);

  const exportMarkdown = async () => {
    const machine = machines.find((m) => m.id === activeMachineId);
    const lines = [
      `# Workflow Timeline - ${machine?.name || activeMachineId}`,
      "",
      "## Stage Progress",
      ...stages.map((stage) => `- [${activeWorkflow[stage] ? "x" : " "}] ${stage}`),
      "",
      "## Commands",
      ...activeTimeline.map((entry) => `- ${new Date(entry.at).toLocaleString()} \`${entry.cmd}\``),
      "",
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
  };

  return (
    <div className="space-y-5">
      <header className="color-panel rounded-md p-4">
        <h1 className="font-heading text-3xl text-gradient-brand">Machine Workflow Board</h1>
        <p className="text-sm text-dim">
          Track each machine from <span className="text-core">recon</span> to <span className="text-post">report</span> and keep a{" "}
          <span className="text-success">command timeline</span>.
        </p>
      </header>

      <section className="color-panel rounded-md p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {machines.map((machine) => (
            <button
              key={machine.id}
              onClick={() => setActiveMachineId(machine.id)}
              className={`rounded border px-3 py-1 text-sm ${machine.id === activeMachineId ? "border-core bg-core/10 text-core" : "border-border bg-surface2 text-dim hover:border-violet/40"}`}
            >
              {machine.name}
            </button>
          ))}
        </div>
        <div className="mb-3 text-sm text-dim">{done}/{stages.length} stages complete</div>
        {suggestion ? (
          <div className="mb-3 flex items-center justify-between rounded border border-core/50 bg-core/10 px-3 py-2 text-xs">
            <span className="text-core">Suggested stage based on recent activity: {suggestion}</span>
            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  [activeMachineId]: {
                    ...(prev[activeMachineId] || {}),
                    [suggestion]: true,
                  },
                }))
              }
              className="rounded border border-core bg-core/10 px-2 py-1 text-core hover:border-core/80"
            >
              Mark Done
            </button>
          </div>
        ) : null}
        <div className="grid gap-2 md:grid-cols-5">
          {stages.map((stage) => {
            const checked = !!activeWorkflow[stage];
            return (
              <button
                key={stage}
                onClick={() =>
                  setState((prev) => ({
                    ...prev,
                    [activeMachineId]: {
                      ...(prev[activeMachineId] || {}),
                      [stage]: !(prev[activeMachineId] || {})[stage],
                    },
                  }))
                }
                className={`rounded border px-3 py-3 text-left ${checked ? "border-success/50 bg-success/10 text-success" : "border-border bg-surface2 text-bright hover:border-violet/40"}`}
              >
                {stage}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => removeMachine(activeMachineId)}
            className="rounded border border-danger/50 bg-danger/10 px-2 py-1 text-xs text-danger"
          >
            Remove Machine
          </button>
          <button onClick={clearTimeline} className="rounded border border-border bg-surface2 px-2 py-1 text-xs text-dim hover:border-violet/40">
            Clear Timeline
          </button>
          <button onClick={exportMarkdown} className="rounded border border-border bg-surface2 px-2 py-1 text-xs text-dim hover:border-violet/40 hover:text-violet">
            Copy Timeline Markdown
          </button>
        </div>
      </section>

      <section className="color-panel rounded-md p-4">
        <h2 className="mb-2 font-mono text-sm text-violet">Command Timeline ({activeTimeline.length})</h2>
        <div className="max-h-[50vh] space-y-2 overflow-auto">
          {activeTimeline.length === 0 ? <p className="text-sm text-dim">No command activity for this machine yet.</p> : null}
          {activeTimeline.map((entry, idx) => (
            <div key={`${entry.id}-${entry.at}-${idx}`} className="rounded border border-border bg-surface2 p-2 hover:border-violet/40">
              <div className="mb-1 flex items-center justify-between text-[11px] text-dim">
                <span>{entry.machineName}</span>
                <span>{new Date(entry.at).toLocaleTimeString()}</span>
              </div>
              <p className="break-all font-mono text-xs text-success">{entry.cmd}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
