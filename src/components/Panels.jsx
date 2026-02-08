import React from "react";
import { THEME } from "../theme";

// ─── Node Detail Panel ───
export function NodeDetail({
  node,
  treeNodes,
  onGrow,
  onSearch,
  onPrune,
  onRestore,
  onDeselect,
  loadingState,
}) {
  if (!node) return null;
  const isPruned = node.status === "pruned";
  const isRoot = node.nodeType === "root";
  const isLeaf = node.nodeType === "leaf";
  const isLoading = loadingState === "growing" || loadingState === "searching";
  const childCount = node.children.filter(
    (cid) => treeNodes[cid]?.status !== "pruned"
  ).length;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        right: 16,
        background: "rgba(13,20,16,0.95)",
        border: `1px solid ${THEME.nodeBorder}`,
        borderRadius: 14,
        padding: "16px 18px",
        width: 270,
        backdropFilter: "blur(12px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: THEME.textMain,
            marginBottom: 4,
            flex: 1,
            wordBreak: "break-word",
          }}
        >
          {isRoot ? "🌳" : isLeaf ? "🍃" : "🌿"} {node.label}
        </div>
        <button
          onClick={onDeselect}
          style={{
            background: "transparent",
            border: "none",
            color: THEME.textDim,
            cursor: "pointer",
            fontSize: 16,
            padding: "0 2px",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>

      {node.summary && (
        <div
          style={{
            fontSize: 11.5,
            color: THEME.textDim,
            marginBottom: 10,
            lineHeight: 1.5,
          }}
        >
          {node.summary}
        </div>
      )}

      <div
        style={{ fontSize: 10.5, color: THEME.textDim, marginBottom: 10 }}
      >
        深度 {node.depth} · 子节点 {childCount}
        {isPruned && (
          <span style={{ color: THEME.prunedText }}> · 已剪枝</span>
        )}
      </div>

      {node.sources?.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          {node.sources.map((s, i) => (
            <a
              key={i}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                fontSize: 10.5,
                color: THEME.leafGreen,
                textDecoration: "none",
                padding: "2px 0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              🔗 {s.title}
            </a>
          ))}
        </div>
      )}

      {isLoading ? (
        <div
          style={{
            textAlign: "center",
            padding: "8px 0",
            fontSize: 12,
            color: THEME.primary,
          }}
        >
          {loadingState === "growing" ? "🌱 正在生长..." : "🔍 正在搜索..."}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {!isPruned && !isLeaf && (
            <button
              onClick={onGrow}
              style={{
                flex: 1,
                padding: "7px 0",
                borderRadius: 8,
                background: THEME.btnPrimary,
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              🌿 成长
            </button>
          )}
          {!isPruned && (
            <button
              onClick={onSearch}
              style={{
                flex: 1,
                padding: "7px 0",
                borderRadius: 8,
                background: "#0e4a2e",
                color: THEME.leafGreen,
                border: `1px solid ${THEME.nodeBorder}`,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              🔍 探索
            </button>
          )}
          {!isPruned && !isRoot && (
            <button
              onClick={onPrune}
              style={{
                padding: "7px 10px",
                borderRadius: 8,
                background: "transparent",
                color: THEME.prunedText,
                border: "1px solid #5a3a3a",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              ✂️
            </button>
          )}
          {isPruned && (
            <button
              onClick={onRestore}
              style={{
                flex: 1,
                padding: "7px 0",
                borderRadius: 8,
                background: "transparent",
                color: "#d97706",
                border: "1px solid #d97706",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              🔄 恢复
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Pruned Nodes Panel ───
export function PrunedPanel({ treeNodes, onRestore }) {
  const pruned = Object.values(treeNodes).filter(
    (n) => n.status === "pruned" && n.depth > 0
  );
  const topPruned = pruned.filter((n) => {
    const parent = treeNodes[n.parentId];
    return parent && parent.status !== "pruned";
  });
  if (topPruned.length === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 16,
        left: 16,
        background: "rgba(30,20,20,0.9)",
        border: "1px solid #5a3a3a",
        borderRadius: 12,
        padding: "10px 14px",
        maxWidth: 220,
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{ fontSize: 11, color: THEME.prunedText, marginBottom: 6 }}
      >
        ✂️ 已剪枝 Pruned
      </div>
      {topPruned.map((n) => (
        <div
          key={n.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "3px 0",
            fontSize: 11.5,
            color: THEME.prunedText,
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 140,
            }}
          >
            {n.label}
          </span>
          <button
            onClick={() => onRestore(n.id)}
            style={{
              background: "transparent",
              border: "1px solid #d97706",
              color: "#d97706",
              borderRadius: 6,
              padding: "1px 7px",
              fontSize: 10,
              cursor: "pointer",
              marginLeft: 6,
            }}
          >
            恢复
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Action Log Panel ───
export function LogPanel({ actionLog }) {
  if (actionLog.length <= 1) return null;
  const iconMap = {
    init: "🌳",
    grow: "🌿",
    search: "🔍",
    prune: "✂️",
    restore: "🔄",
  };
  const labelMap = {
    init: "种下种子",
    grow: "枝干生长",
    search: "资料搜索",
    prune: "剪枝",
    restore: "恢复",
  };
  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        right: 16,
        background: "rgba(13,20,16,0.92)",
        border: `1px solid ${THEME.nodeBorder}`,
        borderRadius: 12,
        padding: "10px 14px",
        maxWidth: 200,
        maxHeight: 240,
        overflowY: "auto",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{ fontSize: 11, color: THEME.textDim, marginBottom: 6 }}
      >
        📋 操作记录
      </div>
      {[...actionLog]
        .reverse()
        .slice(0, 8)
        .map((log, i) => (
          <div
            key={i}
            style={{ fontSize: 10.5, color: THEME.textDim, padding: "2px 0" }}
          >
            {iconMap[log.type] || "•"} {labelMap[log.type] || log.type}
          </div>
        ))}
    </div>
  );
}

// ─── Export Modal ───
export function ExportModal({ markdown, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: THEME.bg,
          border: `1px solid ${THEME.nodeBorder}`,
          borderRadius: 16,
          padding: 24,
          width: "90%",
          maxWidth: 560,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 12,
            color: THEME.primary,
          }}
        >
          🍎 知识收获 | Knowledge Harvest
        </div>
        <pre
          style={{
            flex: 1,
            overflow: "auto",
            padding: 16,
            borderRadius: 10,
            background: THEME.inputBg,
            border: `1px solid ${THEME.inputBorder}`,
            color: THEME.textDim,
            fontSize: 12,
            lineHeight: 1.7,
            fontFamily: "'Fira Code', 'Consolas', monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {markdown}
        </pre>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginTop: 12,
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={() => navigator.clipboard.writeText(markdown)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: THEME.btnPrimary,
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            📋 复制
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "transparent",
              color: THEME.textDim,
              border: `1px solid ${THEME.nodeBorder}`,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
