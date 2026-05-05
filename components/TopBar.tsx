"use client";

import { History, Pin, PinOff, Plus, Save, Search, SlidersHorizontal, TerminalSquare, Trash2, X } from "lucide-react";
import Fuse from "fuse.js";
import { useEffect, useMemo, useRef, useState } from "react";
import CommandCard from "@/components/CommandCard";
import { getAllCommands, totalCommandCount } from "@/lib/commands";
import { useVariables } from "@/components/VariablesProvider";

const variableGroups = [
  { title: "Network", keys: ["LHOST", "RHOST", "LPORT", "RPORT"], titleClass: "text-core" },
  { title: "Domain", keys: ["DOMAIN", "DC"], titleClass: "text-adblue" },
  { title: "Auth", keys: ["USER", "PASS", "HASH"], titleClass: "text-post" },
  { title: "Web", keys: ["URL"], titleClass: "text-violet" },
];

export default function TopBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"variables" | "history">("variables");
  const [drawerPinned, setDrawerPinned] = useState(false);
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
    if (raw) setPresets(JSON.parse(raw));
  }, []);

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
    <div className="sticky top-0 z-40 border-b border-violet/30 bg-[#0a1020]/95 px-6 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-3xl">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
          <input
            ref={ref}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(e.target.value.trim().length > 0);
            }}
            onFocus={() => setOpen(query.trim().length > 0)}
            placeholder="Global command search (Ctrl+K)"
            className="w-full rounded-md border border-violet/40 bg-surface py-2.5 pl-10 pr-3 text-sm text-bright outline-none placeholder:text-dim/80 focus:border-core"
            spellCheck={false}
            autoComplete="off"
          />
          {open && results.length > 0 ? (
            <div className="absolute mt-2 max-h-[70vh] w-full overflow-auto rounded-md border border-violet/50 bg-[#101a30] p-3 shadow-xl">
              <div className="space-y-2">
                {results.map((result) => (
                  <div key={result.id}>
                    <div className="mb-1 text-xs">
                      <span className="text-core">{result.section}</span>
                      <span className="text-dim"> / </span>
                      <span className="text-violet">{result.group}</span>
                    </div>
                    <CommandCard command={result} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        <div className="hidden flex-wrap gap-1 lg:flex">
          {activeVarChips.map(([key, value]) => (
            <span key={key} className="rounded border border-border bg-surface px-2 py-1 font-mono text-[10px]">
              <span className="text-violet">{key}</span>
              <span className="text-dim">=</span>
              <span className="text-success">{value}</span>
            </span>
          ))}
        </div>
        <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-core/60 bg-gradient-to-r from-core/20 to-violet/20 px-3 py-2 font-mono text-xs">
          <TerminalSquare size={14} className="text-core" />
          <span className="text-gradient-mono">{totalCommandCount}</span> <span className="text-violet">CMDS</span>
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-surface p-1">
          <select
            value={activeMachineId}
            onChange={(e) => setActiveMachineId(e.target.value)}
            className="rounded border border-border bg-surface2 px-2 py-1 font-mono text-xs text-bright outline-none"
          >
            {machines.map((machine) => (
              <option key={machine.id} value={machine.id}>
                {machine.name}
              </option>
            ))}
          </select>
          <input
            value={machineName}
            onChange={(e) => setMachineName(e.target.value)}
            placeholder="NEW"
            className="w-20 rounded border border-border bg-surface2 px-2 py-1 font-mono text-xs text-success outline-none"
            spellCheck={false}
            autoComplete="off"
          />
          <button
            onClick={() => {
              addMachine(machineName);
              setMachineName("");
            }}
            className="rounded border border-border px-1.5 py-1 text-dim hover:text-core"
          >
            <Plus size={12} />
          </button>
          <button
            onClick={() => removeMachine(activeMachineId)}
            className="rounded border border-border px-1.5 py-1 text-dim hover:text-red"
            title="Delete active machine"
          >
            <Trash2 size={12} />
          </button>
        </div>
        <button
          onClick={() => {
            setDrawerTab("history");
            setDrawerOpen(true);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-adblue/50 bg-gradient-to-r from-adblue/20 to-violet/15 px-2 py-2 font-mono text-xs text-adblue hover:text-bright"
        >
          <History size={14} />
          HISTORY
        </button>
        <button
          onClick={() => {
            setDrawerTab("variables");
            setDrawerOpen(true);
          }}
          className="inline-flex items-center gap-1 rounded-md border border-violet/50 bg-gradient-to-r from-violet/20 to-core/15 px-2 py-2 font-mono text-xs text-violet hover:text-bright"
        >
          <SlidersHorizontal size={14} />
          VARIABLES
        </button>
      </div>
      {drawerOpen ? (
        <>
          {!drawerPinned ? <button className="fixed inset-0 z-40 bg-black/30" onClick={() => setDrawerOpen(false)} /> : null}
          <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-md border-l border-border bg-[#0f1727] p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="inline-flex rounded border border-border bg-surface p-1 font-mono text-xs">
                <button
                  onClick={() => setDrawerTab("variables")}
                  className={`rounded px-2 py-1 ${drawerTab === "variables" ? "bg-violet/15 text-violet" : "text-dim"}`}
                >
                  VARIABLES
                </button>
                <button
                  onClick={() => setDrawerTab("history")}
                  className={`rounded px-2 py-1 ${drawerTab === "history" ? "bg-adblue/15 text-adblue" : "text-dim"}`}
                >
                  HISTORY
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setDrawerPinned((prev) => !prev)} className="text-dim hover:text-violet">
                  {drawerPinned ? <Pin size={15} /> : <PinOff size={15} />}
                </button>
                <button onClick={() => setDrawerOpen(false)} className="text-dim hover:text-bright">
                  <X size={16} />
                </button>
              </div>
            </div>

            {drawerTab === "history" ? (
              <div className="rounded-md border border-border bg-surface p-2">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-xs text-dim">
                    Last <span className="text-core">{history.length}</span> copied commands
                  </p>
                  <button onClick={clearHistory} className="inline-flex items-center gap-1 text-xs text-dim hover:text-danger">
                    <Trash2 size={12} /> Clear
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
              <div className="rounded-md border border-border bg-surface p-3">
                <div className="mb-3 rounded border border-border bg-surface2 p-2">
                  <p className="mb-2 font-mono text-[11px] uppercase text-post">Presets</p>
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="Preset name (e.g. DC01)"
                      className="w-full rounded border border-border bg-surface px-2 py-1.5 font-mono text-xs text-success outline-none focus:border-post"
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <button onClick={savePreset} className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-xs text-dim hover:text-post">
                      <Save size={12} /> Save
                    </button>
                  </div>
                  <div className="max-h-24 space-y-1 overflow-auto">
                    {presets.length === 0 ? <p className="font-mono text-xs text-dim">No presets saved.</p> : null}
                    {presets.map((preset) => (
                      <div key={preset.name} className="flex items-center justify-between rounded border border-border bg-surface px-2 py-1">
                        <button onClick={() => applyPreset(preset.values)} className="font-mono text-xs text-bright hover:text-violet">
                          {preset.name}
                        </button>
                        <button onClick={() => setPresets((prev) => prev.filter((p) => p.name !== preset.name))} className="text-dim hover:text-danger">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-mono text-xs uppercase tracking-wide text-gradient-cool">Global Variables</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCopyMode("rendered")}
                      className={`rounded border px-2 py-1 font-mono text-xs ${copyMode === "rendered" ? "border-success text-success" : "border-border text-dim"}`}
                    >
                      COPY RENDERED
                    </button>
                    <button
                      onClick={() => setCopyMode("template")}
                      className={`rounded border px-2 py-1 font-mono text-xs ${copyMode === "template" ? "border-core text-core" : "border-border text-dim"}`}
                    >
                      COPY TEMPLATE
                    </button>
                    <button onClick={reset} className="rounded border border-border px-2 py-1 font-mono text-xs text-dim hover:text-bright">
                      RESET
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {variableGroups.map((group) => (
                    <div key={group.title} className="rounded border border-border bg-surface2 p-2">
                      <p className={`mb-2 font-mono text-[11px] uppercase ${group.titleClass}`}>{group.title}</p>
                      <div className="space-y-2">
                        {group.keys.map((key) => (
                          <label key={key} className="flex items-center gap-2">
                            <span className="w-14 font-mono text-[11px] text-violet/90">{key}</span>
                            <input
                              value={values[key] || ""}
                              onChange={(e) => setValue(key, e.target.value)}
                              placeholder={key}
                              className="w-full rounded border border-border bg-surface px-2 py-1.5 font-mono text-xs text-success outline-none focus:border-core"
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
            )}
          </aside>
        </>
      ) : null}
    </div>
  );
}
