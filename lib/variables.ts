import { commandVariables } from "@/lib/commands";

const VAR_PATTERN = /\{([A-Z0-9_]+)\}/g;

export const variableKeys = commandVariables.map((v) => v.replace(/[{}]/g, ""));

export const extractVars = (template: string) =>
  Array.from(new Set(Array.from(template.matchAll(VAR_PATTERN)).map((m) => m[1])));

export const applyVariables = (template: string, values: Record<string, string>) =>
  template.replace(VAR_PATTERN, (_, key: string) => values[key] || `{${key}}`);

export const missingVariables = (template: string, values: Record<string, string>) =>
  extractVars(template).filter((key) => !values[key]?.trim());
