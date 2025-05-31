import React from 'react';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { cn } from '../../lib/utils';

interface NumberInputProps {
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showSlider?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  showSlider = false,
  placeholder = 'Enter number',
  disabled = false,
  className,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === '' ? 0 : parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Input
        type="number"
        value={value ?? ''}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        className="font-mono"
      />
      {showSlider && min !== undefined && max !== undefined && (
        <div className="px-2">
          <Slider
            value={[value ?? min]}
            onValueChange={handleSliderChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      )}
    </div>
  );
};