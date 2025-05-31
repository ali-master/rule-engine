import React from 'react';
import { RuleBuilderProvider } from '../context/RuleBuilderContext';
import { RuleEditor } from './RuleEditor';
import { RuleViewer } from './RuleViewer';
import type { RuleBuilderProps } from '../types';
import { cn } from '../lib/utils';

export const RuleBuilder: React.FC<RuleBuilderProps> = ({
  className,
  showImportExport = true,
  showViewer = true,
  viewerPosition = 'right',
  theme,
  fields,
  operators,
  customValueInputs,
  onRuleChange,
  readOnly = false,
}) => {
  const [rule, setRule] = React.useState({
    conditions: [],
  });

  const handleRuleChange = React.useCallback((newRule: any) => {
    setRule(newRule);
    if (onRuleChange) {
      onRuleChange(newRule);
    }
  }, [onRuleChange]);

  return (
    <RuleBuilderProvider
      initialRule={rule}
      onChange={handleRuleChange}
    >
      <div
        className={cn(
          'flex gap-4',
          viewerPosition === 'bottom' ? 'flex-col' : 'flex-row',
          className
        )}
        style={theme ? {
          '--primary': theme.colors?.primary,
          '--secondary': theme.colors?.secondary,
          '--destructive': theme.colors?.destructive,
          '--muted': theme.colors?.muted,
          '--accent': theme.colors?.accent,
          '--background': theme.colors?.background,
          '--foreground': theme.colors?.foreground,
          '--card': theme.colors?.card,
          '--border': theme.colors?.border,
          fontFamily: theme.fontFamily,
        } as React.CSSProperties : undefined}
      >
        <div className={cn(
          'flex-1',
          viewerPosition === 'right' && 'min-w-0'
        )}>
          <RuleEditor readOnly={readOnly} />
        </div>
        
        {showViewer && (
          <div className={cn(
            viewerPosition === 'right' ? 'w-1/3 min-w-[400px]' : 'w-full'
          )}>
            <RuleViewer
              rule={rule}
              syntaxHighlight
              collapsible
              defaultCollapsed={false}
            />
          </div>
        )}
      </div>
    </RuleBuilderProvider>
  );
};