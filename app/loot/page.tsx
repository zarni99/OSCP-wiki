import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

export default function LootPage() {
  const post = sections.find((section) => section.slug === "post")!;
  const privesc = sections.find((section) => section.slug === "privesc")!;

  const postGroups = post.groups.filter((group) => ["Meterpreter"].includes(group.title));
  const privescGroups = privesc.groups.filter((group) => ["Credential Hunting"].includes(group.title));

  return (
    <SectionPage
      section={{
        id: "loot",
        title: "Loot & Credentials",
        slug: "loot",
        groups: [...postGroups, ...privescGroups],
      }}
    />
  );
}
