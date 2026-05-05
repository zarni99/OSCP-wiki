import { Section } from "./types";

export const passwordsSection: Section = {
  id: "passwords",
  title: "Passwords",
  slug: "passwords",
  groups: [
    { title: "Hashcat", commands: [
      { id: "pw-1", cmd: "hashcat -m 0 hashes.txt rockyou.txt", description: "MD5 mode 0.", tags: ["all"] },
      { id: "pw-2", cmd: "hashcat -m 100 hashes.txt rockyou.txt", description: "SHA1 mode 100.", tags: ["all"] },
      { id: "pw-3", cmd: "hashcat -m 1000 hashes.txt rockyou.txt", description: "NTLM mode 1000.", tags: ["windows"] },
      { id: "pw-4", cmd: "hashcat -m 1800 hashes.txt rockyou.txt", description: "SHA512crypt mode 1800.", tags: ["linux"] },
      { id: "pw-5", cmd: "hashcat -m 3200 hashes.txt rockyou.txt", description: "bcrypt mode 3200.", tags: ["all"] },
      { id: "pw-6", cmd: "hashcat -m 13100 tgs.txt rockyou.txt", description: "Kerberos TGS mode 13100.", tags: ["ad"] },
      { id: "pw-7", cmd: "hashcat -m 18200 asrep.txt rockyou.txt", description: "Kerberos AS-REP mode 18200.", tags: ["ad"] },
      { id: "pw-7a", cmd: "hashcat -m 1000 ntlm.txt rockyou.txt --username", description: "NTLM with user prefix.", tags: ["windows"] },
      { id: "pw-7b", cmd: "hashcat --show hashes.txt", description: "Show recovered credentials.", tags: ["all"] },
      { id: "pw-7c", cmd: "hashcat --restore", description: "Resume previous cracking session.", tags: ["all"] },
      { id: "pw-7d", cmd: "hashcat -a 3 -m 1000 ntlm.txt ?u?l?l?l?l?d?d", description: "Mask attack against NTLM.", tags: ["windows"] },
      { id: "pw-7e", cmd: "hashcat -m 13100 tgs.txt /usr/share/wordlists/rockyou.txt -r /usr/share/hashcat/rules/best64.rule", description: "Kerberos crack with rules.", tags: ["ad"] },
    ]},
    { title: "John the Ripper", commands: [
      { id: "pw-8", cmd: "john --wordlist=rockyou.txt hashes.txt", description: "Crack hashes with wordlist.", tags: ["all"] },
      { id: "pw-9", cmd: "john --show hashes.txt", description: "Show cracked output.", tags: ["all"] },
      { id: "pw-9a", cmd: "john --format=NT hashes.txt --wordlist=rockyou.txt", description: "Explicit NT format cracking.", tags: ["windows"] },
      { id: "pw-9b", cmd: "john --incremental hashes.txt", description: "Incremental brute-force mode.", tags: ["all"] },
      { id: "pw-9c", cmd: "john --single hashes.txt", description: "Single mode with user metadata.", tags: ["all"] },
    ]},
    { title: "Hydra", commands: [
      { id: "pw-10", cmd: "hydra -L users.txt -P rockyou.txt ssh://{RHOST}", description: "Bruteforce SSH creds.", tags: ["linux"], hasVars: true },
      { id: "pw-11", cmd: "hydra -L users.txt -P rockyou.txt rdp://{RHOST}", description: "Bruteforce RDP creds.", tags: ["windows"], hasVars: true },
      { id: "pw-11a", cmd: "hydra -L users.txt -P rockyou.txt smb://{RHOST}", description: "Bruteforce SMB creds.", tags: ["windows"], hasVars: true },
      { id: "pw-11b", cmd: "hydra -l {USER} -P rockyou.txt ftp://{RHOST}", description: "Single-user FTP brute force.", tags: ["all"], hasVars: true },
      { id: "pw-11c", cmd: "hydra -L users.txt -P rockyou.txt http-post-form '/login:username=^USER^&password=^PASS^:F=Invalid'", description: "Web form brute force pattern.", tags: ["web"] },
    ]},
    { title: "Kerberos Password Attacks", commands: [
      { id: "pw-12", cmd: "kerbrute passwordspray -d {DOMAIN} --dc {DC} users.txt '{PASS}'", description: "Kerberos password spray.", tags: ["ad"], hasVars: true },
      { id: "pw-12a", cmd: "GetNPUsers.py {DOMAIN}/ -dc-ip {DC} -usersfile users.txt -format hashcat -outputfile asrep.txt", description: "Collect AS-REP hashes for offline cracking.", tags: ["ad"], hasVars: true },
      { id: "pw-12b", cmd: "hashcat -m 18200 asrep.txt rockyou.txt", description: "Crack AS-REP hashes.", tags: ["ad"] },
    ]},
    { title: "Wordlist Generation", commands: [
      { id: "pw-13", cmd: "cewl -d 2 -m 6 -w words.txt {URL}", description: "Generate target-based wordlist.", tags: ["web"], hasVars: true },
      { id: "pw-13a", cmd: "crunch 8 8 abcdef123 -o custom.txt", description: "Generate custom charset wordlist.", tags: ["all"] },
      { id: "pw-13b", cmd: "sort -u words.txt /usr/share/wordlists/rockyou.txt > merged.txt", description: "Merge and deduplicate wordlists.", tags: ["all"] },
    ]},
  ],
};
