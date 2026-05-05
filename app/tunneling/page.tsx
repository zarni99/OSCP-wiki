import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

export default function TunnelingPage() {
  const post = sections.find((section) => section.slug === "post")!;
  const groups = post.groups.filter((group) => group.title === "Pivoting & Tunneling");

  return <SectionPage section={{ ...post, id: "tunneling", title: "Tunneling", slug: "tunneling", groups }} />;
}
