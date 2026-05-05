import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

export default function FileTransferPage() {
  const post = sections.find((section) => section.slug === "post")!;
  const groups = post.groups.filter((group) => group.title.includes("File Transfer"));

  return <SectionPage section={{ ...post, id: "file-transfer", title: "File Transfer", slug: "file-transfer", groups }} />;
}
