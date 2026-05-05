import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

export default function AdPage() {
  return <SectionPage section={sections.find((section) => section.slug === "ad")!} />;
}
