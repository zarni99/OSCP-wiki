"use client";

import { CheckSquare, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const storageKey = "oscp-checklist";

const phases = [
  { title: "Pre-Exam Setup", items: ["VPN connected", "Workspace ready", "Tools verified", "Timer started"] },
  { title: "Initial Recon (per machine)", items: ["Quick nmap", "Full port scan", "UDP scan", "Web enum", "SMB enum", "LDAP enum", "searchsploit"] },
  { title: "Exploitation", items: ["Listener ready", "Initial shell obtained", "Shell stabilized", "local.txt captured"] },
  { title: "Privilege Escalation", items: ["LinPEAS/WinPEAS run", "Manual checks done", "privesc achieved", "proof.txt captured"] },
  { title: "Active Directory", items: ["BloodHound collected", "Kerberoasting", "ASREPRoasting", "Lateral movement", "Domain Admin"] },
  { title: "Documentation", items: ["All screenshots taken", "Commands logged", "Report started during exam", "Report submitted"] },
];

export default function ChecklistPage() {
  const allIds = phases.flatMap((phase, p) => phase.items.map((_, i) => `${p}-${i}`));
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) setDone(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(done));
  }, [done]);

  const completed = useMemo(() => allIds.filter((id) => done[id]).length, [allIds, done]);
  const percent = Math.round((completed / allIds.length) * 100);
  const progressColor = percent === 100 ? "bg-green" : percent >= 60 ? "bg-cyan" : percent >= 30 ? "bg-orange" : "bg-red";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl text-gradient-brand">Exam Checklist</h1>
        <button onClick={() => setDone({})} className="rounded border border-danger/50 bg-danger/10 px-3 py-1 text-xs text-danger">Reset</button>
      </div>
      <div className="color-panel rounded-md p-4">
        <div className="mb-2 flex items-center justify-between font-mono text-xs text-dim">
          <span>{completed}/{allIds.length}</span>
          <span>{percent}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded bg-surface2">
          <div className={`h-full ${progressColor}`} style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="space-y-4">
        {phases.map((phase, pIdx) => {
          const phaseDone = phase.items.filter((_, i) => done[`${pIdx}-${i}`]).length;
          return (
            <section key={phase.title} className="color-panel rounded-md p-4">
              <h2 className="mb-3 font-mono text-sm text-violet">{phase.title} ({phaseDone}/{phase.items.length})</h2>
              <div className="space-y-2">
                {phase.items.map((item, iIdx) => {
                  const id = `${pIdx}-${iIdx}`;
                  const checked = !!done[id];
                  return (
                    <button key={id} onClick={() => setDone((prev) => ({ ...prev, [id]: !prev[id] }))} className={`flex w-full items-center gap-2 rounded border px-3 py-2 text-left ${checked ? "border-success/50 bg-success/10 opacity-90" : "border-border bg-surface2 hover:border-violet/40"}`}>
                      {checked ? <CheckSquare size={16} className="text-success" /> : <Square size={16} className="text-dim" />}
                      <span className={checked ? "line-through text-dim" : "text-bright"}>{item}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
