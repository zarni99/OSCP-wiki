import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

export default function PersistencePage() {
  const ad = sections.find((section) => section.slug === "ad")!;
  const post = sections.find((section) => section.slug === "post")!;
  const groups = [
    ...ad.groups.filter((group) => ["Golden/Silver Tickets"].includes(group.title)),
    ...post.groups.filter((group) => ["Persistence Quick Ops"].includes(group.title)),
  ];

  return <SectionPage section={{ ...ad, id: "persistence", title: "Persistence", slug: "persistence", groups }} />;
}
