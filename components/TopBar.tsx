"use client";

import { Check, Copy, History, Pin, PinOff, Plus, Save, Search, SlidersHorizontal, Trash2, X } from "lucide-react";
import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import CommandCard from "@/components/CommandCard";
import { getAllCommands } from "@/lib/commands";
import { useVariables } from "@/components/VariablesProvider";
import { applyVariables } from "@/lib/variables";

const variableGroups = [
  { title: "Network", keys: ["LHOST", "RHOST", "LPORT", "RPORT"], titleClass: "text-core" },
  { title: "Domain", keys: ["DOMAIN", "DC"], titleClass: "text-adblue" },
  { title: "Auth", keys: ["USER", "PASS", "HASH"], titleClass: "text-post" },
  { title: "Web", keys: ["URL"], titleClass: "text-violet" },
];

const NOTES_KEY = "oscp-machine-notes";

function SearchResults({
  results,
  values,
  onClose,
}: {
  results: ReturnType<typeof getAllCommands>;
  values: Record<string, string>;
  onClose: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = async (cmd: string, id: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopiedId(id);
      toast.success("Copied!");
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error("Clipboard access denied");
    }
  };

  return (
    <div className="absolute mt-1 max-h-[70vh] w-full overflow-auto rounded border border-border bg-surface shadow-2xl z-50">
      <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface px-3 py-1.5">
        <span className="font-mono text-[10px] text-dim">{results.length} result{results.length !== 1 ? "s" : ""} · click to copy</span>
        <button onClick={onClose} className="text-dim hover:text-bright"><X size={12} /></button>
      </div>
      <div className="divide-y divide-border/50">
        {results.map((result) => {
          const rendered = applyVariables(result.cmd, values);
          const isSubstituted = rendered !== result.cmd;
          const isCopied = copiedId === result.id;
          return (
            <button
              key={result.id}
              onClick={() => copy(rendered, result.id)}
              className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-surface2 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 font-mono text-[10px] text-dim/60">
                  <span className="text-core/80">{result.section}</span>
                  <span className="text-dim/40"> / </span>
                  <span>{result.group}</span>
                </div>
                <p className="break-all font-mono text-xs text-success leading-snug">
                  {rendered}
                </p>
                {isSubstituted && (
                  <p className="mt-0.5 break-all font-mono text-[10px] text-dim/50 leading-snug">
                    {result.cmd}
                  </p>
                )}
                {result.description && (
                  <p className="mt-0.5 text-[11px] text-dim/70 leading-snug truncate">{result.description}</p>
                )}
              </div>
              <span className={`shrink-0 self-center rounded border px-2 py-0.5 font-mono text-[10px] transition-colors ${
                isCopied ? "border-success/60 bg-success/10 text-success" : "border-border text-dim/60 group-hover:border-orange/40 group-hover:text-orange"
              }`}>
                {isCopied ? <Check size={10} /> : <Copy size={10} />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TopBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"variables" | "history" | "notes">("variables");
  const [drawerPinned, setDrawerPinned] = useState(false);
  const [machineNotes, setMachineNotes] = useState<Record<string, string>>({});
  const [presetName, setPresetName] = useState("");
  const [machineName, setMachineName] = useState("");
  const [presets, setPresets] = useState<Array<{ name: string; values: Record<string, string> }>>([]);
  const ref = useRef<HTMLInputElement>(null);
  const {
    values,
    setValue,
    copyMode,
    setCopyMode,
    reset,
    history,
    clearHistory,
    machines,
    activeMachineId,
    setActiveMachineId,
    addMachine,
    removeMachine,
    customCommands,
  } =
    useVariables();
  const activeVarChips = Object.entries(values).filter(([, value]) => value.trim().length > 0).slice(0, 4);
  const presetStorageKey = "oscp-variable-presets";
  const allCommands = useMemo(
    () => [...getAllCommands(), ...customCommands.map((command) => ({ ...command, section: "Custom", group: "My Commands" }))],
    [customCommands],
  );

  const fuse = useMemo(
    () =>
      new Fuse(allCommands, {
        keys: ["cmd", "description", "section", "group"],
        threshold: 0.35,
      }),
    [allCommands],
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query).slice(0, 8).map((item) => item.item);
  }, [fuse, query]);

  useEffect(() => {
    const raw = localStorage.getItem(presetStorageKey);
    if (!raw) return;
    try { setPresets(JSON.parse(raw)); } catch { /* start fresh */ }
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return;
    try { setMachineNotes(JSON.parse(raw)); } catch { /* start fresh */ }
  }, []);

  const updateMachineNote = (machineId: string, text: string) => {
    const next = { ...machineNotes, [machineId]: text };
    setMachineNotes(next);
    localStorage.setItem(NOTES_KEY, JSON.stringify(next));
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        if (!drawerPinned) setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    localStorage.setItem(presetStorageKey, JSON.stringify(presets));
  }, [presets]);

  const savePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    const next = [{ name, values: { ...values } }, ...presets.filter((p) => p.name !== name)].slice(0, 20);
    setPresets(next);
    setPresetName("");
  };

  const applyPreset = (presetValues: Record<string, string>) => {
    Object.keys(values).forEach((key) => setValue(key, presetValues[key] || ""));
  };

  return (
    <div className="sticky top-0 z-40 border-b border-border bg-surface/95 px-5 py-2.5 backdrop-blur">
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative min-w-0 flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
          <input
            ref={ref}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(e.target.value.trim().length > 0);
            }}
            onFocus={() => setOpen(query.trim().length > 0)}
            placeholder="Search commands (Ctrl+K)"
            className="w-full rounded border border-border bg-surface2 py-2 pl-9 pr-3 font-mono text-sm text-bright outline-none placeholder:text-dim focus:border-orange/60"
            spellCheck={false}
            autoComplete="off"
          />
          {open && results.length > 0 ? (
            <SearchResults results={results} values={values} onClose={() => { setOpen(false); setQuery(""); ref.current?.blur(); }} />
          ) : null}
        </div>

        {/* Active variable chips */}
        <div className="hidden flex-wrap gap-1 xl:flex">
          {activeVarChips.map(([key, value]) => (
            <span key={key} className="rounded border border-border bg-surface2 px-2 py-1 font-mono text-[10px]">
              <span className="text-orange">{key}</span>
              <span className="text-dim">=</span>
              <span className="text-success">{value}</span>
            </span>
          ))}
        </div>

        {/* Machine selector — compact dropdown + inline new-machine input */}
        <div className="flex shrink-0 items-center gap-1 rounded border border-border bg-surface2 px-1 py-1">
          <select
            value={activeMachineId}
            onChange={(e) => setActiveMachineId(e.target.value)}
            className="max-w-[110px] rounded bg-transparent px-1.5 py-0.5 font-mono text-xs text-bright outline-none"
          >
            {machines.map((machine) => (
              <option key={machine.id} value={machine.id}>{machine.name}</option>
            ))}
          </select>
          <div className="h-3 w-px bg-border" />
          <input
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && machineName.trim()) { addMachine(machineName); setMachineName(""); } }}
            placeholder="new…"
            className="w-14 bg-transparent px-1 py-0.5 font-mono text-xs text-success outline-none placeholder:text-dim/40"
            spellCheck={false}
            autoComplete="off"
          />
          <button
            onClick={() => { if (machineName.trim()) { addMachine(machineName); setMachineName(""); } }}
            className="rounded p-0.5 text-dim hover:text-orange"
            title="Add machine"
          >
            <Plus size={11} />
          </button>
          <button
            onClick={() => removeMachine(activeMachineId)}
            className="rounded p-0.5 text-dim/40 hover:text-red"
            title="Remove active machine"
          >
            <Trash2 size={11} />
          </button>
        </div>

        {/* Panel toggle */}
        <button
          onClick={() => setDrawerOpen((prev) => !prev)}
          title="Variables, notes & history"
          className={`inline-flex shrink-0 items-center gap-1.5 rounded border px-2.5 py-1.5 font-mono text-xs transition-colors ${
            drawerOpen ? "border-orange/60 bg-orange/10 text-orange" : "border-border text-dim hover:border-orange/40 hover:text-orange"
          }`}
        >
          <SlidersHorizontal size={13} />
          PANEL
        </button>
      </div>

      {drawerOpen ? (
        <>
          {!drawerPinned ? <button className="fixed inset-0 z-40 bg-black/50" onClick={() => setDrawerOpen(false)} /> : null}
          <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-md border-l border-border bg-surface p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="inline-flex rounded border border-border bg-surface p-1 font-mono text-xs">
                <button
                  onClick={() => setDrawerTab("variables")}
                  className={`rounded px-2.5 py-1 font-mono text-xs ${drawerTab === "variables" ? "bg-orange/10 text-orange" : "text-dim hover:text-bright"}`}
                >
                  VARIABLES
                </button>
                <button
                  onClick={() => setDrawerTab("notes")}
                  className={`rounded px-2.5 py-1 font-mono text-xs ${drawerTab === "notes" ? "bg-orange/10 text-orange" : "text-dim hover:text-bright"}`}
                >
                  NOTES
                </button>
                <button
                  onClick={() => setDrawerTab("history")}
                  className={`rounded px-2.5 py-1 font-mono text-xs ${drawerTab === "history" ? "bg-orange/10 text-orange" : "text-dim hover:text-bright"}`}
                >
                  HISTORY
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDrawerPinned((prev) => !prev)} className="text-dim hover:text-orange" title={drawerPinned ? "Unpin" : "Pin open"}>
                  {drawerPinned ? <Pin size={14} /> : <PinOff size={14} />}
                </button>
                <button onClick={() => setDrawerOpen(false)} className="text-dim hover:text-bright">
                  <X size={15} />
                </button>
              </div>
            </div>

            {drawerTab === "notes" ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[11px] uppercase text-dim">
                    Notes for <span className="text-orange">{machines.find((m) => m.id === activeMachineId)?.name ?? "—"}</span>
                  </p>
                  <p className="font-mono text-[9px] text-dim/50">per-machine · auto-saved</p>
                </div>
                <textarea
                  value={machineNotes[activeMachineId] ?? ""}
                  onChange={(e) => updateMachineNote(activeMachineId, e.target.value)}
                  placeholder={`Raw notes for this machine.\n\nCredentials, open ports, vectors tried,\ncommand output dumps — anything you need\nclose at hand while working.`}
                  className="h-[calc(100vh-220px)] w-full resize-none rounded border border-border bg-surface px-3 py-2 font-mono text-xs text-bright placeholder:text-dim/40 outline-none focus:border-orange/50"
                  spellCheck={false}
                />
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] text-dim/40">
                    Switch machines in the top bar to see their notes.
                  </p>
                  {machineNotes[activeMachineId] && (
                    <button
                      onClick={() => updateMachineNote(activeMachineId, "")}
                      className="font-mono text-[10px] text-dim hover:text-red flex items-center gap-1"
                    >
                      <Trash2 size={10} /> Clear
                    </button>
                  )}
                </div>
              </div>
            ) : drawerTab === "history" ? (
              <div className="rounded border border-border bg-surface2 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-xs text-dim">
                    <span className="text-orange">{history.length}</span> copied commands
                  </p>
                  <button onClick={clearHistory} className="inline-flex items-center gap-1 font-mono text-xs text-dim hover:text-danger">
                    <Trash2 size={11} /> Clear
                  </button>
                </div>
                <div className="max-h-[80vh] space-y-1 overflow-auto">
                  {history.length === 0 ? <p className="font-mono text-xs text-dim">No copied commands yet.</p> : null}
                  {history.map((item, idx) => (
                    <p key={`${item.id}-${item.at}-${idx}`} className="break-all font-mono text-xs text-success">
                      {item.cmd}
                    </p>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Presets */}
                <div className="rounded border border-border bg-surface2 p-3">
                  <p className="mb-2 font-mono text-[11px] uppercase text-orange">Presets</p>
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="Preset name (e.g. DC01)"
                      className="w-full rounded border border-border bg-surface px-2 py-1.5 font-mono text-xs text-success outline-none focus:border-orange/50"
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <button onClick={savePreset} className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 font-mono text-xs text-dim hover:text-orange">
                      <Save size={11} /> Save
                    </button>
                  </div>
                  <div className="max-h-24 space-y-1 overflow-auto">
                    {presets.length === 0 ? <p className="font-mono text-xs text-dim">No presets saved.</p> : null}
                    {presets.map((preset) => (
                      <div key={preset.name} className="flex items-center justify-between rounded border border-border bg-surface px-2 py-1">
                        <button onClick={() => applyPreset(preset.values)} className="font-mono text-xs text-bright hover:text-orange">
                          {preset.name}
                        </button>
                        <button onClick={() => setPresets((prev) => prev.filter((p) => p.name !== preset.name))} className="text-dim hover:text-danger">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variables */}
                <div className="rounded border border-border bg-surface2 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-mono text-[11px] uppercase text-dim">Global Variables</p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setCopyMode("rendered")}
                        className={`rounded border px-2 py-0.5 font-mono text-[10px] ${copyMode === "rendered" ? "border-success/60 text-success" : "border-border text-dim"}`}
                      >
                        RENDERED
                      </button>
                      <button
                        onClick={() => setCopyMode("template")}
                        className={`rounded border px-2 py-0.5 font-mono text-[10px] ${copyMode === "template" ? "border-core/60 text-core" : "border-border text-dim"}`}
                      >
                        TEMPLATE
                      </button>
                      <button onClick={reset} className="rounded border border-border px-2 py-0.5 font-mono text-[10px] text-dim hover:text-bright">
                        RESET
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {variableGroups.map((group) => (
                      <div key={group.title}>
                        <p className={`mb-1.5 font-mono text-[10px] uppercase ${group.titleClass}`}>{group.title}</p>
                        <div className="space-y-1.5">
                          {group.keys.map((key) => (
                            <label key={key} className="flex items-center gap-2">
                              <span className="w-14 font-mono text-[11px] text-orange">{key}</span>
                              <input
                                value={values[key] || ""}
                                onChange={(e) => setValue(key, e.target.value)}
                                placeholder={key}
                                className="w-full rounded border border-border bg-surface px-2 py-1.5 font-mono text-xs text-success outline-none focus:border-orange/50"
                                spellCheck={false}
                                autoComplete="off"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </>
      ) : null}
    </div>
  );
}
