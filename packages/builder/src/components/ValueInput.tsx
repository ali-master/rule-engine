import React from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, X } from 'lucide-react';
import type { ValueInputProps } from '../types';
import { getOperatorConfig } from '../utils/operators';
import { cn } from '../lib/utils';

export const ValueInput: React.FC<ValueInputProps> = ({
  value,
  onChange,
  operator,
  field,
  disabled = false,
  className,
  placeholder = 'Enter value',
}) => {
  const operatorConfig = getOperatorConfig(operator);
  const valueType = operatorConfig?.valueType || 'single';

  if (valueType === 'none') {
    return null;
  }

  if (valueType === 'multiple') {
    const arrayValue = Array.isArray(value) ? value : value ? [value] : [];
    
    return (
      <div className={cn('space-y-2', className)}>
        {arrayValue.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => {
                const newValue = [...arrayValue];
                newValue[index] = e.target.value;
                onChange(newValue);
              }}
              placeholder={placeholder}
              disabled={disabled}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                const newValue = arrayValue.filter((_, i) => i !== index);
                onChange(newValue.length > 0 ? newValue : undefined);
              }}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            onChange([...arrayValue, '']);
          }}
          disabled={disabled}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Value
        </Button>
      </div>
    );
  }

  if (valueType === 'range') {
    const rangeValue = Array.isArray(value) ? value : [value || '', ''];
    
    return (
      <div className={cn('flex gap-2 items-center', className)}>
        <Input
          value={rangeValue[0] || ''}
          onChange={(e) => {
            onChange([e.target.value, rangeValue[1] || '']);
          }}
          placeholder="From"
          disabled={disabled}
        />
        <span className="text-muted-foreground">to</span>
        <Input
          value={rangeValue[1] || ''}
          onChange={(e) => {
            onChange([rangeValue[0] || '', e.target.value]);
          }}
          placeholder="To"
          disabled={disabled}
        />
      </div>
    );
  }

  // Check if the value is a field reference (JSONPath)
  const isFieldReference = typeof value === 'string' && value.startsWith('$.');
  
  return (
    <div className={cn('relative', className)}>
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          isFieldReference && 'font-mono text-xs pr-20'
        )}
      />
      {isFieldReference && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          Field Ref
        </span>
      )}
    </div>
  );
};