"use client";

import { ReportData } from "./types";

const field = "rounded border border-violet/40 bg-surface px-3 py-2 text-bright placeholder:text-dim/60 focus:border-core/60 outline-none";
const label = "block mb-1 text-xs font-mono uppercase tracking-wider text-dim";
const textarea = `${field} min-h-[140px] w-full resize-y`;

interface Props {
  data: ReportData;
  update: (patch: Partial<ReportData>) => void;
}

export default function ADChainTab({ data, update }: Props) {
  const adTargets = data.targets.filter((t) => t.isAD);

  return (
    <div className="space-y-6">
      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-adblue flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-adblue" />
          Active Directory Attack Chain
        </h3>
        <p className="text-xs text-dim leading-relaxed">
          Document the full Active Directory attack chain across all AD machines. The OSCP+ exam
          requires you to demonstrate a complete attack path from initial foothold to Domain Admin.
          Points are awarded for the complete chain, not individual machines.
        </p>

        {adTargets.length === 0 ? (
          <div className="rounded border border-adblue/30 bg-adblue/5 p-6 text-center">
            <p className="text-sm text-dim">
              No targets marked as Active Directory. Mark targets with the{" "}
              <span className="text-adblue font-mono text-xs">AD</span> checkbox in the Targets tab.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {adTargets.map((t, i) => (
                <div key={t.id} className="inline-flex items-center gap-2 rounded border border-adblue/30 bg-adblue/10 px-3 py-1.5 text-sm">
                  <span className="font-mono text-adblue">{t.name || `AD-${i + 1}`}</span>
                  <span className="text-dim">({t.ip || "no IP"})</span>
                  {i < adTargets.length - 1 && <span className="text-adblue ml-2">→</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="color-panel rounded-lg p-5 space-y-3">
        <h3 className="font-heading text-lg text-violet flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-violet" />
          AD Attack Chain Narrative
        </h3>
        <p className="text-xs text-dim">
          Provide a comprehensive step-by-step narrative of your AD attack chain. Include initial
          foothold, credential harvesting, lateral movement, and privilege escalation to Domain Admin.
        </p>
        <textarea
          value={data.adChainSummary}
          onChange={(e) => update({ adChainSummary: e.target.value })}
          placeholder={`Phase 1: Initial Foothold
- Target: MS01 (192.168.x.x)
- Discovered web application vulnerability on port 80
- Exploited SQL injection to gain initial shell as iis_user

Phase 2: Credential Harvesting
- Ran Mimikatz/SharpHound on MS01
- Extracted NTLM hashes for domain users
- Identified kerberoastable service accounts

Phase 3: Lateral Movement
- Used Pass-the-Hash to move to DC01
- Or: Used Kerberoasting to crack service account password

Phase 4: Domain Admin
- Exploited AD CS misconfiguration (ESC1)
- Or: Exploited unconstrained delegation
- Achieved Domain Admin access on DC01`}
          className={`${textarea} min-h-[300px] font-mono text-sm`}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
