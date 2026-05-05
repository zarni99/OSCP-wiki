import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

export default function ApiAttacksPage() {
  const exploit = sections.find((section) => section.slug === "exploit")!;
  const groups = exploit.groups.filter((group) => group.title === "API Attacks");

  return <SectionPage section={{ ...exploit, id: "api-attacks", title: "API Attacks", slug: "api-attacks", groups }} />;
}
