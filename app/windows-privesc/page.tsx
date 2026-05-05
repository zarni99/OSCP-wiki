import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

export default function WindowsPrivescPage() {
  const privesc = sections.find((section) => section.slug === "privesc")!;
  const groups = privesc.groups
    .map((group) => ({
      ...group,
      commands: group.commands.filter((command) => command.tags.includes("windows") || command.tags.includes("all")),
    }))
    .filter((group) => group.commands.length > 0);

  return <SectionPage section={{ ...privesc, id: "windows-privesc", title: "Windows PrivEsc", slug: "windows-privesc", groups }} />;
}
