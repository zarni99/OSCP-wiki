import toast from "react-hot-toast";
import { ReportData, emptyReport } from "./types";

/** Max compressed size we'll accept per image before warning (5 MB). */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * Compress an image File:
 *  - Resize so longest side <= maxDim
 *  - Encode as JPEG at the given quality
 *  - Return a data URL
 *
 * Cuts storage 5-10x vs raw PNG uploads, which is critical because
 * report data is persisted to localStorage (5-10MB quota).
 */
export async function compressImage(
  file: File,
  maxDim = 1600,
  quality = 0.8,
): Promise<string> {
  // SVGs cannot be reliably rasterized via this path — keep them as-is.
  if (file.type === "image/svg+xml") {
    return readAsDataURL(file);
  }

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  const { width: w, height: h } = img;
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const targetW = Math.round(w * scale);
  const targetH = Math.round(h * scale);

  // No resize and already JPEG → return original to avoid recompression artifacts.
  if (scale === 1 && file.type === "image/jpeg") {
    return dataUrl;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    toast.error("Image compression unavailable — using original (may be large)");
    return dataUrl;
  }

  // Fill white background so transparent PNGs don't go black when flattened to JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const result = canvas.toDataURL("image/jpeg", quality);

  // Warn if the compressed result is still very large.
  const approxBytes = Math.round((result.length * 3) / 4);
  if (approxBytes > MAX_IMAGE_BYTES) {
    toast(`Image is ${formatBytes(approxBytes)} — consider using a smaller screenshot`, { icon: "⚠️" });
  }

  return result;
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Format a Date as a relative "Xs ago" / "Xm ago" string. */
export function relativeTime(from: number, now: number = Date.now()): string {
  const diff = Math.max(0, Math.floor((now - from) / 1000));
  if (diff < 3) return "just now";
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/** Estimate the report's serialized size in bytes. */
export function estimateSize(data: ReportData): number {
  try {
    return new Blob([JSON.stringify(data)]).size;
  } catch {
    return 0;
  }
}

/** Human-readable byte size. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Trigger a browser download for a string blob. */
export function downloadFile(filename: string, content: string, mime = "application/json") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Validate-and-merge an imported report against the empty template. */
export function safeMergeReport(raw: unknown): ReportData | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const candidate = raw as Partial<ReportData>;

  // Require at least one recognisable field to be a report backup.
  if (!Array.isArray(candidate.targets) && typeof candidate.candidateName !== "string") {
    return null;
  }

  // Reject pathologically large target arrays.
  if (Array.isArray(candidate.targets) && candidate.targets.length > 50) {
    return null;
  }

  // Strip unknown top-level keys by building against the empty template.
  const base = emptyReport();
  const allowed = Object.keys(base) as (keyof ReportData)[];
  const sanitised: Partial<ReportData> = {};
  for (const key of allowed) {
    if (key in candidate) {
      (sanitised as Record<string, unknown>)[key] = candidate[key];
    }
  }

  return { ...base, ...sanitised };
}

/** Build a default filename like "report-OS-12345-2026-05-16.json". */
export function defaultBackupFilename(osid: string, ext = "json"): string {
  const date = new Date().toISOString().split("T")[0];
  const id = (osid || "report").replace(/[^a-zA-Z0-9-]/g, "_");
  return `report-${id}-${date}.${ext}`;
}
