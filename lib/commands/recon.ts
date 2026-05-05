import { Section } from "./types";

export const reconSection: Section = {
  id: "recon",
  title: "Recon & Enumeration",
  slug: "recon",
  groups: [
    {
      title: "Nmap Host Discovery",
      commands: [
        { id: "recon-1", cmd: "nmap -sn 192.168.1.0/24", description: "Ping sweep subnet.", tags: ["all"] },
        { id: "recon-2", cmd: "nmap -Pn {RHOST}", description: "Skip host discovery.", tags: ["all"], hasVars: true },
        { id: "recon-1a", cmd: "nmap -sn -PE -PP -PS21,22,80,443 -PA3389 {RHOST}", description: "ICMP and TCP/ACK host discovery.", tags: ["all"], hasVars: true },
        { id: "recon-1b", cmd: "fping -asgq 10.10.10.0/24", description: "Fast live-host discovery with fping.", tags: ["all"] },
      ],
    },
    {
      title: "Nmap Port Scanning",
      commands: [
        { id: "recon-3", cmd: "nmap -sV -sC -O -p- -T4 {RHOST}", description: "Full TCP with scripts/service/os.", tags: ["all"], hasVars: true },
        { id: "recon-4", cmd: "nmap -sS -sV -sC -p 1-65535 --open {RHOST}", description: "SYN scan open ports only.", tags: ["all"], hasVars: true },
        { id: "recon-5", cmd: "nmap -sU -p 161,69,123 {RHOST}", description: "Focused UDP scan.", tags: ["all"], hasVars: true },
        { id: "recon-6", cmd: "nmap -p- --min-rate 10000 {RHOST}", description: "Fast full TCP sweep.", tags: ["all"], hasVars: true },
        { id: "recon-6a", cmd: "nmap -sT -sV -sC -p- --open {RHOST}", description: "Connect scan fallback.", tags: ["all"], hasVars: true },
        { id: "recon-6b", cmd: "nmap -sV -p- -oA scans/{RHOST}-full {RHOST}", description: "Save scan output in all formats.", tags: ["all"], hasVars: true },
      ],
    },
    {
      title: "Nmap Scripts",
      commands: [
        { id: "recon-7", cmd: "nmap --script vuln {RHOST}", description: "General vuln script sweep.", tags: ["all"], hasVars: true },
        { id: "recon-8", cmd: "nmap --script http-enum {RHOST}", description: "HTTP paths enum.", tags: ["web"], hasVars: true },
        { id: "recon-9", cmd: "nmap --script smb-vuln* -p445 {RHOST}", description: "SMB vuln scripts.", tags: ["windows"], hasVars: true },
        { id: "recon-10", cmd: "nmap --script ldap* -p389 {RHOST}", description: "LDAP NSE scripts.", tags: ["ad"], hasVars: true },
        { id: "recon-10a", cmd: "nmap -p80,443 --script http-title,http-headers,http-methods {RHOST}", description: "HTTP script baseline.", tags: ["web"], hasVars: true },
        { id: "recon-10b", cmd: "nmap -p445 --script smb-enum-shares,smb-enum-users {RHOST}", description: "SMB users/shares scripts.", tags: ["windows"], hasVars: true },
      ],
    },
    {
      title: "Web Enumeration",
      commands: [
        { id: "recon-11", cmd: "gobuster dir -u http://{RHOST} -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -x php,html,txt", description: "Directory brute force.", tags: ["web"], hasVars: true },
        { id: "recon-12", cmd: "feroxbuster -u http://{RHOST} -w /usr/share/wordlists/dirb/common.txt", description: "Recursive content discovery.", tags: ["web"], hasVars: true },
        { id: "recon-13", cmd: "ffuf -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt -u http://FUZZ.{RHOST}", description: "Virtual host brute force.", tags: ["web"], hasVars: true },
        { id: "recon-14", cmd: "gobuster vhost -u http://{RHOST} -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt", description: "Alternative vhost discovery.", tags: ["web"], hasVars: true },
        { id: "recon-15", cmd: "whatweb http://{RHOST}", description: "Fingerprint web tech stack.", tags: ["web"], hasVars: true },
        { id: "recon-16", cmd: "wafw00f http://{RHOST}", description: "Detect web application firewall.", tags: ["web"], hasVars: true },
        { id: "recon-17", cmd: "nikto -h http://{RHOST}", description: "Nikto web misconfiguration scan.", tags: ["web"], hasVars: true },
        { id: "recon-17a", cmd: "ffuf -w /usr/share/seclists/Discovery/Web-Content/common.txt -u {URL}/FUZZ -mc all -fs 0", description: "General path fuzzing.", tags: ["web"], hasVars: true },
        { id: "recon-17b", cmd: "ffuf -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt -u {URL}/FUZZ -recursion -recursion-depth 2", description: "Recursive directory fuzzing.", tags: ["web"], hasVars: true },
        { id: "recon-17c", cmd: "curl -i {URL}/robots.txt", description: "Check robots for hidden paths.", tags: ["web"], hasVars: true },
      ],
    },
    {
      title: "DNS Enumeration",
      commands: [
        { id: "recon-18", cmd: "dig axfr @{DC} {DOMAIN}", description: "Attempt DNS zone transfer.", tags: ["all"], hasVars: true },
        { id: "recon-19", cmd: "dnsrecon -d {DOMAIN} -t std", description: "Standard DNS recon.", tags: ["all"], hasVars: true },
        { id: "recon-20", cmd: "dnsenum {DOMAIN}", description: "DNS enum and bruteforce.", tags: ["all"], hasVars: true },
        { id: "recon-20a", cmd: "dig any {DOMAIN} @{DC}", description: "Pull DNS records from target resolver.", tags: ["all"], hasVars: true },
        { id: "recon-20b", cmd: "dig +short ns {DOMAIN}", description: "List nameservers.", tags: ["all"], hasVars: true },
        { id: "recon-20c", cmd: "host -t mx {DOMAIN}", description: "List MX records.", tags: ["all"], hasVars: true },
      ],
    },
    {
      title: "SNMP Enumeration",
      commands: [
        { id: "recon-33", cmd: "snmpwalk -v2c -c public {RHOST}", description: "Walk SNMP with common community string.", tags: ["all"], hasVars: true },
        { id: "recon-33a", cmd: "onesixtyone -c /usr/share/seclists/Discovery/SNMP/common-snmp-community-strings.txt {RHOST}", description: "Bruteforce SNMP community strings.", tags: ["all"], hasVars: true },
        { id: "recon-33b", cmd: "snmp-check {RHOST}", description: "Quick SNMP service enumeration.", tags: ["all"], hasVars: true },
      ],
    },
    {
      title: "RPC/NFS Enumeration",
      commands: [
        { id: "recon-34", cmd: "rpcinfo -p {RHOST}", description: "List RPC services.", tags: ["linux"], hasVars: true },
        { id: "recon-34a", cmd: "showmount -e {RHOST}", description: "List exported NFS shares.", tags: ["linux"], hasVars: true },
        { id: "recon-34b", cmd: "mount -t nfs {RHOST}:/share /mnt/nfs -o nolock", description: "Mount NFS share for inspection.", tags: ["linux"], hasVars: true },
      ],
    },
    {
      title: "Kerberos Enumeration",
      commands: [
        { id: "recon-35", cmd: "kerbrute userenum --dc {DC} -d {DOMAIN} users.txt", description: "Enumerate valid AD usernames via Kerberos.", tags: ["ad"], hasVars: true },
        { id: "recon-35a", cmd: "GetADUsers.py -all {DOMAIN}/{USER}:{PASS} -dc-ip {DC}", description: "Enumerate AD users with credentials.", tags: ["ad"], hasVars: true },
        { id: "recon-35b", cmd: "nmap -p88 --script krb5-enum-users --script-args krb5-enum-users.realm='{DOMAIN}',userdb=users.txt {DC}", description: "Nmap kerberos user enum.", tags: ["ad"], hasVars: true },
      ],
    },
    {
      title: "HTTP/API Discovery",
      commands: [
        { id: "recon-36", cmd: "ffuf -w /usr/share/seclists/Discovery/Web-Content/api/api-endpoints.txt -u {URL}/FUZZ", description: "Enumerate common API endpoints.", tags: ["web"], hasVars: true },
        { id: "recon-36a", cmd: "curl -s {URL}/swagger.json | jq .", description: "Retrieve OpenAPI schema.", tags: ["web"], hasVars: true },
        { id: "recon-36b", cmd: "curl -i -X OPTIONS {URL}/api", description: "Inspect allowed API methods.", tags: ["web"], hasVars: true },
      ],
    },
    {
      title: "SMB Enumeration",
      commands: [
        { id: "recon-21", cmd: "smbclient -L //{RHOST} -N", description: "List SMB shares anonymously.", tags: ["windows"], hasVars: true },
        { id: "recon-22", cmd: "enum4linux -a {RHOST}", description: "SMB users/shares/policies enum.", tags: ["windows"], hasVars: true },
        { id: "recon-23", cmd: "smbmap -H {RHOST}", description: "SMB share permissions map.", tags: ["windows"], hasVars: true },
        { id: "recon-24", cmd: "crackmapexec smb {RHOST} -u '' -p '' --shares", description: "Quick SMB null session test.", tags: ["windows"], hasVars: true },
        { id: "recon-25", cmd: "rpcclient -U '' -N {RHOST}", description: "RPC enum via null auth.", tags: ["windows"], hasVars: true },
        { id: "recon-25a", cmd: "crackmapexec smb {RHOST} -u {USER} -p {PASS} --users", description: "Enumerate users with credentials.", tags: ["windows"], hasVars: true },
        { id: "recon-25b", cmd: "smbclient //{RHOST}/{SHARE} -U {USER}", description: "Access SMB share with user auth.", tags: ["windows"], hasVars: true },
      ],
    },
    {
      title: "LDAP Enumeration",
      commands: [
        { id: "recon-26", cmd: "ldapsearch -x -H ldap://{DC} -s base", description: "Basic LDAP root DSE query.", tags: ["ad"], hasVars: true },
        { id: "recon-27", cmd: "ldapsearch -x -H ldap://{DC} -b 'dc=corp,dc=local'", description: "Dump LDAP entries.", tags: ["ad"], hasVars: true },
        { id: "recon-28", cmd: "windapsearch -d {DOMAIN} --dc-ip {DC} -U", description: "Enumerate AD users.", tags: ["ad"], hasVars: true },
        { id: "recon-28a", cmd: "ldapsearch -x -H ldap://{DC} -D '{DOMAIN}\\{USER}' -w '{PASS}' -b 'dc=corp,dc=local'", description: "Authenticated LDAP dump.", tags: ["ad"], hasVars: true },
        { id: "recon-28b", cmd: "windapsearch -d {DOMAIN} --dc-ip {DC} --groups", description: "Enumerate AD groups.", tags: ["ad"], hasVars: true },
      ],
    },
    {
      title: "Searchsploit",
      commands: [
        { id: "recon-29", cmd: "searchsploit {SERVICE} {VERSION}", description: "Search exploit-db quickly.", tags: ["all"], hasVars: true },
        { id: "recon-30", cmd: "searchsploit -m {EXPLOIT_ID}", description: "Mirror exploit locally.", tags: ["all"], hasVars: true },
        { id: "recon-31", cmd: "searchsploit -x {EXPLOIT_ID}", description: "Examine exploit source inline.", tags: ["all"], hasVars: true },
        { id: "recon-32", cmd: "searchsploit --nmap scan.xml", description: "Correlate nmap XML with exploits.", tags: ["all"] },
        { id: "recon-32a", cmd: "searchsploit -w {SERVICE}", description: "Show exploit-db web links.", tags: ["all"], hasVars: true },
        { id: "recon-32b", cmd: "searchsploit -u", description: "Update local exploit-db mirror.", tags: ["all"] },
      ],
    },
  ],
};
