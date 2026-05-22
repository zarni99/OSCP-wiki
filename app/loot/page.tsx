"use client";

import { Check, Copy, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Credential {
  id: string;
  username: string;
  secret: string; // password or hash
  source: string; // where it came from
}

interface SprayTarget {
  id: string;
  name: string; // IP or hostname
}

type SprayStatus = "tried" | "worked" | "failed" | null;

interface SprayResult {
  credId: string;
  targetId: string;
  status: SprayStatus;
}

const CREDS_KEY   = "oscp-spray-creds";
const TARGETS_KEY = "oscp-spray-targets";
const RESULTS_KEY = "oscp-spray-results";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

const STATUS_CYCLE: SprayStatus[] = [null, "tried", "worked", "failed"];
const STATUS_STYLE: Record<string, string> = {
  tried:  "bg-warn/20 text-warn border-warn/50",
  worked: "bg-success/20 text-success border-success/50",
  failed: "bg-red/20 text-red border-red/50",
};

// ── Spray Tracker ─────────────────────────────────────────────────────────────
function SprayTracker() {
  const [creds, setCreds]     = useState<Credential[]>([]);
  const [targets, setTargets] = useState<SprayTarget[]>([]);
  const [results, setResults] = useState<SprayResult[]>([]);

  // form state
  const [newUser, setNewUser]     = useState("");
  const [newSecret, setNewSecret] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [copied, setCopied]       = useState<string | null>(null);

  useEffect(() => {
    try { setCreds(JSON.parse(localStorage.getItem(CREDS_KEY) || "[]")); }   catch {}
    try { setTargets(JSON.parse(localStorage.getItem(TARGETS_KEY) || "[]")); } catch {}
    try { setResults(JSON.parse(localStorage.getItem(RESULTS_KEY) || "[]")); } catch {}
  }, []);

  const saveCreds   = (next: Credential[])   => { setCreds(next);   localStorage.setItem(CREDS_KEY,   JSON.stringify(next)); };
  const saveTargets = (next: SprayTarget[]) => { setTargets(next); localStorage.setItem(TARGETS_KEY, JSON.stringify(next)); };
  const saveResults = (next: SprayResult[]) => { setResults(next); localStorage.setItem(RESULTS_KEY, JSON.stringify(next)); };

  const addCred = () => {
    if (!newUser.trim()) return;
    saveCreds([...creds, { id: uid(), username: newUser.trim(), secret: newSecret.trim(), source: newSource.trim() }]);
    setNewUser(""); setNewSecret(""); setNewSource("");
  };

  const removeCred = (id: string) => {
    saveCreds(creds.filter((c) => c.id !== id));
    saveResults(results.filter((r) => r.credId !== id));
  };

  const addTarget = () => {
    if (!newTarget.trim()) return;
    saveTargets([...targets, { id: uid(), name: newTarget.trim() }]);
    setNewTarget("");
  };

  const removeTarget = (id: string) => {
    saveTargets(targets.filter((t) => t.id !== id));
    saveResults(results.filter((r) => r.targetId !== id));
  };

  const getStatus = (credId: string, targetId: string): SprayStatus =>
    results.find((r) => r.credId === credId && r.targetId === targetId)?.status ?? null;

  const cycleStatus = (credId: string, targetId: string) => {
    const cur = getStatus(credId, targetId);
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(cur) + 1) % STATUS_CYCLE.length];
    const filtered = results.filter((r) => !(r.credId === credId && r.targetId === targetId));
    saveResults(next === null ? filtered : [...filtered, { credId, targetId, status: next }]);
  };

  const copyCred = async (c: Credential) => {
    const text = c.secret ? `${c.username}:${c.secret}` : c.username;
    await navigator.clipboard.writeText(text);
    setCopied(c.id);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 1500);
  };

  const workedCount = results.filter((r) => r.status === "worked").length;
  const triedCount  = results.filter((r) => r.status !== null).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-widest text-orange/80">Credential Spray Tracker</p>
        {triedCount > 0 && (
          <span className="font-mono text-xs text-dim">
            <span className="text-success">{workedCount} worked</span>
            <span className="text-dim/40"> / </span>
            <span>{triedCount} tried</span>
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Credentials ── */}
        <div className="color-panel rounded-lg p-4 space-y-3">
          <p className="font-mono text-[11px] uppercase text-dim">Credentials</p>
          <div className="grid grid-cols-3 gap-1.5">
            <input value={newUser}   onChange={(e) => setNewUser(e.target.value)}   placeholder="username"    onKeyDown={(e) => e.key === "Enter" && addCred()} className="col-span-1 rounded border border-border bg-surface px-2 py-1.5 font-mono text-xs text-bright outline-none focus:border-orange/50 placeholder:text-dim/50" spellCheck={false} />
            <input value={newSecret} onChange={(e) => setNewSecret(e.target.value)} placeholder="password / hash" onKeyDown={(e) => e.key === "Enter" && addCred()} className="col-span-1 rounded border border-border bg-surface px-2 py-1.5 font-mono text-xs text-success outline-none focus:border-orange/50 placeholder:text-dim/50" spellCheck={false} />
            <input value={newSource} onChange={(e) => setNewSource(e.target.value)} placeholder="source"      onKeyDown={(e) => e.key === "Enter" && addCred()} className="col-span-1 rounded border border-border bg-surface px-2 py-1.5 font-mono text-xs text-dim outline-none focus:border-orange/50 placeholder:text-dim/40" spellCheck={false} />
          </div>
          <button onClick={addCred} className="inline-flex items-center gap-1.5 rounded border border-dashed border-orange/40 px-3 py-1 font-mono text-xs text-dim hover:text-orange hover:border-orange transition-colors">
            <Plus size={11} /> Add credential
          </button>
          <div className="space-y-1.5 max-h-48 overflow-auto">
            {creds.length === 0 && <p className="font-mono text-[10px] text-dim/50">No credentials yet.</p>}
            {creds.map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded border border-border bg-surface px-2 py-1.5">
                <span className="font-mono text-xs text-orange min-w-0 truncate">{c.username}</span>
                {c.secret && <span className="font-mono text-xs text-success/80 min-w-0 truncate flex-1">{c.secret}</span>}
                {c.source && <span className="font-mono text-[10px] text-dim/60 shrink-0">({c.source})</span>}
                <button onClick={() => copyCred(c)} className={`shrink-0 ${copied === c.id ? "text-success" : "text-dim hover:text-orange"}`}>
                  {copied === c.id ? <Check size={11} /> : <Copy size={11} />}
                </button>
                <button onClick={() => removeCred(c.id)} className="shrink-0 text-dim hover:text-red"><X size={11} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Targets ── */}
        <div className="color-panel rounded-lg p-4 space-y-3">
          <p className="font-mono text-[11px] uppercase text-dim">Targets</p>
          <div className="flex gap-1.5">
            <input value={newTarget} onChange={(e) => setNewTarget(e.target.value)} placeholder="IP or hostname" onKeyDown={(e) => e.key === "Enter" && addTarget()} className="flex-1 rounded border border-border bg-surface px-2 py-1.5 font-mono text-xs text-bright outline-none focus:border-orange/50 placeholder:text-dim/50" spellCheck={false} autoComplete="off" />
            <button onClick={addTarget} className="inline-flex items-center gap-1 rounded border border-dashed border-orange/40 px-3 py-1 font-mono text-xs text-dim hover:text-orange hover:border-orange transition-colors">
              <Plus size={11} />
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-auto">
            {targets.length === 0 && <p className="font-mono text-[10px] text-dim/50">No targets yet.</p>}
            {targets.map((t) => {
              const worked = results.filter((r) => r.targetId === t.id && r.status === "worked").length;
              return (
                <div key={t.id} className="flex items-center gap-2 rounded border border-border bg-surface px-2 py-1.5">
                  <span className="flex-1 font-mono text-xs text-bright">{t.name}</span>
                  {worked > 0 && <span className="font-mono text-[10px] text-success">{worked} worked</span>}
                  <button onClick={() => removeTarget(t.id)} className="shrink-0 text-dim hover:text-red"><X size={11} /></button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Spray Matrix ── */}
      {creds.length > 0 && targets.length > 0 && (
        <div className="color-panel rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase text-dim">Spray Matrix</p>
            <p className="font-mono text-[10px] text-dim/50">click a cell to cycle: blank → tried → worked → failed</p>
          </div>
          <div className="overflow-auto">
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr>
                  <th className="border border-border bg-surface2 px-2 py-1.5 text-left text-dim font-normal">cred \ target</th>
                  {targets.map((t) => (
                    <th key={t.id} className="border border-border bg-surface2 px-2 py-1.5 text-center text-core font-normal whitespace-nowrap max-w-[8rem] truncate">
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {creds.map((c) => (
                  <tr key={c.id}>
                    <td className="border border-border bg-surface px-2 py-1.5 whitespace-nowrap">
                      <span className="text-orange">{c.username}</span>
                      {c.secret && <span className="text-dim/50 ml-1">:{c.secret.slice(0, 12)}{c.secret.length > 12 ? "…" : ""}</span>}
                    </td>
                    {targets.map((t) => {
                      const status = getStatus(c.id, t.id);
                      return (
                        <td key={t.id} className="border border-border p-0">
                          <button
                            onClick={() => cycleStatus(c.id, t.id)}
                            className={`w-full h-full px-2 py-1.5 text-center text-[10px] font-mono transition-colors ${
                              status ? STATUS_STYLE[status] : "text-dim/30 hover:bg-surface2"
                            }`}
                            title={`${c.username} → ${t.name}: ${status ?? "not tried"}`}
                          >
                            {status === "worked" ? "✓" : status === "failed" ? "✗" : status === "tried" ? "?" : "·"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {workedCount > 0 && (
            <div className="rounded border border-success/30 bg-success/5 px-3 py-2">
              <p className="font-mono text-[11px] text-success mb-1">Working credentials:</p>
              {results.filter((r) => r.status === "worked").map((r) => {
                const c = creds.find((x) => x.id === r.credId);
                const t = targets.find((x) => x.id === r.targetId);
                if (!c || !t) return null;
                return (
                  <p key={`${r.credId}-${r.targetId}`} className="font-mono text-xs text-success/80">
                    {c.username}{c.secret ? `:${c.secret}` : ""} → {t.name}
                    {c.source && <span className="text-dim/50"> (from {c.source})</span>}
                  </p>
                );
              })}
            </div>
          )}
          <button
            onClick={() => { if (confirm("Clear all spray results?")) saveResults([]); }}
            className="inline-flex items-center gap-1 font-mono text-[10px] text-dim hover:text-red transition-colors"
          >
            <Trash2 size={10} /> Clear results
          </button>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LootPage() {
  const post    = sections.find((s) => s.slug === "post")!;
  const privesc = sections.find((s) => s.slug === "privesc")!;

  const postGroups    = post.groups.filter((g) => ["Linux Looting", "Windows Looting", "Meterpreter Post"].includes(g.title));
  const privescGroups = privesc.groups.filter((g) => ["Credential Hunting Linux", "Windows Credential Dumping"].includes(g.title));

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="font-heading text-3xl text-bright">Loot & Credentials</h1>
        <p className="text-sm text-dim">Credential spray tracker · looting commands · hash dumping</p>
      </header>

      <SprayTracker />

      <div className="border-t border-border pt-8">
        <SectionPage
          section={{
            id: "loot",
            title: "Loot & Credentials",
            slug: "loot",
            groups: [...postGroups, ...privescGroups],
          }}
        />
      </div>
    </div>
  );
}
