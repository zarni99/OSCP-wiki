"use client";

import { Shield } from "lucide-react";
import { ReportData } from "./types";

const field = "rounded border border-violet/40 bg-surface px-3 py-2 text-bright placeholder:text-dim/60 focus:border-core/60 outline-none";
const label = "block mb-1 text-xs font-mono uppercase tracking-wider text-dim";

interface Props {
  data: ReportData;
  update: (patch: Partial<ReportData>) => void;
}

export default function CoverTab({ data, update }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="color-panel rounded-lg p-6 text-center space-y-3">
        <Shield size={40} className="mx-auto text-core" />
        <h2 className="font-heading text-2xl text-gradient-brand">
          Offensive Security
        </h2>
        <p className="font-heading text-lg text-violet">
          OSCP+ Penetration Test Report
        </p>
        <div className="mx-auto h-px w-48 bg-gradient-to-r from-transparent via-violet/50 to-transparent" />
        <p className="text-xs text-dim font-mono">CONFIDENTIAL</p>
      </div>

      {/* Candidate Information */}
      <div className="color-panel rounded-lg p-5 space-y-4">
        <h3 className="font-heading text-lg text-core flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-core" />
          Candidate Information
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={label}>Full Name</label>
            <input value={data.candidateName} onChange={(e) => update({ candidateName: e.target.value })} placeholder="John Doe" className={`${field} w-full`} spellCheck={false} autoComplete="off" />
          </div>
          <div>
            <label className={label}>OS-ID</label>
            <input value={data.osid} onChange={(e) => update({ osid: e.target.value })} placeholder="OS-XXXXX" className={`${field} w-full`} spellCheck={false} autoComplete="off" />
          </div>
          <div>
            <label className={label}>Email Address</label>
            <input value={data.email} onChange={(e) => update({ email: e.target.value })} placeholder="candidate@email.com" className={`${field} w-full`} spellCheck={false} autoComplete="off" />
          </div>
          <div>
            <label className={label}>Exam Date</label>
            <input type="date" value={data.examDate} onChange={(e) => update({ examDate: e.target.value })} className={`${field} w-full`} />
          </div>
          <div>
            <label className={label}>Report Date</label>
            <input type="date" value={data.reportDate} onChange={(e) => update({ reportDate: e.target.value })} className={`${field} w-full`} />
          </div>
          <div>
            <label className={label}>Report Version</label>
            <input value={data.version} onChange={(e) => update({ version: e.target.value })} placeholder="1.0" className={`${field} w-full`} spellCheck={false} autoComplete="off" />
          </div>
        </div>
      </div>

      {/* Document Control */}
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-violet flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet" />
          Document Control
        </h3>
        <div className="overflow-hidden rounded border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface2 text-dim font-mono text-xs">
                <th className="px-4 py-2 text-left">Field</th>
                <th className="px-4 py-2 text-left">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr><td className="px-4 py-2 text-dim">Title</td><td className="px-4 py-2">OSCP+ Penetration Test Report</td></tr>
              <tr><td className="px-4 py-2 text-dim">Author</td><td className="px-4 py-2">{data.candidateName || "—"}</td></tr>
              <tr><td className="px-4 py-2 text-dim">OS-ID</td><td className="px-4 py-2 font-mono text-core">{data.osid || "—"}</td></tr>
              <tr><td className="px-4 py-2 text-dim">Version</td><td className="px-4 py-2">{data.version || "1.0"}</td></tr>
              <tr><td className="px-4 py-2 text-dim">Classification</td><td className="px-4 py-2 text-red font-mono text-xs">CONFIDENTIAL</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
