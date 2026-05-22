import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

export default function AdReconPage() {
  const ad = sections.find((section) => section.slug === "ad")!;
  const groups = ad.groups.filter((group) => ["AD Enumeration"].includes(group.title));
  return <SectionPage section={{ ...ad, id: "ad-recon", title: "AD Recon", slug: "ad-recon", groups }} />;
}
