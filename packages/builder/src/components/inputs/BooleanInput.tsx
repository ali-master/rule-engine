import React from "react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { cn } from "../../lib/utils";

interface BooleanInputProps {
  value?: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const BooleanInput: React.FC<BooleanInputProps> = ({
  value = false,
  onChange,
  label,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Switch checked={value} onCheckedChange={onChange} disabled={disabled} />
      {label && <Label className="text-sm font-normal">{label}</Label>}
    </div>
  );
};
