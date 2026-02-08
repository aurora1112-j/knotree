import React, { useRef, useState, useCallback } from "react";
import { THEME } from "../theme";

// ─── Branch Line ───
function BranchLine({ x1, y1, x2, y2, depth, isPruned }) {
  const color = isPruned
    ? THEME.prunedText
    : depth === 0
    ? THEME.trunk
    : depth === 1
    ? THEME.branch
    : THEME.branchThin;
  const sw = Math.max(1, 8 - depth * 1.2);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const curve = Math.min(90, Math.abs(dx) * 0.45 + 20);
  const c1x = x1 + Math.sign(dx || 1) * curve;
  const c1y = y1 + dy * 0.35;
  const c2x = x2 - Math.sign(dx || 1) * curve;
  const c2y = y2 - dy * 0.35;
  return (
    <path
      d={`M${x1},${y1} C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`}
      stroke={color}
      strokeWidth={sw}
      fill="none"
      strokeLinecap="round"
      opacity={isPruned ? 0.25 : 0.9}
      style={{
        filter: isPruned
          ? "none"
          : "drop-shadow(0 1px 2px rgba(74,93,35,0.15))",
      }}
    />
  );
}

const splitLines = (text, maxChars, maxLines) => {
  if (!text) return [];
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
};

// ─── Tree Node ───
function TreeNodeSVG({
  node,
  x,
  y,
  isSelected,
  onSelect,
  isLoading,
  isHovered,
  onHover,
}) {
  const isPruned = node.status === "pruned";
  const isRoot = node.nodeType === "root";
  const isLeaf = node.nodeType === "leaf";
  const hasLink = Boolean(node.sources?.[0]?.url);

  const nodeW = isRoot ? 150 : isLeaf ? 140 : 140;
  const nodeH = isRoot ? 52 : isLeaf ? 44 : 34;
  const textColor = isPruned ? THEME.prunedText : THEME.textMain;
  const scale = isHovered && isLeaf ? 1.06 : 1;
  const icon = isRoot ? "🌰" : isLeaf ? "🍃" : "";
  const label =
    node.label.length > 12 ? `${node.label.slice(0, 11)}…` : node.label;

  return (
    <g
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: "pointer" }}
      transform={`translate(${x} ${y}) scale(${scale}) translate(${-x} ${-y})`}
    >
      {isSelected && !isPruned && (
        <>
          {isRoot ? (
            <circle
              cx={x}
              cy={y}
              r={30}
              fill="none"
              stroke={THEME.selectedBorder}
              strokeWidth={2}
              opacity={0.55}
            />
          ) : (
            <rect
              x={x - nodeW / 2 - 6}
              y={y - nodeH / 2 - 6}
              width={nodeW + 12}
              height={nodeH + 12}
              rx={16}
              fill="none"
              stroke={THEME.selectedBorder}
              strokeWidth={1.6}
              opacity={0.5}
            />
          )}
        </>
      )}
      {isRoot && (
        <>
          <circle
            cx={x}
            cy={y}
            r={26}
            fill={THEME.nodeBg}
            stroke={THEME.trunk}
            strokeWidth={2.5}
          />
          <circle
            cx={x}
            cy={y}
            r={14}
            fill="none"
            stroke={THEME.branchThin}
            strokeWidth={1}
          />
        </>
      )}

      {!isRoot && !isLeaf && (
        <>
          <rect
            x={x - nodeW / 2}
            y={y - nodeH / 2}
            width={nodeW}
            height={nodeH}
            rx={10}
            fill={THEME.nodeBg}
            opacity={isPruned ? 0.55 : 0.92}
            stroke="none"
          />
          <line
            x1={x - nodeW / 2 + 12}
            y1={y + nodeH / 2 - 6}
            x2={x + nodeW / 2 - 12}
            y2={y + nodeH / 2 - 6}
            stroke={THEME.branchThin}
            strokeWidth={1}
          />
        </>
      )}

      {isLeaf && (
        <>
          <path
            d={`M ${x} ${y - nodeH / 2}
              C ${x + nodeW / 2} ${y - nodeH / 2 + 4} ${x + nodeW / 2} ${
              y + nodeH / 2 - 4
            } ${x} ${y + nodeH / 2}
              C ${x - nodeW / 2} ${y + nodeH / 2 - 4} ${
              x - nodeW / 2
            } ${y - nodeH / 2 + 4} ${x} ${y - nodeH / 2} Z`}
            fill={THEME.nodeHover}
            stroke={THEME.leafGreen}
            strokeWidth={1.2}
            opacity={isPruned ? 0.5 : 0.95}
          />
          <path
            d={`M ${x} ${y - nodeH / 2 + 6} L ${x} ${y + nodeH / 2 - 6}`}
            stroke="rgba(74,93,35,0.35)"
            strokeWidth={1}
          />
          <path
            d={`M ${x - 12} ${y - 4} L ${x} ${y} L ${x + 12} ${y - 4}`}
            stroke="rgba(74,93,35,0.2)"
            strokeWidth={0.8}
          />
        </>
      )}
      {isLoading && (
        <circle
          cx={x}
          cy={y}
          r={isRoot ? 30 : 22}
          fill="none"
          stroke={THEME.accent}
          strokeWidth={2}
          strokeDasharray="6 4"
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
        </circle>
      )}
      <text
        x={x}
        y={isRoot ? y + 1 : y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill={textColor}
        fontSize={isRoot ? 13 : 11.5}
        fontFamily="'Noto Serif SC', 'Playfair Display', serif"
        fontWeight={isRoot ? 600 : 500}
      >
        {icon ? `${icon} ` : ""}
        {label}
      </text>
      {isLeaf && hasLink && (
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
      {isLeaf && isHovered && node.summary && (
        <g>
          <rect
            x={x - 90}
            y={y - nodeH / 2 - 52}
            width={180}
            height={44}
            rx={10}
            fill={THEME.bg}
            stroke={THEME.nodeBorder}
            strokeWidth={1}
            opacity={0.96}
          />
          {splitLines(node.summary, 20, 2).map((line, index) => (
            <text
              key={index}
              x={x - 80}
              y={y - nodeH / 2 - 36 + index * 14}
              fontSize={10.5}
              fill={THEME.textDim}
            >
              {line}
            </text>
          ))}
        </g>
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
  const [hoveredId, setHoveredId] = useState(null);

  // Auto-expand viewBox
  React.useEffect(() => {
    if (!rootId) return;
    const visible = Object.values(treeNodes).filter(
      (n) => n.status !== "pruned"
    );
    const maxDepth = Math.max(0, ...visible.map((n) => n.depth));
    const neededH = maxDepth * 150 + 150;
    const neededW = Math.max(1100, visible.length * 110);
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

        {/* Paper texture */}
        <defs>
          <filter id="paperNoise" x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.04" />
            </feComponentTransfer>
          </filter>
          <pattern
            id="dots"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="0.6" fill="rgba(44,62,80,0.08)" />
          </pattern>
        </defs>
        <rect
          x={viewBox.x - 2000}
          y={viewBox.y - 2000}
          width={viewBox.w + 4000}
          height={viewBox.h + 4000}
          filter="url(#paperNoise)"
          opacity={0.35}
        />
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
              isHovered={hoveredId === node.id}
              onHover={setHoveredId}
            />
          );
        })}
      </svg>
    </div>
  );
}
