import { useRef, useCallback } from "react";
import { Tree, type NodeApi, type TreeApi } from "react-arborist";
import {
  FileCode, FileText, FlaskConical, Plus, FolderUp,
  Pencil, Trash2, Copy, X,
} from "lucide-react";
import type { RoomFile } from "@/lib/api";

// ── colour tokens (passed in so tree matches room theme) ──────────────────────
interface ThemeTokens {
  B: string;
  SURF: string;
  EDGE: string;
  BORDER: string;
  DIM: string;
  TEXT: string;
}

// ── file-icon helper ──────────────────────────────────────────────────────────
function fileIcon(name: string) {
  if (name.endsWith(".md")) return FileText;
  if (name.endsWith(".json") || name.endsWith(".yaml") || name.endsWith(".yml")) return FileText;
  if (name.match(/test/i)) return FlaskConical;
  return FileCode;
}

// ── tree node data shape ──────────────────────────────────────────────────────
export interface FileNode {
  id: string;
  name: string;
}

// ── context menu state ────────────────────────────────────────────────────────
interface CtxMenu {
  x: number;
  y: number;
  node: NodeApi<FileNode>;
}

interface Props {
  files: RoomFile[];
  activeFileId: string | null;
  uploading: boolean;
  theme: ThemeTokens;
  onSelect: (fileId: string) => void;
  onRename: (fileId: string, newName: string) => Promise<void>;
  onDelete: (fileId: string) => void;
  onDuplicate: (fileId: string) => void;
  onNewFile: () => void;
  onUploadFolder: () => void;
  ctxMenu: CtxMenu | null;
  setCtxMenu: (m: CtxMenu | null) => void;
}

// ── node renderer ─────────────────────────────────────────────────────────────
function Node({
  node,
  style,
  dragHandle,
  activeFileId,
  theme,
  onSelect,
  setCtxMenu,
}: {
  node: NodeApi<FileNode>;
  style: React.CSSProperties;
  dragHandle?: (el: HTMLDivElement | null) => void;
  activeFileId: string | null;
  theme: ThemeTokens;
  onSelect: (id: string) => void;
  setCtxMenu: (m: CtxMenu | null) => void;
}) {
  const { B, EDGE, DIM, TEXT, BORDER } = theme;
  const isActive = node.id === activeFileId;
  const Icon = fileIcon(node.data.name);

  return (
    <div
      ref={dragHandle}
      style={{
        ...style,
        background: isActive ? `${B}12` : "transparent",
        color: isActive ? B : "hsl(213 35% 65%)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        paddingLeft: 8,
        paddingRight: 6,
        cursor: "pointer",
        userSelect: "none",
      }}
      onClick={() => { if (!node.isEditing) onSelect(node.id); }}
      onContextMenu={(e) => {
        e.preventDefault();
        setCtxMenu({ x: e.clientX, y: e.clientY, node });
      }}
    >
      <Icon
        style={{ width: 14, height: 14, flexShrink: 0, opacity: 0.65, color: isActive ? B : DIM }}
      />

      {node.isEditing ? (
        <input
          autoFocus
          defaultValue={node.data.name}
          className="flex-1 min-w-0 text-xs outline-none font-mono border-b bg-transparent"
          style={{ color: TEXT, borderColor: B }}
          onBlur={(e) => node.submit(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") node.submit((e.currentTarget as HTMLInputElement).value);
            if (e.key === "Escape") node.reset();
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span
          className="flex-1 text-xs font-mono truncate"
          style={{ color: isActive ? B : "hsl(213 35% 65%)" }}
        >
          {node.data.name}
        </span>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function FileTree({
  files,
  activeFileId,
  uploading,
  theme,
  onSelect,
  onRename,
  onDelete,
  onDuplicate,
  onNewFile,
  onUploadFolder,
  ctxMenu,
  setCtxMenu,
}: Props) {
  const { B, SURF, EDGE, BORDER, DIM, TEXT } = theme;
  const treeRef = useRef<TreeApi<FileNode> | null>(null);

  const treeData: FileNode[] = files.map((f) => ({ id: f.id, name: f.name }));

  const handleRename = useCallback(
    ({ id, name }: { id: string; name: string }) => {
      onRename(id, name);
    },
    [onRename],
  );

  const handleDelete = useCallback(
    ({ ids }: { ids: string[] }) => {
      ids.forEach(onDelete);
    },
    [onDelete],
  );

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: SURF }}
      onClick={() => setCtxMenu(null)}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 h-9 shrink-0"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <span className="text-[10px] tracking-widest uppercase font-medium" style={{ color: DIM }}>
          Explorer
        </span>
        <div className="flex items-center gap-1">
          <button
            title="Upload folder"
            onClick={(e) => { e.stopPropagation(); onUploadFolder(); }}
            className="p-0.5 transition-colors hover:text-foreground"
            style={{ color: uploading ? B : DIM }}
          >
            <FolderUp className="w-3.5 h-3.5" />
          </button>
          <button
            title="New file (Ctrl+N)"
            onClick={onNewFile}
            className="p-0.5 transition-colors hover:text-foreground"
            style={{ color: DIM }}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tree area */}
      <div className="flex-1 overflow-hidden py-1">
        {uploading && (
          <p className="px-3 py-2 text-[10px] animate-pulse" style={{ color: B }}>
            Uploading files…
          </p>
        )}
        {files.length === 0 && !uploading && (
          <p className="px-3 py-6 text-[10px] text-center" style={{ color: DIM }}>
            No files yet
          </p>
        )}
        {files.length > 0 && (
          <Tree<FileNode>
            ref={treeRef}
            data={treeData}
            width={180}
            height={9999}
            rowHeight={28}
            indent={4}
            onRename={handleRename}
            onDelete={handleDelete}
            disableDrop
          >
            {({ node, style, dragHandle }) => (
              <Node
                node={node}
                style={style}
                dragHandle={dragHandle}
                activeFileId={activeFileId}
                theme={theme}
                onSelect={onSelect}
                setCtxMenu={setCtxMenu}
              />
            )}
          </Tree>
        )}
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <div
          className="fixed z-50 py-1 shadow-xl text-xs"
          style={{
            top: ctxMenu.y,
            left: ctxMenu.x,
            minWidth: 152,
            background: SURF,
            border: `1px solid ${BORDER}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="flex items-center gap-2.5 w-full px-3 py-1.5 text-left transition-colors hover:text-foreground"
            style={{ color: DIM }}
            onClick={() => { ctxMenu.node.edit(); setCtxMenu(null); }}
          >
            <Pencil className="w-3 h-3 shrink-0" /> Rename
            <span className="ml-auto text-[10px] opacity-40">F2</span>
          </button>
          <button
            className="flex items-center gap-2.5 w-full px-3 py-1.5 text-left transition-colors hover:text-foreground"
            style={{ color: DIM }}
            onClick={() => { onDuplicate(ctxMenu.node.id); setCtxMenu(null); }}
          >
            <Copy className="w-3 h-3 shrink-0" /> Duplicate
          </button>
          <div style={{ height: 1, background: BORDER, margin: "2px 0" }} />
          <button
            className="flex items-center gap-2.5 w-full px-3 py-1.5 text-left transition-colors hover:opacity-90"
            style={{ color: "hsl(0 72% 60%)" }}
            onClick={() => { onDelete(ctxMenu.node.id); setCtxMenu(null); }}
          >
            <Trash2 className="w-3 h-3 shrink-0" /> Delete
            <span className="ml-auto text-[10px] opacity-40">Del</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Export CtxMenu type for room.tsx
export type { CtxMenu };
