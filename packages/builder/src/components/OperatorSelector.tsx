import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import type { OperatorSelectorProps } from '../types';
import { getOperatorConfig, getOperatorsForFieldType, operatorConfigs } from '../utils/operators';
import { cn } from '../lib/utils';

export const OperatorSelector: React.FC<OperatorSelectorProps & { customOperators?: Record<string, any>; fieldType?: string }> = ({
  value,
  onChange,
  operators = operatorConfigs,
  field,
  fieldType,
  disabled = false,
  className,
  customOperators,
}) => {

  const availableOperators = React.useMemo(() => {
    const fieldOperators = getOperatorsForFieldType(fieldType);
    const baseOperators = operators.filter(op => fieldOperators.some(fo => fo.name === op.name));
    
    // Add custom operators if provided
    if (customOperators) {
      const customOps = Object.entries(customOperators).map(([name, config]) => ({
        name,
        label: config.label || name,
        category: config.category || 'Custom',
        ...config
      }));
      return [...baseOperators, ...customOps];
    }
    
    return baseOperators;
  }, [operators, fieldType, customOperators]);

  const groupedOperators = React.useMemo(() => {
    const groups: Record<string, typeof availableOperators> = {};
    
    availableOperators.forEach(operator => {
      const category = operator.category || 'Other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(operator);
    });

    return groups;
  }, [availableOperators]);

  const selectedOperator = getOperatorConfig(value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={cn('min-w-[200px]', className)}>
        <SelectValue placeholder="Select operator">
          {selectedOperator?.label || value}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(groupedOperators).map(([category, ops]) => (
          <SelectGroup key={category}>
            <SelectLabel>{category}</SelectLabel>
            {ops.map((operator) => (
              <SelectItem key={operator.name} value={operator.name}>
                <div className="flex flex-col">
                  <span>{operator.label || operator.name}</span>
                  {operator.description && (
                    <span className="text-xs text-muted-foreground">
                      {operator.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
};