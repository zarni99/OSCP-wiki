import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

export default function AdLateralPage() {
  const ad = sections.find((section) => section.slug === "ad")!;
  const groups = ad.groups.filter((group) => ["NetExec / nxc", "MSSQL Attacks", "Lateral Movement"].includes(group.title));
  return <SectionPage section={{ ...ad, id: "ad-lateral", title: "AD Lateral", slug: "ad-lateral", groups }} />;
}
