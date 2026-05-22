import { Section } from "./types";

export const passwordsSection: Section = {
  id: "passwords",
  title: "Passwords",
  slug: "passwords",
  groups: [
    {
      title: "Hashcat",
      subtitle: "GPU-accelerated cracking — use when you have hashes and need speed. Pick the right -m mode first.",
      commands: [
        { id: "pw-1", cmd: "hashcat -m 0 hashes.txt rockyou.txt", description: "Crack MD5 hashes — found in older web apps, PHP, and some databases.", tip: "Not sure of hash type? Use hashid or hash-identifier first.", tags: ["all"] },
        { id: "pw-2", cmd: "hashcat -m 100 hashes.txt rockyou.txt", description: "Crack SHA1 hashes — common in older web apps and some CMS platforms.", tags: ["all"] },
        { id: "pw-3", cmd: "hashcat -m 1000 hashes.txt rockyou.txt", description: "Crack NTLM hashes — use after dumping SAM, secretsdump, or mimikatz output.", tip: "NTLM is fast to crack. Rockyou usually cracks service accounts within minutes on GPU.", tags: ["windows"] },
        { id: "pw-4", cmd: "hashcat -m 1800 hashes.txt rockyou.txt", description: "Crack SHA-512crypt hashes from /etc/shadow — slow but necessary for Linux account hashes.", tip: "SHA-512crypt is intentionally slow. Use -w 3 for full GPU utilization.", tags: ["linux"] },
        { id: "pw-5", cmd: "hashcat -m 3200 hashes.txt rockyou.txt", description: "Crack bcrypt hashes — very slow even on GPU. Only attempt with targeted wordlists.", tip: "bcrypt is the hardest to crack. Consider skipping and finding another privesc path.", tags: ["all"] },
        { id: "pw-6", cmd: "hashcat -m 13100 tgs.txt rockyou.txt", description: "Crack Kerberoast TGS hashes (RC4) — use after GetUserSPNs.py output.", tip: "Add rules for better coverage: -r /usr/share/hashcat/rules/best64.rule", tags: ["ad"] },
        { id: "pw-7", cmd: "hashcat -m 18200 asrep.txt rockyou.txt", description: "Crack AS-REP hashes from ASREPRoasting — output from GetNPUsers.py.", tags: ["ad"] },
        { id: "pw-7a", cmd: "hashcat -m 1000 ntlm.txt rockyou.txt --username", description: "NTLM crack when hashes include username prefix (username:hash format from secretsdump).", tags: ["windows"] },
        { id: "pw-7b", cmd: "hashcat --show hashes.txt", description: "Show previously cracked passwords from hashcat's potfile — check this before re-cracking.", tip: "Results are stored in ~/.hashcat/hashcat.potfile permanently.", tags: ["all"] },
        { id: "pw-7c", cmd: "hashcat --restore", description: "Resume an interrupted cracking session — useful for long bcrypt or SHA-512 jobs.", tags: ["all"] },
        { id: "pw-7d", cmd: "hashcat -a 3 -m 1000 ntlm.txt ?u?l?l?l?l?d?d", description: "Mask attack against NTLM — use when wordlist fails and you know password policy (e.g., 1 upper + 5 lower + 2 digits).", tip: "Common mask patterns: ?u?l?l?l?l?d?d (Password1), ?l?l?l?l?d?d?d?d (pass2024)", tags: ["windows"] },
        { id: "pw-7e", cmd: "hashcat -m 13100 tgs.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule", description: "Kerberoast with rules — significantly increases coverage vs plain wordlist. Try after simple rockyou fails.", tags: ["ad"] },
      ],
    },
    {
      title: "John the Ripper",
      subtitle: "CPU-based cracking — best for format auto-detection and cracking SSH key passphrases or zip files.",
      commands: [
        { id: "pw-8", cmd: "john --wordlist=rockyou.txt hashes.txt", description: "Crack hashes with rockyou wordlist — john auto-detects format in most cases.", tip: "If auto-detection fails, add --format=NT for NTLM, --format=sha512crypt for Linux.", tags: ["all"] },
        { id: "pw-9", cmd: "john --show hashes.txt", description: "Show cracked passwords from john's pot file — always check before re-running.", tags: ["all"] },
        { id: "pw-9a", cmd: "john --format=NT hashes.txt --wordlist=rockyou.txt", description: "Explicit NTLM format — use when john doesn't auto-detect the Windows hash type.", tags: ["windows"] },
        { id: "pw-9b", cmd: "john --incremental hashes.txt", description: "Brute-force all character combinations — use as a last resort when wordlists fail. Very slow.", tags: ["all"] },
        { id: "pw-9c", cmd: "john --single hashes.txt", description: "Single crack mode — uses username and GECOS field as password candidates. Surprisingly effective.", tip: "Often cracks admin:admin, username:username, and common patterns based on account name.", tags: ["all"] },
      ],
    },
    {
      title: "Hydra",
      subtitle: "Online brute-force — use for SSH, RDP, web forms, FTP. Keep thread count low to avoid lockouts.",
      commands: [
        { id: "pw-10", cmd: "hydra -L users.txt -P rockyou.txt ssh://{RHOST}", description: "Brute-force SSH login — use when you have a list of valid usernames from recon.", tip: "Add -t 4 to limit threads and avoid lockouts. -V shows each attempt.", tags: ["linux"], hasVars: true },
        { id: "pw-11", cmd: "hydra -L users.txt -P rockyou.txt rdp://{RHOST}", description: "Brute-force RDP — use when port 3389 is open and you have candidate usernames.", tip: "RDP has lockout policies. Use low thread count: -t 2", tags: ["windows"], hasVars: true },
        { id: "pw-11a", cmd: "hydra -L users.txt -P rockyou.txt smb://{RHOST}", description: "Brute-force SMB authentication — useful for finding weak local accounts.", tags: ["windows"], hasVars: true },
        { id: "pw-11b", cmd: "hydra -l {USER} -P rockyou.txt ftp://{RHOST}", description: "Single-user FTP brute force — use when you know the username from anonymous login or recon.", tags: ["all"], hasVars: true },
        { id: "pw-11c", cmd: "hydra -L users.txt -P rockyou.txt http-post-form '/login:username=^USER^&password=^PASS^:F=Invalid'", description: "Web form brute force — replace the form path, parameters, and failure string with the target's values.", tip: "Capture the login request in Burp to get the exact form parameters and failure message.", tags: ["web"] },
      ],
    },
    {
      title: "Kerberos Password Attacks",
      subtitle: "Use for AD environments — spray to avoid lockout, or roast to get hashes for offline cracking.",
      commands: [
        { id: "pw-12", cmd: "kerbrute passwordspray -d {DOMAIN} --dc {DC} users.txt '{PASS}'", description: "Password spray via Kerberos — stealthier than LDAP spray, no failed NTLM logs.", tip: "Use a single common password to avoid lockout (e.g., 'Summer2024!'). Check lockout policy first.", tags: ["ad"], hasVars: true },
        { id: "pw-12a", cmd: "GetNPUsers.py {DOMAIN}/ -dc-ip {DC} -usersfile users.txt -format hashcat -outputfile asrep.txt", description: "Collect AS-REP hashes for users with pre-auth disabled — no credentials required.", tip: "Combine with kerbrute userenum for a user list: kerbrute userenum -d {DOMAIN} users.txt --dc {DC}", tags: ["ad"], hasVars: true },
        { id: "pw-12b", cmd: "hashcat -m 18200 asrep.txt rockyou.txt", description: "Crack AS-REP hashes after collection — these are often weak service account passwords.", tags: ["ad"] },
      ],
    },
    {
      title: "Wordlist Generation",
      subtitle: "Use when default wordlists fail — generate target-specific lists from the company website or OSINT.",
      commands: [
        { id: "pw-13", cmd: "cewl -d 2 -m 6 -w words.txt {URL}", description: "Scrape the target website for words — generates a company-specific wordlist that beats generic lists.", tip: "Combine with rules: hashcat -m 1000 hashes.txt words.txt -r /usr/share/hashcat/rules/best64.rule", tags: ["web"], hasVars: true },
        { id: "pw-13a", cmd: "crunch 8 8 abcdef123 -o custom.txt", description: "Generate all 8-char combinations from a custom charset — use when you know part of the password pattern.", tags: ["all"] },
        { id: "pw-13b", cmd: "sort -u words.txt /usr/share/wordlists/rockyou.txt > merged.txt", description: "Merge and deduplicate wordlists — combine CeWL output with rockyou for maximum coverage.", tags: ["all"] },
      ],
    },
  ],
};
