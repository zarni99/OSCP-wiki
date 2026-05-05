import { adSection } from "./ad";
import { bofSection } from "./bof";
import { exploitSection } from "./exploit";
import { passwordsSection } from "./passwords";
import { postSection } from "./post";
import { privescSection } from "./privesc";
import { reconSection } from "./recon";
import { webSection } from "./web";
import { Section } from "./types";

export * from "./types";

export const commandVariables = ["{LHOST}", "{RHOST}", "{LPORT}", "{RPORT}", "{DOMAIN}", "{DC}", "{USER}", "{PASS}", "{HASH}", "{URL}"] as const;

export const sections: Section[] = [reconSection, exploitSection, privescSection, adSection, webSection, passwordsSection, postSection, bofSection];

export const getAllCommands = () =>
  sections.flatMap((section) =>
    section.groups.flatMap((group) =>
      group.commands.map((command) => ({ ...command, section: section.title, group: group.title })),
    ),
  );

export const totalCommandCount = getAllCommands().length;
