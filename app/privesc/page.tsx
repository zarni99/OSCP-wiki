import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

export default function PrivescPage() {
  return <SectionPage section={sections.find((section) => section.slug === "privesc")!} />;
}
