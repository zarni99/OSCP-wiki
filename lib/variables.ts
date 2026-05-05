import { commandVariables } from "@/lib/commands";

export const variableKeys = commandVariables.map((v) => v.replace(/[{}]/g, ""));

export const extractVars = (template: string) =>
  Array.from(new Set(Array.from(template.matchAll(/\{([A-Z0-9_]+)\}/g)).map((m) => m[1])));

export const applyVariables = (template: string, values: Record<string, string>) =>
  template.replace(/\{([A-Z0-9_]+)\}/g, (_, key: string) => values[key] || `{${key}}`);

export const missingVariables = (template: string, values: Record<string, string>) =>
  extractVars(template).filter((key) => !values[key]?.trim());
