import React from 'react';
import NumberFlow, { useCanAnimate } from '@number-flow/react';

interface AnimatedNumberProps {
  value: number;
  format?: Intl.NumberFormatOptions;
  className?: string;
  animated?: boolean;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ 
  value, 
  format = {},
  className,
  animated = true 
}) => {
  const canAnimate = useCanAnimate();

  if (!canAnimate || !animated) {
    return (
      <span className={className}>
        {new Intl.NumberFormat(undefined, format).format(value)}
      </span>
    );
  }

  // Filter out unsupported notation types for NumberFlow
  const numberFlowFormat = {
    ...format,
    notation: format.notation === 'scientific' || format.notation === 'engineering' 
      ? 'standard' 
      : format.notation
  };

  return (
    <NumberFlow
      value={value}
      format={numberFlowFormat}
      animated
      className={className}
    />
  );
};

AnimatedNumber.displayName = 'AnimatedNumber';