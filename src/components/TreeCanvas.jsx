import React, { useRef, useState, useCallback } from "react";
import { THEME } from "../theme";

// ─── Branch Line ───
function BranchLine({ x1, y1, x2, y2, depth, isPruned }) {
  const color = isPruned
    ? "#3a2a2a"
    : depth === 0
    ? THEME.trunk
    : depth === 1
    ? THEME.branch
    : THEME.branchThin;
  const sw = Math.max(1.5, 5 - depth * 0.8);
  const midY = (y1 + y2) / 2;
  return (
    <path
      d={`M${x1},${y1} C${x1},${midY} ${x2},${midY} ${x2},${y2}`}
      stroke={color}
      strokeWidth={sw}
      fill="none"
      strokeLinecap="round"
      opacity={isPruned ? 0.3 : 0.85}
      style={{
        filter: isPruned
          ? "none"
          : "drop-shadow(0 0 2px rgba(74,222,128,0.15))",
      }}
    />
  );
}

// ─── Tree Node ───
function TreeNodeSVG({ node, x, y, isSelected, onSelect, isLoading }) {
  const isPruned = node.status === "pruned";
  const isRoot = node.nodeType === "root";
  const isLeaf = node.nodeType === "leaf";

  const nodeW = isRoot ? 140 : isLeaf ? 120 : 120;
  const nodeH = isRoot ? 44 : isLeaf ? 36 : 38;

  const bgColor = isPruned
    ? "rgba(74,44,44,0.6)"
    : isSelected
    ? "rgba(36,61,47,0.95)"
    : "rgba(26,46,35,0.9)";
  const borderColor = isPruned
    ? "#5a3a3a"
    : isSelected
    ? THEME.selectedBorder
    : THEME.nodeBorder;
  const textColor = isPruned ? THEME.prunedText : THEME.textMain;

  const icon = isRoot
    ? "🌳"
    : isLeaf
    ? "🍃"
    : node.status === "growing"
    ? "🌿"
    : "🌱";

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      style={{ cursor: "pointer" }}
    >
      {isSelected && !isPruned && (
        <rect
          x={x - nodeW / 2 - 3}
          y={y - nodeH / 2 - 3}
          width={nodeW + 6}
          height={nodeH + 6}
          rx={14}
          fill="none"
          stroke={THEME.selectedBorder}
          strokeWidth={2}
          opacity={0.5}
        >
          <animate
            attributeName="opacity"
            values="0.3;0.7;0.3"
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>
      )}
      <rect
        x={x - nodeW / 2}
        y={y - nodeH / 2}
        width={nodeW}
        height={nodeH}
        rx={11}
        fill={bgColor}
        stroke={borderColor}
        strokeWidth={1.5}
      />
      {isLoading && (
        <rect
          x={x - nodeW / 2}
          y={y - nodeH / 2}
          width={nodeW}
          height={nodeH}
          rx={11}
          fill="none"
          stroke={THEME.primary}
          strokeWidth={2}
          strokeDasharray="8 4"
          opacity={0.7}
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 ${x} ${y}`}
            to={`360 ${x} ${y}`}
            dur="3s"
            repeatCount="indefinite"
          />
        </rect>
      )}
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        fontSize={isRoot ? 13 : 11.5}
        fontFamily="'Noto Sans SC', 'Segoe UI', sans-serif"
        fontWeight={isRoot ? 600 : 400}
      >
        {icon}{" "}
        {node.label.length > 10 ? node.label.slice(0, 9) + "…" : node.label}
      </text>
      {isLeaf && node.sources?.[0]?.url && (
        <text
          x={x + nodeW / 2 - 10}
          y={y - nodeH / 2 + 10}
          textAnchor="middle"
          fontSize={10}
          fill={THEME.flower}
        >
          🔗
        </text>
      )}
    </g>
  );
}

// ─── Tree Canvas ───
export default function TreeCanvas({
  treeNodes,
  rootId,
  positions,
  selectedNodeId,
  loadingNodeId,
  onSelectNode,
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 900, h: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Auto-expand viewBox
  React.useEffect(() => {
    if (!rootId) return;
    const visible = Object.values(treeNodes).filter(
      (n) => n.status !== "pruned"
    );
    const maxDepth = Math.max(0, ...visible.map((n) => n.depth));
    const neededH = maxDepth * 105 + 160;
    const neededW = Math.max(900, visible.length * 75);
    setViewBox((v) => ({
      ...v,
      w: Math.max(v.w, neededW),
      h: Math.max(v.h, neededH),
    }));
  }, [treeNodes, rootId]);

  const handleMouseDown = useCallback((e) => {
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isPanning) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const dx =
        (e.clientX - panStart.x) * (viewBox.w / rect.width);
      const dy =
        (e.clientY - panStart.y) * (viewBox.h / rect.height);
      setViewBox((v) => ({ ...v, x: v.x - dx, y: v.y - dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    },
    [isPanning, panStart, viewBox]
  );

  const handleMouseUp = useCallback(() => setIsPanning(false), []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const scale = e.deltaY > 0 ? 1.08 : 0.92;
    setViewBox((v) => {
      const nw = v.w * scale;
      const nh = v.h * scale;
      return {
        x: v.x + (v.w - nw) / 2,
        y: v.y + (v.h - nh) / 2,
        w: nw,
        h: nh,
      };
    });
  }, []);

  // Build edges
  const edges = [];
  Object.values(treeNodes).forEach((node) => {
    node.children.forEach((cid) => {
      const child = treeNodes[cid];
      if (child && positions[node.id] && positions[cid]) {
        edges.push({
          key: `${node.id}-${cid}`,
          x1: positions[node.id].x,
          y1: positions[node.id].y,
          x2: positions[cid].x,
          y2: positions[cid].y,
          depth: node.depth,
          isPruned: child.status === "pruned",
        });
      }
    });
  });

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
      >
        {/* Background */}
        <rect
          data-bg="true"
          x={viewBox.x - 2000}
          y={viewBox.y - 2000}
          width={viewBox.w + 4000}
          height={viewBox.h + 4000}
          fill={THEME.canvasBg}
        />

        {/* Grid dots */}
        <defs>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="0.8" fill="rgba(74,222,128,0.08)" />
          </pattern>
        </defs>
        <rect
          x={viewBox.x - 2000}
          y={viewBox.y - 2000}
          width={viewBox.w + 4000}
          height={viewBox.h + 4000}
          fill="url(#dots)"
        />

        {/* Edges */}
        {edges.map((e) => (
          <BranchLine key={e.key} {...e} />
        ))}

        {/* Nodes */}
        {Object.values(treeNodes).map((node) => {
          const pos = positions[node.id];
          if (!pos) return null;
          return (
            <TreeNodeSVG
              key={node.id}
              node={node}
              x={pos.x}
              y={pos.y}
              isSelected={selectedNodeId === node.id}
              onSelect={onSelectNode}
              isLoading={loadingNodeId === node.id}
            />
          );
        })}
      </svg>
    </div>
  );
}
