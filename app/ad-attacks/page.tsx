import SectionPage from "@/components/SectionPage";
import { sections } from "@/lib/commands";

export default function AdAttacksPage() {
  const ad = sections.find((section) => section.slug === "ad")!;
  const groups = ad.groups.filter((group) =>
    ["ASREPRoasting", "Kerberoasting", "Pass-the-Hash", "Credential Dumping", "ADCS Abuse", "Delegation Abuse"].includes(group.title),
  );
  return <SectionPage section={{ ...ad, id: "ad-attacks", title: "AD Attacks", slug: "ad-attacks", groups }} />;
}
