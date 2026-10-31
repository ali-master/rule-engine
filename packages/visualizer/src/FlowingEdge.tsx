import { memo } from "react";
import { getSmoothStepPath, BaseEdge } from "@xyflow/react";
import type { EdgeProps } from "@xyflow/react";

export const FlowingEdge = memo((props: EdgeProps) => {
  const { sourceX: sx, sourceY: sy, targetX: tx, targetY: ty, data } = props;
  const lane = data?.laneX;
  const duration = Math.max(4, (Math.abs(tx - sx) + Math.abs(ty - sy)) / 120);
  const phase =
    Array.from(props.id).reduce(
      (hash, char) => (hash * 31 + char.charCodeAt(0)) % 997,
      0,
    ) / 997;
  const [path, labelX, labelY] =
    typeof lane === "number"
      ? [
          `M ${sx} ${sy} L ${sx} ${sy + 12} Q ${sx} ${sy + 20} ${sx - 8} ${sy + 20} L ${lane + 8} ${sy + 20} Q ${lane} ${sy + 20} ${lane} ${sy + 28} L ${lane} ${ty - 28} Q ${lane} ${ty - 20} ${lane + 8} ${ty - 20} L ${tx - 8} ${ty - 20} Q ${tx} ${ty - 20} ${tx} ${ty - 12} L ${tx} ${ty}`,
          (lane + tx) / 2,
          ty - 20,
        ]
      : getSmoothStepPath({ ...props, borderRadius: 12 });
  return (
    <>
      <BaseEdge {...props} path={path} labelX={labelX} labelY={labelY} />
      <circle
        className={`rv-edge-pulse ${data?.pulse === false ? "rv-path-hint" : ""}`}
        r="3"
        aria-hidden="true"
      >
        <animateMotion
          dur={`${duration}s`}
          begin={`${-phase * duration}s`}
          repeatCount="indefinite"
          path={path}
        />
      </circle>
    </>
  );
});
