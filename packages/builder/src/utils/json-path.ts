/**
 * Utilities for working with JSON Path expressions
 */

interface PathSegment {
  type: "property" | "index" | "wildcard" | "recursive" | "filter";
  value: string | number | null;
  raw: string;
}

/**
 * Parse a JSON Path expression into segments
 */
export function parseJsonPath(path: string): PathSegment[] {
  const segments: PathSegment[] = [];

  if (!path.startsWith("$")) {
    throw new Error("JSON Path must start with $");
  }

  // Remove the root $ and split by . Or [
  const cleanPath = path.slice(1);
  const parts = cleanPath.split(/(?=\.)|(?=\[)/);

  for (const part of parts) {
    if (!part) {
      continue;
    }

    if (part.startsWith("..")) {
      // Recursive descent
      segments.push({
        type: "recursive",
        value: part.slice(2),
        raw: part,
      });
    } else if (part.startsWith(".")) {
      // Property access
      segments.push({
        type: "property",
        value: part.slice(1),
        raw: part,
      });
    } else if (part.startsWith("[")) {
      const content = part.slice(1, -1);

      if (content === "*") {
        // Wildcard
        segments.push({
          type: "wildcard",
          value: null,
          raw: part,
        });
      } else if (content.startsWith("?")) {
        // Filter expression
        segments.push({
          type: "filter",
          value: content,
          raw: part,
        });
      } else {
        // Array index
        segments.push({
          type: "index",
          value: Number.parseInt(content, 10),
          raw: part,
        });
      }
    }
  }

  return segments;
}

/**
 * Build a JSON Path from segments
 */
export function buildJsonPath(segments: PathSegment[]): string {
  let path = "$";

  for (const segment of segments) {
    switch (segment.type) {
      case "property":
        path += `.${segment.value}`;
        break;
      case "index":
        path += `[${segment.value}]`;
        break;
      case "wildcard":
        path += "[*]";
        break;
      case "recursive":
        path += `..${segment.value}`;
        break;
      case "filter":
        path += `[${segment.value}]`;
        break;
    }
  }

  return path;
}

/**
 * Get value from object using JSON Path
 */
export function getValueByPath(obj: any, path: string): any {
  try {
    const segments = parseJsonPath(path);
    let current = obj;

    for (const segment of segments) {
      if (current === null || current === undefined) {
        return undefined;
      }

      switch (segment.type) {
        case "property":
          current = current[segment.value as string];
          break;

        case "index":
          if (Array.isArray(current)) {
            current = current[segment.value as number];
          } else {
            return undefined;
          }
          break;

        case "wildcard":
          if (Array.isArray(current)) {
            return current;
          }
          return undefined;

        case "recursive": {
          // Simple recursive search - returns first match
          const searchKey = segment.value as string;
          current = findRecursive(current, searchKey);
          break;
        }

        case "filter":
          // Basic filter support
          if (Array.isArray(current)) {
            // Very basic filter implementation
            // In production, you'd want a proper filter expression parser
            return current;
          }
          return undefined;
      }
    }

    return current;
  } catch {
    return undefined;
  }
}

/**
 * Recursively search for a key in an object
 */
function findRecursive(obj: any, key: string): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (typeof obj === "object") {
    if (key in obj) {
      return obj[key];
    }

    for (const k in obj) {
      const result = findRecursive(obj[k], key);
      if (result !== undefined) {
        return result;
      }
    }
  }

  return undefined;
}

/**
 * Validate if a JSON Path is syntactically correct
 */
export function validateJsonPath(path: string): {
  valid: boolean;
  error?: string;
} {
  if (!path) {
    return { valid: false, error: "Path is required" };
  }

  if (!path.startsWith("$")) {
    return { valid: false, error: "Path must start with $" };
  }

  try {
    parseJsonPath(path);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: (error as Error).message };
  }
}

/**
 * Get all possible paths from an object
 */
export function getAllPaths(obj: any, maxDepth: number = 10): string[] {
  const paths: string[] = [];

  function traverse(current: any, path: string, depth: number) {
    if (depth > maxDepth) {
      return;
    }

    if (current === null || current === undefined) {
      return;
    }

    if (typeof current === "object") {
      if (Array.isArray(current)) {
        paths.push(`${path}[*]`);

        // Sample first few items
        current.slice(0, 3).forEach((item, index) => {
          const itemPath = `${path}[${index}]`;
          paths.push(itemPath);
          traverse(item, itemPath, depth + 1);
        });
      } else {
        for (const key in current) {
          const newPath = `${path}.${key}`;
          paths.push(newPath);
          traverse(current[key], newPath, depth + 1);
        }
      }
    }
  }

  traverse(obj, "$", 0);
  return paths;
}

/**
 * Convert simple field name to JSON Path
 */
export function fieldToJsonPath(field: string): string {
  if (field.startsWith("$")) {
    return field;
  }

  return `$.${field}`;
}

/**
 * Extract field name from JSON Path
 */
export function jsonPathToField(path: string): string {
  if (!path.startsWith("$")) {
    return path;
  }

  // Simple paths like $.field
  if (path.match(/^\$\.\w+$/)) {
    return path.slice(2);
  }

  // Return full path for complex expressions
  return path;
}

/**
 * Build a JSON Path from parts
 */
export function buildPath(...parts: (string | number)[]): string {
  let path = "$";

  for (const part of parts) {
    if (typeof part === "number") {
      path += `[${part}]`;
    } else if (part === "*") {
      path += "[*]";
    } else if (part.startsWith("[") && part.endsWith("]")) {
      path += part;
    } else {
      path += `.${part}`;
    }
  }

  return path;
}
