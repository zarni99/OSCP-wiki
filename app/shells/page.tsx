import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

export default function ShellsPage() {
  const exploit = sections.find((section) => section.slug === "exploit")!;
  const groups = exploit.groups.filter((group) =>
    ["Shell Stabilization TTY", "MSFvenom Payloads", "Listeners", "Windows Execution & Shells"].includes(group.title),
  );

  return <SectionPage section={{ ...exploit, id: "shells", title: "Shells", slug: "shells", groups }} />;
}
