"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import {
  emptyReport,
  emptyTarget,
  ReportData,
  Target,
} from "@/app/report/types";

function isQuotaError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED";
}

const STORAGE_KEY = "oscp-report-v2";

interface ReportCtx {
  data: ReportData;
  loaded: boolean;
  lastSaved: number | null;
  saving: boolean;
  setData: (next: ReportData | ((prev: ReportData) => ReportData)) => void;
  update: (patch: Partial<ReportData>) => void;
  updateTarget: (id: string, patch: Partial<Target>) => void;
  addTarget: (partial?: Partial<Target>) => Target;
  removeTarget: (id: string) => void;
  reset: () => void;
  /** Force a synchronous save (e.g. Ctrl+S). Returns true on success. */
  saveNow: () => boolean;
}

const Ctx = createContext<ReportCtx | null>(null);

/**
 * Migrate legacy data shapes when loading from localStorage.
 * Ensures new fields (examPoints, localCaptured, proofCaptured, examNotes,
 * exploitationSteps, privescSteps) exist on every target.
 */
function migrateTarget(t: Partial<Target>): Target {
  const base = emptyTarget();
  return {
    ...base,
    ...t,
    // Derive capture booleans from flag strings if missing (back-compat).
    localCaptured: t.localCaptured ?? !!t.localTxt,
    proofCaptured: t.proofCaptured ?? !!t.proofTxt,
    examPoints: t.examPoints ?? (t.isAD ? 10 : 20),
    examNotes: t.examNotes ?? "",
    exploitationSteps: t.exploitationSteps ?? [],
    privescSteps: t.privescSteps ?? [],
  };
}

function migrateData(raw: Partial<ReportData>): ReportData {
  const base = emptyReport();
  const targets = Array.isArray(raw.targets) && raw.targets.length > 0
    ? raw.targets.map((t) => migrateTarget(t as Partial<Target>))
    : base.targets;
  return { ...base, ...raw, targets };
}

export function ReportProvider({ children }: { children: ReactNode }) {
  const [data, _setData] = useState<ReportData>(emptyReport());
  const [loaded, setLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Hold the most recent data in a ref for debounced save and external triggers.
  const latestRef = useRef(data);
  latestRef.current = data;

  // Load once on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        _setData(migrateData(JSON.parse(raw)));
        setLastSaved(Date.now());
      } catch (err) {
        console.error("ReportProvider: parse failed, starting fresh", err);
      }
    }
    setLoaded(true);
  }, []);

  // Debounced save: 500ms after the last edit.
  useEffect(() => {
    if (!loaded) return;
    setSaving(true);
    const handle = window.setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(latestRef.current));
        setLastSaved(Date.now());
      } catch (err) {
        console.error("ReportProvider: save failed", err);
        if (isQuotaError(err)) {
          toast.error("Storage full — export a JSON backup then clear old screenshots to free space", { duration: 8000 });
        } else {
          toast.error("Auto-save failed — use Ctrl+S or export JSON to avoid losing data");
        }
      } finally {
        setSaving(false);
      }
    }, 500);
    return () => window.clearTimeout(handle);
  }, [data, loaded]);

  // Cross-tab/window sync via the storage event.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        _setData(migrateData(JSON.parse(e.newValue)));
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setData = useCallback(
    (next: ReportData | ((prev: ReportData) => ReportData)) => {
      _setData((prev) => (typeof next === "function" ? (next as (p: ReportData) => ReportData)(prev) : next));
    },
    [],
  );

  const update = useCallback((patch: Partial<ReportData>) => {
    _setData((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateTarget = useCallback((id: string, patch: Partial<Target>) => {
    _setData((prev) => ({
      ...prev,
      targets: prev.targets.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const addTarget = useCallback((partial?: Partial<Target>): Target => {
    const t = { ...emptyTarget(), ...(partial ?? {}) };
    _setData((prev) => ({ ...prev, targets: [...prev.targets, t] }));
    return t;
  }, []);

  const removeTarget = useCallback((id: string) => {
    _setData((prev) => ({ ...prev, targets: prev.targets.filter((t) => t.id !== id) }));
  }, []);

  const reset = useCallback(() => {
    _setData(emptyReport());
  }, []);

  const saveNow = useCallback((): boolean => {
    if (typeof window === "undefined") return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(latestRef.current));
      setLastSaved(Date.now());
      return true;
    } catch (err) {
      console.error("ReportProvider: saveNow failed", err);
      if (isQuotaError(err)) {
        toast.error("Storage full — export a JSON backup to avoid losing data", { duration: 8000 });
      }
      return false;
    }
  }, []);

  return (
    <Ctx.Provider
      value={{ data, loaded, lastSaved, saving, setData, update, updateTarget, addTarget, removeTarget, reset, saveNow }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useReport(): ReportCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useReport must be used within <ReportProvider>");
  return ctx;
}
