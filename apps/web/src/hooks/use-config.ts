import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export type PackageManager = "pnpm" | "yarn" | "npm" | "bun";
export type InstallationType = "shadcn/ui" | "primitives";

type Config = {
  packageManager: PackageManager;
  installationType: InstallationType;
};

const configAtom = atomWithStorage<Config>("config", {
  packageManager: "pnpm",
  installationType: "shadcn/ui",
});

export function useConfig() {
  return useAtom(configAtom);
}
