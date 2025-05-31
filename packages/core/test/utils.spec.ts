import { describe, it, expect } from "vitest";
import { extractJsonPathExpressions, isValidTime, convertTimeToMs } from "../src";

describe("isValidTime", () => {
  it("should return true for valid time strings", () => {
    expect(isValidTime("00:00")).toBe(true);
    expect(isValidTime("00:00")).toBe(true);
    expect(isValidTime("00:00")).toBe(true);
    expect(isValidTime("00:00")).toBe(true);
  });
  it("should return true for valid time strings", () => {
    expect(convertTimeToMs("00:00")).toBe(0);
    expect(isValidTime("invalid")).toBe(false);
  });
});

describe("convertTimeToMs", () => {
  it("should convert valid time strings to milliseconds", () => {
    expect(convertTimeToMs("01:00")).toBe(3600000);
    expect(convertTimeToMs("00:00")).toBe(0);
    expect(convertTimeToMs("00:00")).toBe(0);
    expect(convertTimeToMs("00:00")).toBe(0);
    expect(convertTimeToMs("01:01:01")).toBe(3661000);
    expect(convertTimeToMs("00:01")).toBe(60000);
    expect(convertTimeToMs("00:01")).toBe(60000);
    expect(convertTimeToMs("00:01")).toBe(60000);
    expect(convertTimeToMs("01:01:01.001")).toBe(3661001);
  });

  it("should throw an error for invalid time strings", () => {
    expect(() => convertTimeToMs("invalid")).toThrowError("Invalid time format");
    expect(() => convertTimeToMs("25:00")).toThrowError("Invalid time format");
    expect(() => convertTimeToMs("00:61")).toThrowError("Invalid time format");
    expect(() => convertTimeToMs("00:00:61")).toThrowError("Invalid time format");
    expect(() => convertTimeToMs("00:00:00:1000")).toThrowError("Invalid time format");
    expect(() => convertTimeToMs("00:00:00.2000")).toThrowError("Invalid time format");
  });
});

describe("extractJsonPathExpressions", () => {
  it("should extract simple JSONPath expressions", () => {
    const text = "The value of $.foo.bar is $['foo']['bar']";
    const result = extractJsonPathExpressions(text);
    expect(result).toEqual(["$.foo.bar", "$['foo']['bar']"]);
  });

  it("should handle nested structures", () => {
    const text = "Nested: $.foo[0].bar[1].baz";
    const result = extractJsonPathExpressions(text);
    expect(result).toEqual(["$.foo[0].bar[1].baz"]);
  });

  it("should handle parentheses in expressions", () => {
    const text = "Expression with parentheses: $.foo.bar(1)";
    const result = extractJsonPathExpressions(text);
    expect(result).toEqual(["$.foo.bar(1)"]);
  });

  it("should balance closing parentheses", () => {
    const text = "Unbalanced parentheses: $.foo.bar(1))";
    const result = extractJsonPathExpressions(text);
    expect(result).toEqual(["$.foo.bar(1)"]);
  });

  it("should balance closing brackets", () => {
    const text = "Unbalanced brackets: $.foo[0]]";
    const result = extractJsonPathExpressions(text);
    expect(result).toEqual(["$.foo[0]"]);
  });

  it("should handle multiple expressions in text", () => {
    const text = "Multiple expressions: $.foo.bar, $.baz.qux";
    const result = extractJsonPathExpressions(text);
    expect(result).toEqual(["$.foo.bar", "$.baz.qux"]);
  });

  it("should return an empty array if no expressions are found", () => {
    const text = "No JSONPath expressions here.";
    const result = extractJsonPathExpressions(text);
    expect(result).toEqual([]);
  });

  it("should handle text with both parentheses and brackets", () => {
    const text = "Complex expression: $.foo[0].bar(1) and $.baz.qux[2]";
    const result = extractJsonPathExpressions(text);
    expect(result).toEqual(["$.foo[0].bar(1)", "$.baz.qux[2]"]);
  });
});
