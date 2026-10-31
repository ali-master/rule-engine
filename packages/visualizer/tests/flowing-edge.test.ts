import { it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Position } from "@xyflow/react";
import { FlowingEdge } from "../src/FlowingEdge";

it.each([undefined, 56])(
  "animates along the actual connector path (lane %s)",
  (laneX) => {
    const markup = renderToStaticMarkup(
      createElement(FlowingEdge, {
        id: "parent-child",
        source: "parent",
        target: "child",
        sourceX: 140,
        sourceY: 100,
        targetX: 224,
        targetY: 300,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        data: { laneX },
      }),
    );
    const path = markup.match(/ d="([^"]+)"/)?.[1];
    const motionPath = markup.match(/<animateMotion[^>]+path="([^"]+)"/)?.[1];
    expect(path).toBeTruthy();
    expect(motionPath).toBe(path);
    expect(markup).toContain('repeatCount="indefinite"');
    expect(markup).toMatch(/begin="-\d+(\.\d+)?s"/);
    expect(markup).not.toMatch(/NaN|Infinity/);
  },
);
