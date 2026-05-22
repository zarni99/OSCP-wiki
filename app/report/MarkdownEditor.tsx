"use client";

import { Eye, Pencil, ImagePlus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChangeEvent,
  DragEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { compressImage } from "./utils";

interface Props {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  mono?: boolean;
  /** Show the preview tab toggle. Default true. */
  preview?: boolean;
}

/**
 * Textarea with markdown support:
 *  - Edit / Preview toggle
 *  - Paste image from clipboard → compressed JPEG inserted at cursor
 *  - Drag-and-drop image file → same behavior
 *  - File picker button for explicit uploads
 *
 * Stores images inline as data URLs in the markdown source. With image
 * compression (compressImage), this stays storage-safe (~150-300KB per image).
 */
export default function MarkdownEditor({
  value,
  onChange,
  placeholder,
  className = "",
  minHeight = 120,
  mono = false,
  preview = true,
}: Props) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Memoize parsed markdown so switching edit→preview doesn't re-parse on unrelated renders.
  const remarkPlugins = useMemo(() => [remarkGfm], []);
  const previewContent = useMemo(() => value.trim(), [value]);

  const insertAtCursor = useCallback(
    (insertion: string) => {
      const ta = taRef.current;
      if (!ta) {
        onChange(value + insertion);
        return;
      }
      const start = ta.selectionStart ?? value.length;
      const end = ta.selectionEnd ?? value.length;
      const next = value.slice(0, start) + insertion + value.slice(end);
      onChange(next);
      // Restore cursor after the inserted text.
      requestAnimationFrame(() => {
        ta.focus();
        const newPos = start + insertion.length;
        ta.setSelectionRange(newPos, newPos);
      });
    },
    [onChange, value],
  );

  const handleImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      try {
        const dataUrl = await compressImage(file);
        const caption = file.name.replace(/\.[^.]+$/, "");
        insertAtCursor(`\n\n![${caption}](${dataUrl})\n\n`);
        toast.success("Image inserted");
      } catch {
        toast.error("Could not process image");
      }
    },
    [insertAtCursor],
  );

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = Array.from(e.clipboardData?.items ?? []);
      const imageItem = items.find((it) => it.type.startsWith("image/"));
      if (!imageItem) return;
      const file = imageItem.getAsFile();
      if (!file) return;
      e.preventDefault();
      await handleImageFile(file);
    },
    [handleImageFile],
  );

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      setIsDraggingOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) await handleImageFile(file);
    },
    [handleImageFile],
  );

  const handleFilePick = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (file) await handleImageFile(file);
    },
    [handleImageFile],
  );

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 rounded-t border border-b-0 border-violet/30 bg-surface2 px-2 py-1">
        <div className="flex items-center gap-1">
          {preview ? (
            <>
              <button
                type="button"
                onClick={() => setMode("edit")}
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] uppercase transition-colors ${
                  mode === "edit"
                    ? "bg-orange/10 text-orange"
                    : "text-dim hover:text-bright"
                }`}
              >
                <Pencil size={10} /> Edit
              </button>
              <button
                type="button"
                onClick={() => setMode("preview")}
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] uppercase transition-colors ${
                  mode === "preview"
                    ? "bg-orange/10 text-orange"
                    : "text-dim hover:text-bright"
                }`}
              >
                <Eye size={10} /> Preview
              </button>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-dim/60 hidden sm:inline">
            paste / drop / click to add image · markdown supported
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFilePick}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Insert image at cursor"
            className="inline-flex items-center gap-1 rounded border border-violet/30 px-1.5 py-0.5 font-mono text-[10px] text-dim hover:border-violet hover:text-violet"
          >
            <ImagePlus size={10} /> img
          </button>
        </div>
      </div>

      {/* Editor / Preview body */}
      {mode === "edit" ? (
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            if (!isDraggingOver) setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          placeholder={placeholder}
          style={{ minHeight }}
          className={`w-full resize-y rounded-b border border-violet/30 bg-surface px-3 py-2 outline-none transition-colors focus:border-core/60 ${
            mono ? "font-mono text-sm" : ""
          } ${
            isDraggingOver
              ? "border-orange/60 bg-orange/5"
              : ""
          } text-bright placeholder:text-dim/50`}
          spellCheck={false}
        />
      ) : (
        <div
          style={{ minHeight }}
          className="report-md w-full rounded-b border border-violet/30 bg-surface px-4 py-3 text-sm leading-relaxed overflow-auto"
        >
          {previewContent ? (
            <ReactMarkdown remarkPlugins={remarkPlugins}>{previewContent}</ReactMarkdown>
          ) : (
            <p className="text-dim/50 italic">Nothing to preview yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
