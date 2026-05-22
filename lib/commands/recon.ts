import { Section } from "./types";

export const reconSection: Section = {
  id: "recon",
  title: "Recon & Enumeration",
  slug: "recon",
  groups: [
    {
      title: "Nmap Host Discovery",
      subtitle: "Run first — confirm which hosts are alive before committing to a full port scan.",
      commands: [
        { id: "recon-1", cmd: "nmap -sn 192.168.1.0/24", description: "Map all live hosts on a subnet before starting individual scans.", tip: "Faster than scanning each IP separately. Run this first in any multi-host lab.", tags: ["all"] },
        { id: "recon-2", cmd: "nmap -Pn {RHOST}", description: "Use when the target ignores ping — common on Windows hosts and hardened Linux boxes.", tip: "Default assumption on OSCP: always use -Pn if initial scan returns 'host down'.", tags: ["all"], hasVars: true },
        { id: "recon-1a", cmd: "nmap -sn -PE -PP -PS21,22,80,443 -PA3389 {RHOST}", description: "Combine ICMP and TCP probes to detect hosts that block standard ping.", tags: ["all"], hasVars: true },
        { id: "recon-1b", cmd: "fping -asgq 10.10.10.0/24", description: "Fast sweep for live hosts — quicker than nmap on large subnets.", tip: "Use -g for range, -a to show alive only, -q to suppress errors.", tags: ["all"] },
      ],
    },
    {
      title: "Nmap Port Scanning",
      subtitle: "Scan all 65535 ports — OSCP boxes regularly hide services on non-standard ports.",
      commands: [
        { id: "recon-3", cmd: "nmap -sV -sC -O -p- -T4 {RHOST}", description: "Full TCP scan with version detection, default scripts, and OS guess — the standard first scan.", tip: "Save output with -oA scans/target for reference during report writing.", tags: ["all"], hasVars: true },
        { id: "recon-4", cmd: "nmap -sS -sV -sC -p 1-65535 --open {RHOST}", description: "SYN scan all ports, show only open ones — reduces noise from filtered/closed.", tags: ["all"], hasVars: true },
        { id: "recon-5", cmd: "nmap -sU -p 161,69,123,137 {RHOST}", description: "Targeted UDP scan — SNMP (161), TFTP (69), and NTP (123) are common OSCP vectors.", tip: "UDP scanning is slow. Focus on the top candidates rather than all 65535.", tags: ["all"], hasVars: true },
        { id: "recon-6", cmd: "nmap -p- --min-rate 10000 {RHOST}", description: "Rapid full TCP sweep to identify open ports fast — then do a detailed scan on just those ports.", tip: "Two-phase approach: fast sweep first, then: nmap -sV -sC -p <found ports> target.", tags: ["all"], hasVars: true },
        { id: "recon-6a", cmd: "nmap -sT -sV -sC -p- --open {RHOST}", description: "Full connect scan — use when SYN scan requires root and you're running as a normal user.", tags: ["all"], hasVars: true },
        { id: "recon-6b", cmd: "nmap -sV -p- -oA scans/{RHOST}-full {RHOST}", description: "Full scan with output saved in all formats — greppable (.gnmap) is useful for scripts.", tags: ["all"], hasVars: true },
      ],
    },
    {
      title: "Nmap Scripts",
      subtitle: "Run targeted NSE scripts after finding open ports — quick vulnerability checks before manual testing.",
      commands: [
        { id: "recon-7", cmd: "nmap --script vuln {RHOST}", description: "Run all vulnerability scripts against the host — good for a quick win scan.", tip: "Noisy and slow. Use on dedicated targets, not in stealth assessments.", tags: ["all"], hasVars: true },
        { id: "recon-8", cmd: "nmap --script http-enum {RHOST}", description: "Brute-force common web paths using NSE — faster than gobuster for a quick first look.", tags: ["web"], hasVars: true },
        { id: "recon-9", cmd: "nmap --script smb-vuln* -p445 {RHOST}", description: "Check for EternalBlue (MS17-010), SMBleed, and other SMB CVEs in one command.", tip: "Always run on port 445 — EternalBlue is still alive on unpatched OSCP boxes.", tags: ["windows"], hasVars: true },
        { id: "recon-10", cmd: "nmap --script ldap* -p389 {RHOST}", description: "Run all LDAP scripts — useful when you suspect an AD environment.", tags: ["ad"], hasVars: true },
        { id: "recon-10a", cmd: "nmap -p80,443 --script http-title,http-headers,http-methods {RHOST}", description: "Quick HTTP fingerprint — server type, title, and allowed methods in seconds.", tags: ["web"], hasVars: true },
        { id: "recon-10b", cmd: "nmap -p445 --script smb-enum-shares,smb-enum-users {RHOST}", description: "Enumerate SMB shares and user list — works with null session on older boxes.", tags: ["windows"], hasVars: true },
      ],
    },
    {
      title: "Web Enumeration",
      subtitle: "Run as soon as a web port appears — hidden directories and vhosts often contain the entry point.",
      commands: [
        { id: "recon-11", cmd: "gobuster dir -u http://{RHOST} -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,html,txt", description: "Brute-force directories and files — catches hidden upload forms, admin panels, and config files.", tip: "Always add -x extensions matching the server tech. PHP on Apache, aspx on IIS.", tags: ["web"], hasVars: true },
        { id: "recon-12", cmd: "feroxbuster -u http://{RHOST} -w /usr/share/wordlists/dirb/common.txt", description: "Recursive content discovery — follows redirects and finds nested directories automatically.", tip: "Use --filter-status 404,403 to reduce noise if the server returns many false positives.", tags: ["web"], hasVars: true },
        { id: "recon-13", cmd: "ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u http://FUZZ.{RHOST}", description: "Discover virtual hosts on shared servers — separate subdomains often run different apps.", tip: "Add the discovered vhosts to /etc/hosts to access them.", tags: ["web"], hasVars: true },
        { id: "recon-14", cmd: "gobuster vhost -u http://{RHOST} -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt", description: "Alternative vhost discovery using Host header fuzzing.", tags: ["web"], hasVars: true },
        { id: "recon-15", cmd: "whatweb http://{RHOST}", description: "Fingerprint the web stack — CMS, framework, server version — to target the right exploits.", tip: "Version info here feeds directly into searchsploit. Note everything.", tags: ["web"], hasVars: true },
        { id: "recon-16", cmd: "wafw00f http://{RHOST}", description: "Detect a WAF before starting web attacks — changes your payload and timing strategy.", tags: ["web"], hasVars: true },
        { id: "recon-17", cmd: "nikto -h http://{RHOST}", description: "Fast misconfiguration scan — finds default files, outdated software, and dangerous headers.", tip: "Noisy and detectable. Use early in the engagement or after you know no IDS is watching.", tags: ["web"], hasVars: true },
        { id: "recon-17a", cmd: "ffuf -w /usr/share/seclists/Discovery/Web-Content/common.txt -u {URL}/FUZZ -mc all -fs 0", description: "General path fuzzing — match all status codes to catch unusual responses.", tags: ["web"], hasVars: true },
        { id: "recon-17b", cmd: "ffuf -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -u {URL}/FUZZ -recursion -recursion-depth 2", description: "Recursive directory fuzzing — finds paths that only appear inside subdirectories.", tags: ["web"], hasVars: true },
        { id: "recon-17c", cmd: "curl -i {URL}/robots.txt", description: "Check robots.txt first — administrators often disallow paths they want to hide.", tip: "robots.txt disallowed entries are a free hint list. Always check it manually.", tags: ["web"], hasVars: true },
      ],
    },
    {
      title: "DNS Enumeration",
      subtitle: "Attempt zone transfers and subdomain brute-force — misconfigurations here give free host lists.",
      commands: [
        { id: "recon-18", cmd: "dig axfr @{DC} {DOMAIN}", description: "Attempt a DNS zone transfer — misconfigured DNS servers leak the entire host list.", tip: "If this works, you get every hostname in the domain. Always try before anything else on DNS.", tags: ["all"], hasVars: true },
        { id: "recon-19", cmd: "dnsrecon -d {DOMAIN} -t std", description: "Standard DNS recon — pulls A, MX, NS, SOA, and SRV records automatically.", tags: ["all"], hasVars: true },
        { id: "recon-20", cmd: "dnsenum {DOMAIN}", description: "DNS enum with brute-force subdomain discovery — combines multiple techniques.", tags: ["all"], hasVars: true },
        { id: "recon-20a", cmd: "dig any {DOMAIN} @{DC}", description: "Pull all DNS record types from a specific nameserver — reveals full zone structure.", tags: ["all"], hasVars: true },
        { id: "recon-20b", cmd: "dig +short ns {DOMAIN}", description: "List nameservers — useful to find internal resolvers before zone transfer attempts.", tags: ["all"], hasVars: true },
        { id: "recon-20c", cmd: "host -t mx {DOMAIN}", description: "List mail servers — reveals internal hostnames and sometimes cloud mail providers.", tags: ["all"], hasVars: true },
      ],
    },
    {
      title: "SNMP Enumeration",
      subtitle: "Run when UDP 161 is open — community strings expose user lists, routes, and running processes.",
      commands: [
        { id: "recon-33", cmd: "snmpwalk -v2c -c public {RHOST}", description: "Walk the full SNMP tree with the default 'public' community string — dumps users, routes, interfaces.", tip: "Try 'private' and 'manager' if public fails. Many devices never change the default.", tags: ["all"], hasVars: true },
        { id: "recon-33a", cmd: "onesixtyone -c /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt {RHOST}", description: "Brute-force SNMP community strings — finds non-default strings quickly.", tags: ["all"], hasVars: true },
        { id: "recon-33b", cmd: "snmp-check {RHOST}", description: "Formatted SNMP enumeration — presents users, processes, and network info in readable output.", tags: ["all"], hasVars: true },
      ],
    },
    {
      title: "RPC / NFS Enumeration",
      subtitle: "Run when ports 111 or 2049 are open — NFS exports frequently contain SSH keys and credentials.",
      commands: [
        { id: "recon-34", cmd: "rpcinfo -p {RHOST}", description: "List all RPC services and their ports — reveals NFS, NIS, and other internal services.", tags: ["linux"], hasVars: true },
        { id: "recon-34a", cmd: "showmount -e {RHOST}", description: "List exported NFS shares — shows which paths are shared and any host restrictions.", tip: "A share exported to '*' (everyone) is an immediate loot opportunity.", tags: ["linux"], hasVars: true },
        { id: "recon-34b", cmd: "mount -t nfs {RHOST}:/share /mnt/nfs -o nolock", description: "Mount the NFS export locally to browse files — look for SSH keys, config files, and scripts.", tags: ["linux"], hasVars: true },
      ],
    },
    {
      title: "SMB Enumeration",
      subtitle: "Run whenever port 445 is open — null sessions and share misconfigurations are common OSCP entry points.",
      commands: [
        { id: "recon-21", cmd: "smbclient -L //{RHOST} -N", description: "List SMB shares without credentials — works on boxes with null session enabled.", tip: "Look for non-standard shares (not IPC$, ADMIN$, C$) — they often contain files.", tags: ["windows"], hasVars: true },
        { id: "recon-22", cmd: "enum4linux-ng -A {RHOST}", description: "Full SMB enumeration (modern fork) — users, shares, password policy, OS info, and domain data in one run.", tip: "The password policy output tells you if account lockout is enabled before spraying. Legacy 'enum4linux' is unmaintained — prefer -ng.", tags: ["windows", "ad"], hasVars: true },
        { id: "recon-23", cmd: "smbmap -H {RHOST}", description: "Map SMB shares with permissions — shows READ/WRITE access at a glance.", tip: "WRITE access to a share means you can drop files — useful for relay attacks or planting payloads.", tags: ["windows"], hasVars: true },
        { id: "recon-24", cmd: "nxc smb {RHOST} -u '' -p '' --shares", description: "Test SMB null session and list accessible shares with NetExec (nxc).", tip: "NetExec replaces the EOL CrackMapExec. See the AD section for the full nxc cheatsheet.", tags: ["windows", "ad"], hasVars: true },
        { id: "recon-25", cmd: "rpcclient -U '' -N {RHOST}", description: "Connect via RPC null session — run enumdomusers, enumdomgroups inside for user lists.", tip: "Inside rpcclient: 'enumdomusers' for users, 'querydominfo' for domain info.", tags: ["windows"], hasVars: true },
        { id: "recon-25a", cmd: "nxc smb {RHOST} -u {USER} -p {PASS} --users", description: "Enumerate domain users with valid credentials — faster than rpcclient.", tags: ["windows", "ad"], hasVars: true },
        { id: "recon-25b", cmd: "smbclient //{RHOST}/{SHARE} -U {USER}", description: "Connect to a specific share as a named user — use 'get' to download files.", tags: ["windows"], hasVars: true },
      ],
    },
    {
      title: "LDAP Enumeration",
      subtitle: "Use in AD environments — anonymous LDAP binds can dump the entire user and computer list.",
      commands: [
        { id: "recon-26", cmd: "ldapsearch -x -H ldap://{DC} -s base", description: "Query the root DSE — reveals domain naming context needed for further queries.", tags: ["ad"], hasVars: true },
        { id: "recon-27", cmd: "ldapsearch -x -H ldap://{DC} -b 'dc=corp,dc=local'", description: "Dump all LDAP entries anonymously — works when null bind is enabled.", tip: "Replace dc=corp,dc=local with the actual domain components from the base query.", tags: ["ad"], hasVars: true },
        { id: "recon-28", cmd: "windapsearch -d {DOMAIN} --dc-ip {DC} -U", description: "Enumerate AD users cleanly — better formatted output than raw ldapsearch.", tags: ["ad"], hasVars: true },
        { id: "recon-28a", cmd: "ldapsearch -x -H ldap://{DC} -D '{DOMAIN}\\{USER}' -w '{PASS}' -b 'dc=corp,dc=local'", description: "Authenticated LDAP dump — use after getting any valid domain credentials.", tags: ["ad"], hasVars: true },
        { id: "recon-28b", cmd: "windapsearch -d {DOMAIN} --dc-ip {DC} --groups", description: "Enumerate AD groups — look for custom groups like 'IT Admins' or 'VPN Users'.", tags: ["ad"], hasVars: true },
      ],
    },
    {
      title: "Kerberos Enumeration",
      subtitle: "Use in AD scope — enumerate valid usernames before attempting any password attacks.",
      commands: [
        { id: "recon-35", cmd: "kerbrute userenum --dc {DC} -d {DOMAIN} users.txt", description: "Validate a username list against Kerberos — no lockout risk, no password needed.", tip: "Use /usr/share/seclists/Usernames/Names/names.txt as a starting wordlist.", tags: ["ad"], hasVars: true },
        { id: "recon-35a", cmd: "GetADUsers.py -all {DOMAIN}/{USER}:{PASS} -dc-ip {DC}", description: "Dump all AD users once you have any valid credentials.", tags: ["ad"], hasVars: true },
        { id: "recon-35b", cmd: "nmap -p88 --script krb5-enum-users --script-args krb5-enum-users.realm='{DOMAIN}',userdb=users.txt {DC}", description: "Kerberos user enumeration via nmap NSE — useful when Impacket tools aren't available.", tags: ["ad"], hasVars: true },
      ],
    },
    {
      title: "HTTP / API Discovery",
      subtitle: "Run on any web service — undocumented API endpoints and exposed schemas are common entry points.",
      commands: [
        { id: "recon-36", cmd: "ffuf -w /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt -u {URL}/FUZZ", description: "Enumerate common API endpoint names — finds /api/v1/users, /api/admin, etc.", tags: ["web"], hasVars: true },
        { id: "recon-36a", cmd: "curl -s {URL}/swagger.json | jq .", description: "Retrieve the OpenAPI schema — maps every endpoint, method, and parameter of the API.", tip: "Also try /api-docs, /openapi.json, /v1/swagger.json. Exposed schemas are a goldmine.", tags: ["web"], hasVars: true },
        { id: "recon-36b", cmd: "curl -i -X OPTIONS {URL}/api", description: "Check which HTTP methods the API allows — PUT/DELETE/PATCH may be abusable.", tags: ["web"], hasVars: true },
      ],
    },
    {
      title: "Windows Recon (Post-Foothold)",
      subtitle: "Run after landing a Windows shell — these are pure enumeration commands. Privilege-elevation tactics live in the Privilege Escalation section.",
      commands: [
        { id: "win-recon-1", cmd: "systeminfo", description: "OS version, patch level, hotfixes, and domain membership — feed to wesng for missing-patch exploits.", tip: "Save with: systeminfo > sysinfo.txt — then run wesng --muc-lookup sysinfo.txt on attacker.", tags: ["windows"] },
        { id: "win-recon-2", cmd: "wmic service get name,displayname,pathname,startmode 2>nul || Get-CimInstance -ClassName Win32_Service | Select Name,DisplayName,PathName,StartMode", description: "List services with their binary paths — find unquoted paths and weak permissions. PowerShell fallback for newer Windows (wmic deprecated in 11 22H2+).", tags: ["windows"] },
        { id: "win-recon-3", cmd: "wmic product get name,version,vendor 2>nul || Get-CimInstance -ClassName Win32_Product | Select Name,Version,Vendor", description: "List installed software with versions — identify outdated apps with public exploits. PowerShell fallback when wmic is missing.", tags: ["windows"] },
        { id: "win-recon-4", cmd: "tasklist /svc", description: "Map processes to services — identify custom services running as SYSTEM that may be exploitable.", tags: ["windows"] },
        { id: "win-recon-5", cmd: "wmic qfe get Caption,Description,HotFixID,InstalledOn 2>nul || Get-HotFix", description: "List installed patches — compare against CVE database for the OS to find unpatched flaws.", tags: ["windows"] },
        { id: "win-recon-6", cmd: "netstat -ano", description: "Show listening ports + PIDs — find internally-bound services not exposed externally. Correlate PID with tasklist /svc.", tags: ["windows"] },
        { id: "win-recon-7", cmd: "schtasks /query /fo LIST /v", description: "Scheduled tasks — flag ones running as SYSTEM with writable scripts or binaries.", tags: ["windows"] },
        { id: "win-recon-8", cmd: "net share", description: "List local SMB shares — may reveal sensitive directories or share misconfigurations for lateral movement.", tags: ["windows"] },
        { id: "win-recon-9", cmd: "ipconfig /all && arp -a && route print", description: "Network recon — additional interfaces, internal subnets, and recently contacted hosts for pivoting.", tags: ["windows"] },
        { id: "win-recon-10", cmd: "Get-WmiObject -Class Win32_GroupUser | Where-Object {$_.GroupComponent -match 'Administrators'}", description: "PowerShell list of all members of the local Administrators group — works even when net localgroup output is restricted.", tags: ["windows"] },
      ],
    },
    {
      title: "Searchsploit",
      subtitle: "Run after identifying every service version — correlate versions to public exploits before testing manually.",
      commands: [
        { id: "recon-29", cmd: "searchsploit {SERVICE} {VERSION}", description: "Search exploit-db for public exploits matching a service and version.", tip: "Be specific: 'Apache 2.4.49' beats 'Apache'. Version matters — exploits are version-specific.", tags: ["all"], hasVars: true },
        { id: "recon-30", cmd: "searchsploit -m {EXPLOIT_ID}", description: "Copy the exploit file locally — always read the code before running it.", tip: "Never run an exploit without reading it first. Adapt LHOST/LPORT and file paths.", tags: ["all"], hasVars: true },
        { id: "recon-31", cmd: "searchsploit -x {EXPLOIT_ID}", description: "View exploit source inline without copying — quick check of requirements.", tags: ["all"], hasVars: true },
        { id: "recon-32", cmd: "searchsploit --nmap scan.xml", description: "Feed your nmap XML output directly to searchsploit — auto-matches all discovered versions.", tip: "Most efficient use: run nmap with -oX, then feed that file here for instant vuln correlation.", tags: ["all"] },
        { id: "recon-32a", cmd: "searchsploit -w {SERVICE}", description: "Show direct exploit-db.com links — useful to find updated versions or PoC details.", tags: ["all"], hasVars: true },
        { id: "recon-32b", cmd: "searchsploit -u", description: "Update the local exploit-db mirror to catch recent CVEs.", tags: ["all"] },
      ],
    },
  ],
};
