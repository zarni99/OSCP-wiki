"use client";

import { Check, Copy, Link2, Plus, RefreshCw, Target, Timer, Trophy, Zap, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useReport } from "@/components/ReportProvider";
import { emptyTarget, Target as TargetType } from "@/app/report/types";

const EXAM_DURATION_S = 23 * 3600 + 45 * 60; // 23h 45m
const TIMER_KEY = "oscp-exam-start";

function pad(n: number) { return String(n).padStart(2, "0"); }

function ExamTimer() {
  const [startMs, setStartMs] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const raw = localStorage.getItem(TIMER_KEY);
    if (raw) setStartMs(Number(raw));
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = startMs ? Math.floor((now - startMs) / 1000) : 0;
  const remaining = Math.max(0, EXAM_DURATION_S - elapsed);
  const pct = Math.min(100, (elapsed / EXAM_DURATION_S) * 100);
  const done = startMs !== null && remaining === 0;

  const hh = Math.floor(remaining / 3600);
  const mm = Math.floor((remaining % 3600) / 60);
  const ss = remaining % 60;

  const urgency =
    remaining < 3600 ? "text-red border-red/50 bg-red/5" :
    remaining < 2 * 3600 ? "text-orange border-orange/50 bg-orange/5" :
    "text-success border-success/40 bg-success/5";

  const start = () => {
    const t = Date.now();
    setStartMs(t);
    localStorage.setItem(TIMER_KEY, String(t));
    toast.success("Exam timer started — good luck!");
  };

  const reset = () => {
    if (!confirm("Reset exam timer?")) return;
    setStartMs(null);
    localStorage.removeItem(TIMER_KEY);
  };

  return (
    <div className="color-panel rounded-md p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-sm text-orange flex items-center gap-2">
          <Timer size={13} /> Exam Countdown
        </h2>
        {startMs && (
          <button onClick={reset} className="font-mono text-[10px] text-dim hover:text-red">
            Reset
          </button>
        )}
      </div>

      {!startMs ? (
        <div className="flex items-center justify-between gap-4 rounded border border-border bg-surface2 px-4 py-3">
          <span className="font-mono text-xs text-dim">23h 45m · start when your exam begins</span>
          <button
            onClick={start}
            className="rounded border border-success/50 bg-success/10 px-3 py-1 font-mono text-xs text-success hover:bg-success/15"
          >
            Start Timer
          </button>
        </div>
      ) : startMs ? (
        <>
          <div className={`rounded border px-4 py-3 text-center font-mono ${urgency}`}>
            <span className="text-4xl font-bold tracking-widest">
              {done ? "TIME'S UP" : `${pad(hh)}:${pad(mm)}:${pad(ss)}`}
            </span>
            <p className="mt-1 text-[10px] opacity-70">
              {done ? "Exam ended — submit your report!" : "remaining · 23h 45m total"}
            </p>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 w-full rounded-full bg-surface2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${remaining < 3600 ? "bg-red" : remaining < 2 * 3600 ? "bg-orange" : "bg-success"}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          {/* Time block hints */}
          <div className="mt-2 grid grid-cols-4 gap-1 font-mono text-[9px] text-dim/60">
            {[
              { label: "AD  3h", threshold: EXAM_DURATION_S - 3 * 3600 },
              { label: "SA1 3h", threshold: EXAM_DURATION_S - 6 * 3600 },
              { label: "SA2 2h", threshold: EXAM_DURATION_S - 8 * 3600 },
              { label: "SA3 4h", threshold: 0 },
            ].map((b) => (
              <div
                key={b.label}
                className={`rounded border px-1 py-0.5 text-center ${elapsed > EXAM_DURATION_S - b.threshold - (b.label.includes("AD") ? 3 : b.label.includes("SA1") ? 3 : b.label.includes("SA2") ? 2 : 4) * 3600 ? "border-dim/20 text-dim/30 line-through" : "border-dim/30 text-dim/60"}`}
              >
                {b.label}
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

// ── Point scenarios ────────────────────────────────────────────────────────────
const SCENARIOS = [
  {
    label: "Minimum pass (70 pts)",
    machines: [
      { name: "AD Set (full)", pts: 40, note: "DC + 2 clients, all flags" },
      { name: "Stand-alone #1 (full)", pts: 20, note: "local.txt + proof.txt" },
      { name: "Stand-alone #2 (local only)", pts: 10, note: "local.txt only" },
    ],
    total: 70,
  },
  {
    label: "Safe pass (80 pts)",
    machines: [
      { name: "AD Set (full)", pts: 40, note: "DC + 2 clients, all flags" },
      { name: "Stand-alone #1 (full)", pts: 20, note: "local.txt + proof.txt" },
      { name: "Stand-alone #2 (full)", pts: 20, note: "local.txt + proof.txt" },
    ],
    total: 80,
  },
  {
    label: "No AD pass (70 pts)",
    machines: [
      { name: "AD Set partial (client only)", pts: 10, note: "1 client flag only" },
      { name: "Stand-alone #1 (full)", pts: 20, note: "" },
      { name: "Stand-alone #2 (full)", pts: 20, note: "" },
      { name: "Stand-alone #3 (full)", pts: 20, note: "" },
    ],
    total: 70,
  },
];

// ── Proof commands ─────────────────────────────────────────────────────────────
const PROOF_CMDS = {
  linux: [
    { label: "Proof flag", cmd: "cat /root/proof.txt" },
    { label: "Local flag", cmd: "cat /home/*/local.txt 2>/dev/null || find / -name local.txt 2>/dev/null" },
    { label: "Whoami + hostname + IP", cmd: "id && hostname && ip addr show | grep 'inet '" },
    { label: "One-liner (all)", cmd: "cat /root/proof.txt; id; hostname; ip addr show | grep 'inet '" },
  ],
  windows: [
    { label: "Proof flag", cmd: "type C:\\Users\\Administrator\\Desktop\\proof.txt" },
    { label: "Local flag", cmd: "dir /s /b local.txt 2>nul" },
    { label: "Whoami + hostname + IP", cmd: "whoami && hostname && ipconfig" },
    { label: "One-liner (all)", cmd: "type C:\\Users\\Administrator\\Desktop\\proof.txt & whoami & hostname & ipconfig" },
  ],
};

// ── Stuck? checklist ───────────────────────────────────────────────────────────
const STUCK = [
  "Did you scan ALL ports (not just top 1000)? — nmap -p- -T4",
  "Did you try UDP scans? — nmap -sU --top-ports 100",
  "Did you enumerate every service found (HTTP, FTP, SMB, RPC)?",
  "Did you check for default credentials on all services?",
  "Did you look for version-specific exploits (searchsploit, Google)?",
  "Did you fuzz ALL web endpoints (directories, parameters, virtual hosts)?",
  "Did you try all credentials found in every service (password reuse)?",
  "Did you check for SQL injection on every input field?",
  "Did you read source code of custom web apps for logic flaws?",
  "Did you check file upload for extension bypass + execution?",
  "Did you check writable paths and SUID/SGID binaries?",
  "Did you check sudo -l and /etc/sudoers?",
  "Did you run winPEAS / linPEAS and read the output fully?",
  "Did you look for scheduled tasks / cron jobs running as root?",
  "Did you try every GTFOBin for installed SUID binaries?",
];

// ── Exam day tips ──────────────────────────────────────────────────────────────
const TIPS = [
  { title: "AD first, always", body: "The AD set is worth 40 pts. Compromise it before touching stand-alones. Even a partial AD chain (1 client = 10 pts) de-risks the exam." },
  { title: "Screenshot everything", body: "Take screenshots as you go — flag content + whoami + hostname + IP in one shot. You cannot go back after the exam ends." },
  { title: "Metasploit budget: 1 machine", body: "You can use Metasploit modules on exactly ONE machine. Save it for a stubborn stand-alone, not the AD set." },
  { title: "Time blocks: 3+3+2+4", body: "3 hrs AD → 3 hrs stand-alone 1 → 2 hrs stand-alone 2 → 4 hrs stand-alone 3. Hard stop each block and move on." },
  { title: "Notes while hacking", body: "Write commands + output in your notes in real time. The report is written after — you need everything recorded during the exam." },
  { title: "VPN check on resume", body: "After every break, verify VPN is still up and machines respond before diving back in." },
  { title: "Rest matters", body: "Take breaks. 24 hrs is long. A 20-min rest beats 2 hrs of spinning your wheels tired." },
];

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="ml-2 shrink-0 text-dim hover:text-orange transition-colors">
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
    </button>
  );
}

export default function ExamPage() {
  const { data, loaded, updateTarget, addTarget, removeTarget, setData } = useReport();
  const [stuckChecked, setStuckChecked] = useState<boolean[]>(Array(STUCK.length).fill(false));
  const [os, setOs] = useState<"linux" | "windows">("linux");
  const [activeScenario, setActiveScenario] = useState(0);

  // Earned points: full points if both flags captured, half if only local.
  const earned = data.targets.reduce((sum, t) => {
    const pts = t.examPoints ?? 20;
    const local = !!(t.localCaptured || t.localTxt);
    const proof = !!(t.proofCaptured || t.proofTxt);
    if (local && proof) return sum + pts;
    if (local) return sum + Math.round(pts / 2);
    return sum;
  }, 0);

  const passed = earned >= 70;
  const stuckCount = stuckChecked.filter(Boolean).length;

  const seedDefaultMachines = () => {
    if (data.targets.length > 0 && !confirm("Replace current targets with the default OSCP exam set?")) return;
    const defaults: Partial<TargetType>[] = [
      { name: "AD — Client 1", examPoints: 10, isAD: true, os: "Windows" },
      { name: "AD — Client 2", examPoints: 10, isAD: true, os: "Windows" },
      { name: "AD — DC",       examPoints: 20, isAD: true, os: "Windows" },
      { name: "Stand-alone 1", examPoints: 20 },
      { name: "Stand-alone 2", examPoints: 20 },
      { name: "Stand-alone 3", examPoints: 20 },
    ];
    setData((prev) => ({ ...prev, targets: defaults.map((d) => ({ ...emptyTarget(), ...d })) }));
    toast.success("Default exam set loaded");
  };

  const togglePoints = (t: TargetType) => {
    const next = (t.examPoints ?? 20) === 10 ? 20 : 10;
    updateTarget(t.id, { examPoints: next });
  };

  if (!loaded) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="color-panel rounded-md p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Trophy size={22} className="text-orange" />
            <div>
              <h1 className="font-heading text-3xl text-bright">Exam Dashboard</h1>
              <p className="text-sm text-dim">
                Point tracker · proof commands · reset checklist · exam tips
                <span className="ml-2 inline-flex items-center gap-1 font-mono text-[10px] text-orange/80">
                  <Link2 size={10} /> synced with Report Builder
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Countdown timer */}
      <ExamTimer />

      <div className="grid gap-6 xl:grid-cols-2">
        {/* ── Left column ── */}
        <div className="space-y-6">

          {/* Machine tracker */}
          <section className="color-panel rounded-md p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-mono text-sm text-orange">Machine Tracker</h2>
              <div className={`rounded border px-3 py-1 font-mono text-sm font-bold ${passed ? "border-success/60 bg-success/10 text-success" : "border-dim/30 text-dim"}`}>
                {earned} / 100 pts {passed ? "✓ PASS" : ""}
              </div>
            </div>

            {data.targets.length === 0 ? (
              <div className="rounded border border-dashed border-dim/30 p-6 text-center">
                <p className="text-sm text-dim mb-3">No machines yet — start with the standard OSCP exam set.</p>
                <button
                  onClick={seedDefaultMachines}
                  className="inline-flex items-center gap-2 rounded border border-orange/50 bg-orange/10 px-3 py-1.5 font-mono text-xs text-orange hover:bg-orange/15"
                >
                  <Plus size={11} /> Load default 6 machines
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {data.targets.map((t) => {
                  const pts = t.examPoints ?? 20;
                  const local = !!(t.localCaptured || t.localTxt);
                  const proof = !!(t.proofCaptured || t.proofTxt);
                  const earnedPts = local && proof ? pts : local ? Math.round(pts / 2) : 0;
                  return (
                    <div key={t.id} className="rounded border border-border bg-surface2 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          value={t.name}
                          onChange={(e) => updateTarget(t.id, { name: e.target.value })}
                          placeholder="Machine name"
                          className="min-w-0 flex-1 bg-transparent font-mono text-xs text-bright placeholder:text-dim/40 outline-none"
                        />
                        <button
                          onClick={() => togglePoints(t)}
                          title="Toggle 10 / 20 pts"
                          className="shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-dim hover:border-orange/40 hover:text-orange"
                        >
                          {pts} pts
                        </button>
                        {t.isAD && (
                          <span className="shrink-0 rounded bg-adblue/20 px-1.5 py-0.5 font-mono text-[10px] text-adblue">AD</span>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`Remove "${t.name || "this machine"}"? It will also be removed from the Report.`)) {
                              removeTarget(t.id);
                            }
                          }}
                          className="shrink-0 text-dim hover:text-red"
                          title="Remove machine"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-4">
                        <label className="flex cursor-pointer items-center gap-1.5 font-mono text-xs text-dim">
                          <input
                            type="checkbox"
                            checked={local}
                            onChange={(e) => updateTarget(t.id, { localCaptured: e.target.checked })}
                            className="accent-orange"
                          />
                          local.txt
                        </label>
                        <label className="flex cursor-pointer items-center gap-1.5 font-mono text-xs text-dim">
                          <input
                            type="checkbox"
                            checked={proof}
                            onChange={(e) => updateTarget(t.id, { proofCaptured: e.target.checked })}
                            className="accent-orange"
                          />
                          proof.txt
                        </label>
                        <span className={`ml-auto font-mono text-[10px] ${local && proof ? "text-success" : local ? "text-orange" : "text-dim/40"}`}>
                          {local && proof ? `+${pts} pts` : local ? `+${Math.round(pts / 2)} pts` : "0 pts"}
                        </span>
                      </div>
                      <input
                        value={t.examNotes || ""}
                        onChange={(e) => updateTarget(t.id, { examNotes: e.target.value })}
                        placeholder="Notes (creds, vectors, blockers...)"
                        className="mt-2 w-full rounded border border-border bg-surface px-2 py-1 font-mono text-[11px] text-bright placeholder:text-dim/50 outline-none focus:border-orange/50"
                      />
                      {earnedPts === 0 && (local || proof) && (
                        <p className="mt-1 font-mono text-[9px] text-dim/60">Tip: proof.txt alone gives no points — both flags needed for full credit.</p>
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => addTarget({ examPoints: 20 })}
                    className="inline-flex items-center gap-1.5 rounded border border-dashed border-orange/40 px-2.5 py-1 font-mono text-[10px] text-dim hover:text-orange hover:border-orange"
                  >
                    <Plus size={10} /> Add machine
                  </button>
                  <button
                    onClick={seedDefaultMachines}
                    className="inline-flex items-center gap-1.5 font-mono text-[10px] text-dim hover:text-orange transition-colors"
                  >
                    <RefreshCw size={10} /> Reset to default set
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Point scenarios */}
          <section className="color-panel rounded-md p-4">
            <h2 className="mb-3 font-mono text-sm text-orange">Passing Scenarios</h2>
            <div className="flex gap-2 mb-3">
              {SCENARIOS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveScenario(i)}
                  className={`rounded border px-2.5 py-1 font-mono text-[10px] transition-colors ${activeScenario === i ? "border-orange/60 bg-orange/10 text-orange" : "border-border text-dim hover:text-bright"}`}
                >
                  {s.total} pts
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {SCENARIOS[activeScenario].machines.map((m) => (
                <div key={m.name} className="flex items-center justify-between rounded border border-border bg-surface2 px-3 py-2">
                  <div>
                    <span className="font-mono text-xs text-bright">{m.name}</span>
                    {m.note && <span className="ml-2 font-mono text-[10px] text-dim/60">{m.note}</span>}
                  </div>
                  <span className="font-mono text-xs text-success shrink-0">+{m.pts}</span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-border pt-2 mt-2">
                <span className="font-mono text-xs text-dim">Total</span>
                <span className="font-mono text-sm font-bold text-orange">{SCENARIOS[activeScenario].total} / 100</span>
              </div>
            </div>
          </section>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-6">

          {/* Proof commands */}
          <section className="color-panel rounded-md p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-mono text-sm text-orange">Proof Collection</h2>
              <div className="flex gap-1.5">
                {(["linux", "windows"] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOs(o)}
                    className={`rounded border px-2.5 py-1 font-mono text-[10px] uppercase transition-colors ${os === o ? "border-orange/60 bg-orange/10 text-orange" : "border-border text-dim"}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {PROOF_CMDS[os].map((item) => (
                <div key={item.label} className="rounded border border-border bg-surface2 px-3 py-2">
                  <p className="font-mono text-[10px] text-dim mb-1">{item.label}</p>
                  <div className="flex items-start justify-between gap-2">
                    <code className="font-mono text-xs text-success break-all">{item.cmd}</code>
                    <CopyButton value={item.cmd} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Exam tips */}
          <section className="color-panel rounded-md p-4">
            <h2 className="mb-3 font-mono text-sm text-orange flex items-center gap-2">
              <Zap size={13} /> Exam Day Tips
            </h2>
            <div className="space-y-3">
              {TIPS.map((tip) => (
                <div key={tip.title} className="rounded border border-border bg-surface2 px-3 py-2">
                  <p className="font-mono text-xs text-bright mb-0.5">{tip.title}</p>
                  <p className="text-xs text-dim">{tip.body}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Stuck? checklist */}
      <section className="color-panel rounded-md p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-sm text-orange flex items-center gap-2">
            <Target size={13} /> Stuck? 15-Point Reset Checklist
          </h2>
          <span className="font-mono text-[10px] text-dim">{stuckCount} / {STUCK.length} checked</span>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {STUCK.map((item, i) => (
            <label key={i} className={`flex cursor-pointer items-start gap-2.5 rounded border px-3 py-2 transition-colors ${stuckChecked[i] ? "border-success/30 bg-success/5" : "border-border bg-surface2 hover:border-dim/50"}`}>
              <input
                type="checkbox"
                checked={stuckChecked[i]}
                onChange={(e) => {
                  const next = [...stuckChecked];
                  next[i] = e.target.checked;
                  setStuckChecked(next);
                }}
                className="mt-0.5 shrink-0 accent-orange"
              />
              <span className={`font-mono text-[11px] leading-relaxed ${stuckChecked[i] ? "text-dim line-through" : "text-bright"}`}>{item}</span>
            </label>
          ))}
        </div>
        <button
          onClick={() => setStuckChecked(Array(STUCK.length).fill(false))}
          className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-dim hover:text-orange transition-colors"
        >
          <RefreshCw size={10} /> Reset checklist
        </button>
      </section>
    </div>
  );
}
