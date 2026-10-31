import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { vi, it, expect, describe } from "vitest";
import { Operators } from "@usex/rule-engine";
import { TreeConstraintEditor } from "../src/components/TreeConstraintEditor";
import { ArrayInput } from "../src/components/inputs/ArrayInput";

const selector = vi.hoisted(() => ({ onChange: (_operator: string) => {} }));
vi.mock("../src/components/SmartOperatorSelector", () => ({
  SmartOperatorSelector: (props: typeof selector) => {
    selector.onChange = props.onChange;
    return null;
  },
}));

describe("array operator transitions", () => {
  it.each([Operators.In, Operators.NotIn])(
    "normalizes values for %s",
    (operator) => {
      for (const [value, expected] of [
        ["Alice", ["Alice"]],
        [0, [0]],
        [false, [false]],
        ["", []],
        [undefined, []],
        [null, []],
        [
          ["Alice", "Bob"],
          ["Alice", "Bob"],
        ],
      ]) {
        const onUpdate = vi.fn();
        const props = {
          constraint: { field: "name", operator: Operators.Equals, value },
          onUpdate,
          onRemove: vi.fn(),
          onDuplicate: vi.fn(),
        };
        renderToStaticMarkup(<TreeConstraintEditor {...props} />);
        selector.onChange(operator);
        const updated = onUpdate.mock.calls[0][0];
        expect(updated).toEqual({
          ...props.constraint,
          operator,
          value: expected,
        });
        expect(() =>
          renderToStaticMarkup(
            <TreeConstraintEditor {...props} constraint={updated} />,
          ),
        ).not.toThrow();
      }
    },
  );

  it.each(["Alice", null, undefined, 42, false])(
    "tolerates a stale input value %s",
    (value) => {
      expect(() =>
        renderToStaticMarkup(
          <ArrayInput value={value as any} onChange={vi.fn()} />,
        ),
      ).not.toThrow();
    },
  );

  it("renders valid array items", () => {
    const html = renderToStaticMarkup(
      <ArrayInput value={["Alice", 0, false]} onChange={vi.fn()} />,
    );
    expect(html).toContain("Alice");
    expect(html).toContain(">0<");
    expect(html).toContain(">false<");
  });
});
