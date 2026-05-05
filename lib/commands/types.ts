export type Tag = "linux" | "windows" | "ad" | "web" | "all";

export interface Command {
  id: string;
  cmd: string;
  description: string;
  tags: Tag[];
  hasVars?: boolean;
}

export interface CommandGroup {
  title: string;
  commands: Command[];
}

export interface Section {
  id: string;
  title: string;
  slug: string;
  groups: CommandGroup[];
}
