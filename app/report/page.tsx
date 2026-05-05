"use client";

import { Plus, X } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";

interface Screenshot {
  id: string;
  name: string;
  dataUrl: string;
  caption: string;
}
interface Machine {
  id: string;
  name: string;
  ip: string;
  os: "linux" | "windows" | "unknown";
  points: "10" | "20" | "25";
  localTxt: string;
  proofTxt: string;
  vulnerabilities: string;
  enumSteps: string;
  exploitSteps: string;
  privescSteps: string;
  notes: string;
  screenshots: Screenshot[];
}

const emptyMachine = (): Machine => ({
  id: crypto.randomUUID(),
  name: "TARGET-01",
  ip: "",
  os: "unknown",
  points: "20",
  localTxt: "",
  proofTxt: "",
  vulnerabilities: "",
  enumSteps: "",
  exploitSteps: "",
  privescSteps: "",
  notes: "",
  screenshots: [],
});

const key = "oscp-report-builder";

export default function ReportPage() {
  const [candidateName, setCandidateName] = useState("");
  const [osid, setOsid] = useState("");
  const [examDate, setExamDate] = useState("");
  const [machines, setMachines] = useState<Machine[]>([emptyMachine()]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const data = JSON.parse(raw);
    setCandidateName(data.candidateName || "");
    setOsid(data.osid || "");
    setExamDate(data.examDate || "");
    setMachines(data.machines?.length ? data.machines : [emptyMachine()]);
  }, []);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify({ candidateName, osid, examDate, machines }));
  }, [candidateName, examDate, machines, osid]);

  const machine = machines[active];

  const updateMachine = (patch: Partial<Machine>) => {
    setMachines((prev) => prev.map((m, i) => (i === active ? { ...m, ...patch } : m)));
  };

  const addMachine = () => {
    setMachines((prev) => [...prev, emptyMachine()]);
    setActive(machines.length);
  };

  const removeMachine = (index: number) => {
    if (machines.length === 1) return;
    setMachines((prev) => prev.filter((_, i) => i !== index));
    setActive((v) => Math.max(0, v > index ? v - 1 : v === index ? 0 : v));
  };

  const uploadScreens = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const data = await Promise.all(
      files.map(
        (file) =>
          new Promise<Screenshot>((resolve) => {
            const reader = new FileReader();
            reader.onload = () =>
              resolve({
                id: crypto.randomUUID(),
                name: file.name,
                dataUrl: String(reader.result),
                caption: "",
              });
            reader.readAsDataURL(file);
          }),
      ),
    );
    updateMachine({ screenshots: [...machine.screenshots, ...data] });
  };

  const exportPdf = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const pages = machines
      .map(
        (m) => `
      <section class="page">
        <h2>${m.name} (${m.ip})</h2>
        <p><b>OS:</b> ${m.os} | <b>Points:</b> ${m.points}</p>
        <p class="flag"><b>local.txt:</b> ${m.localTxt || "-"}</p>
        <p class="flag"><b>proof.txt:</b> ${m.proofTxt || "-"}</p>
        <h3>Vulnerability Summary</h3><pre>${m.vulnerabilities}</pre>
        <h3>Enumeration Steps</h3><pre>${m.enumSteps}</pre>
        <h3>Exploitation Steps</h3><pre>${m.exploitSteps}</pre>
        <h3>Privilege Escalation Steps</h3><pre>${m.privescSteps}</pre>
        <h3>Additional Notes</h3><pre>${m.notes}</pre>
        <h3>Screenshots</h3>
        <div class="shots">${m.screenshots.map((s) => `<figure><img src="${s.dataUrl}" /><figcaption>${s.caption || s.name}</figcaption></figure>`).join("")}</div>
      </section>`,
      )
      .join("");

    win.document.write(`
      <html><head><title>OSCP Report</title>
      <style>
        body { font-family: Arial, sans-serif; color:#111; padding:20px; }
        .page { page-break-after: always; }
        .flag { background:#e7ffe7; border:1px solid #59aa59; padding:6px; }
        .shots { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
        img { max-width:100%; border:1px solid #ddd; }
        pre { white-space:pre-wrap; border:1px solid #ddd; padding:8px; }
        @media print { .page { break-after: page; } }
      </style>
      </head><body>
        <section class="page">
          <h1>OSCP Exam Report</h1>
          <p><b>Candidate:</b> ${candidateName || "-"}</p>
          <p><b>OSID:</b> ${osid || "-"}</p>
          <p><b>Exam Date:</b> ${examDate || "-"}</p>
        </section>
        ${pages}
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl text-gradient-brand">Report Builder</h1>
        <button onClick={exportPdf} className="rounded border border-danger/50 bg-gradient-to-r from-danger/15 to-violet/10 px-3 py-2 text-sm text-danger hover:border-danger">Export PDF</button>
      </div>
      <div className="color-panel grid gap-2 rounded-md p-3 md:grid-cols-3">
        <input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="Candidate Name" className="rounded border border-violet/40 bg-surface px-3 py-2" spellCheck={false} autoComplete="off" />
        <input value={osid} onChange={(e) => setOsid(e.target.value)} placeholder="OSID" className="rounded border border-violet/40 bg-surface px-3 py-2" spellCheck={false} autoComplete="off" />
        <input value={examDate} onChange={(e) => setExamDate(e.target.value)} placeholder="Exam Date" className="rounded border border-violet/40 bg-surface px-3 py-2" spellCheck={false} autoComplete="off" />
      </div>

      <div className="flex flex-wrap gap-2">
        {machines.map((m, idx) => {
          const color = m.localTxt && m.proofTxt ? "bg-green" : m.localTxt ? "bg-orange" : "bg-dim";
          return (
            <button key={m.id} onClick={() => setActive(idx)} className={`inline-flex items-center gap-2 rounded border px-3 py-1 ${idx === active ? "border-core bg-core/10 text-core" : "border-border text-dim hover:border-violet/40"}`}>
              <span className={`h-2 w-2 rounded-full ${color}`} />
              {m.name}
              {machines.length > 1 ? (
                <X
                  size={12}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeMachine(idx);
                  }}
                />
              ) : null}
            </button>
          );
        })}
        <button onClick={addMachine} className="inline-flex items-center gap-1 rounded border border-dashed border-violet/40 px-3 py-1 text-dim hover:text-violet">
          <Plus size={14} /> Add Machine
        </button>
      </div>

      <div className="color-panel space-y-3 rounded-md p-4">
        <div className="grid gap-2 md:grid-cols-4">
          <input value={machine.name} onChange={(e) => updateMachine({ name: e.target.value })} placeholder="Machine name" className="rounded border border-violet/40 bg-surface px-3 py-2" spellCheck={false} autoComplete="off" />
          <input value={machine.ip} onChange={(e) => updateMachine({ ip: e.target.value })} placeholder="IP" className="rounded border border-violet/40 bg-surface px-3 py-2" spellCheck={false} autoComplete="off" />
          <select value={machine.os} onChange={(e) => updateMachine({ os: e.target.value as Machine["os"] })} className="rounded border border-violet/40 bg-surface px-3 py-2">
            <option value="unknown">unknown</option><option value="linux">linux</option><option value="windows">windows</option>
          </select>
          <select value={machine.points} onChange={(e) => updateMachine({ points: e.target.value as Machine["points"] })} className="rounded border border-violet/40 bg-surface px-3 py-2">
            <option value="10">10</option><option value="20">20</option><option value="25">25</option>
          </select>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <input value={machine.localTxt} onChange={(e) => updateMachine({ localTxt: e.target.value })} placeholder="local.txt flag" className="rounded border border-warn/60 bg-warn/10 px-3 py-2" spellCheck={false} autoComplete="off" />
          <input value={machine.proofTxt} onChange={(e) => updateMachine({ proofTxt: e.target.value })} placeholder="proof.txt flag" className="rounded border border-success/60 bg-success/10 px-3 py-2" spellCheck={false} autoComplete="off" />
        </div>
        {(
          [
            ["vulnerabilities", "Vulnerability Summary"],
            ["enumSteps", "Enumeration Steps"],
            ["exploitSteps", "Exploitation Steps"],
            ["privescSteps", "Privilege Escalation Steps"],
            ["notes", "Additional Notes"],
          ] as const
        ).map(([field, label]) => (
          <textarea
            key={field}
            value={machine[field]}
            onChange={(e) => updateMachine({ [field]: e.target.value })}
            placeholder={label}
            className="min-h-28 w-full rounded border border-border bg-surface2 px-3 py-2 focus:border-violet/60 outline-none"
            spellCheck={false}
            autoComplete="off"
          />
        ))}
        <label className="block cursor-pointer rounded border border-dashed border-violet/40 bg-surface2 p-4 text-center text-sm text-dim hover:border-violet">
          Upload screenshots
          <input type="file" accept="image/*" multiple onChange={uploadScreens} className="hidden" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {machine.screenshots.map((s) => (
            <div key={s.id} className="color-panel rounded-md p-2">
              <img src={s.dataUrl} alt={s.name} className="mb-2 h-28 w-full rounded object-cover" />
              <input
                value={s.caption}
                onChange={(e) => updateMachine({ screenshots: machine.screenshots.map((i) => (i.id === s.id ? { ...i, caption: e.target.value } : i)) })}
                placeholder="Caption"
                className="w-full rounded border border-border bg-surface px-2 py-1 text-xs focus:border-violet/60 outline-none"
                spellCheck={false}
                autoComplete="off"
              />
              <button onClick={() => updateMachine({ screenshots: machine.screenshots.filter((i) => i.id !== s.id) })} className="mt-2 text-xs text-red">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
