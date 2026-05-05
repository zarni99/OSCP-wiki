"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { variableKeys } from "@/lib/variables";
import { Command, Tag } from "@/lib/commands";

type CopyMode = "rendered" | "template";
interface CopyHistoryItem {
  id: string;
  cmd: string;
  at: number;
  machineId: string;
  machineName: string;
}
interface MachineItem {
  id: string;
  name: string;
}
interface TimelineItem {
  id: string;
  cmd: string;
  at: number;
  machineId: string;
  machineName: string;
}
interface CustomCommand extends Command {
  createdAt: number;
}

interface VariablesContextValue {
  values: Record<string, string>;
  setValue: (key: string, value: string) => void;
  copyMode: CopyMode;
  setCopyMode: (mode: CopyMode) => void;
  reset: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  history: CopyHistoryItem[];
  pushHistory: (item: Omit<CopyHistoryItem, "at" | "machineId" | "machineName">) => void;
  clearHistory: () => void;
  machines: MachineItem[];
  activeMachineId: string;
  setActiveMachineId: (id: string) => void;
  addMachine: (name: string) => void;
  removeMachine: (id: string) => void;
  timeline: TimelineItem[];
  clearTimeline: () => void;
  customCommands: CustomCommand[];
  addCustomCommand: (payload: { cmd: string; description: string; tags: Tag[] }) => void;
  removeCustomCommand: (id: string) => void;
}

const VariablesContext = createContext<VariablesContextValue | null>(null);

const STORAGE_KEY = "oscp-vars";
const COPY_MODE_KEY = "oscp-copy-mode";
const FAVORITES_KEY = "oscp-favorites";
const HISTORY_KEY = "oscp-copy-history";
const MACHINES_KEY = "oscp-machines";
const ACTIVE_MACHINE_KEY = "oscp-active-machine";
const TIMELINE_KEY = "oscp-timeline";
const CUSTOM_COMMANDS_KEY = "oscp-custom-commands";

const emptyValues = () =>
  variableKeys.reduce<Record<string, string>>((acc, key) => {
    acc[key] = "";
    return acc;
  }, {});

export function VariablesProvider({ children }: { children: React.ReactNode }) {
  const [values, setValues] = useState<Record<string, string>>(emptyValues);
  const [copyMode, setCopyMode] = useState<CopyMode>("rendered");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<CopyHistoryItem[]>([]);
  const [machines, setMachines] = useState<MachineItem[]>([{ id: "machine-1", name: "MACHINE-01" }]);
  const [activeMachineId, setActiveMachineId] = useState("machine-1");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [customCommands, setCustomCommands] = useState<CustomCommand[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      setValues({ ...emptyValues(), ...JSON.parse(raw) });
    }
    const rawMode = localStorage.getItem(COPY_MODE_KEY);
    if (rawMode === "template" || rawMode === "rendered") {
      setCopyMode(rawMode);
    }
    const rawFav = localStorage.getItem(FAVORITES_KEY);
    if (rawFav) setFavorites(JSON.parse(rawFav));
    const rawHistory = localStorage.getItem(HISTORY_KEY);
    if (rawHistory) setHistory(JSON.parse(rawHistory));
    const rawMachines = localStorage.getItem(MACHINES_KEY);
    if (rawMachines) setMachines(JSON.parse(rawMachines));
    const rawActiveMachine = localStorage.getItem(ACTIVE_MACHINE_KEY);
    if (rawActiveMachine) setActiveMachineId(rawActiveMachine);
    const rawTimeline = localStorage.getItem(TIMELINE_KEY);
    if (rawTimeline) setTimeline(JSON.parse(rawTimeline));
    const rawCustom = localStorage.getItem(CUSTOM_COMMANDS_KEY);
    if (rawCustom) setCustomCommands(JSON.parse(rawCustom));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }, [values]);

  useEffect(() => {
    localStorage.setItem(COPY_MODE_KEY, copyMode);
  }, [copyMode]);
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);
  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);
  useEffect(() => {
    localStorage.setItem(MACHINES_KEY, JSON.stringify(machines));
  }, [machines]);
  useEffect(() => {
    localStorage.setItem(ACTIVE_MACHINE_KEY, activeMachineId);
  }, [activeMachineId]);
  useEffect(() => {
    localStorage.setItem(TIMELINE_KEY, JSON.stringify(timeline));
  }, [timeline]);
  useEffect(() => {
    localStorage.setItem(CUSTOM_COMMANDS_KEY, JSON.stringify(customCommands));
  }, [customCommands]);

  const value = useMemo(
    () => ({
      values,
      setValue: (key: string, value: string) => setValues((prev) => ({ ...prev, [key]: value })),
      copyMode,
      setCopyMode,
      reset: () => setValues(emptyValues()),
      favorites,
      toggleFavorite: (id: string) => setFavorites((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id])),
      isFavorite: (id: string) => favorites.includes(id),
      history,
      pushHistory: (item: Omit<CopyHistoryItem, "at" | "machineId" | "machineName">) => {
        const activeMachine = machines.find((m) => m.id === activeMachineId) || machines[0];
        const entry = {
          ...item,
          at: Date.now(),
          machineId: activeMachine?.id || "machine-1",
          machineName: activeMachine?.name || "MACHINE-01",
        };
        setHistory((prev) => [entry, ...prev].slice(0, 20));
        setTimeline((prev) => [entry, ...prev].slice(0, 1000));
      },
      clearHistory: () => setHistory([]),
      machines,
      activeMachineId,
      setActiveMachineId,
      addMachine: (name: string) => {
        const clean = name.trim();
        if (!clean) return;
        const id = `machine-${Date.now()}`;
        setMachines((prev) => [...prev, { id, name: clean }]);
        setActiveMachineId(id);
      },
      removeMachine: (id: string) => {
        setMachines((prev) => {
          const next = prev.filter((m) => m.id !== id);
          if (next.length === 0) return [{ id: "machine-1", name: "MACHINE-01" }];
          return next;
        });
        setTimeline((prev) => prev.filter((entry) => entry.machineId !== id));
        setHistory((prev) => prev.filter((entry) => entry.machineId !== id));
        if (activeMachineId === id) {
          setActiveMachineId((machines.find((m) => m.id !== id)?.id) || "machine-1");
        }
      },
      timeline,
      clearTimeline: () => setTimeline([]),
      customCommands,
      addCustomCommand: ({ cmd, description, tags }: { cmd: string; description: string; tags: Tag[] }) =>
        setCustomCommands((prev) => [
          {
            id: `custom-${Date.now()}`,
            cmd,
            description,
            tags,
            createdAt: Date.now(),
          },
          ...prev,
        ]),
      removeCustomCommand: (id: string) => setCustomCommands((prev) => prev.filter((command) => command.id !== id)),
    }),
    [activeMachineId, copyMode, customCommands, favorites, history, machines, timeline, values],
  );

  return <VariablesContext.Provider value={value}>{children}</VariablesContext.Provider>;
}

export const useVariables = () => {
  const ctx = useContext(VariablesContext);
  if (!ctx) throw new Error("useVariables must be used within VariablesProvider");
  return ctx;
};
