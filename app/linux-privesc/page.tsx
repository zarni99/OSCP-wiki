import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

export default function LinuxPrivescPage() {
  const privesc = sections.find((section) => section.slug === "privesc")!;
  const groups = privesc.groups
    .map((group) => ({
      ...group,
      commands: group.commands.filter((command) => command.tags.includes("linux") || command.tags.includes("all")),
    }))
    .filter((group) => group.commands.length > 0);

  return <SectionPage section={{ ...privesc, id: "linux-privesc", title: "Linux PrivEsc", slug: "linux-privesc", groups }} />;
}
