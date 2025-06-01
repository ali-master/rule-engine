# RuleEvaluator Component

The `RuleEvaluator` component provides a comprehensive interface for testing and evaluating rules in real-time against sample data. It features both live evaluation mode and manual evaluation, with detailed result visualization.

## Features

### Core Features
- **Live Rule Evaluation**: Automatically evaluates rules as they change
- **Manual Evaluation**: Evaluate rules on-demand with a single click
- **Pass/Fail Indicators**: Clear visual feedback with red/green indicators
- **Silent Mode**: Minimal UI showing just the pass/fail status
- **Detailed Mode**: Comprehensive view showing which conditions passed or failed
- **Smooth Animations**: Beautiful transitions powered by Framer Motion

### Keyboard Shortcuts
- `Ctrl/Cmd + E`: Toggle live evaluation mode
- `Ctrl/Cmd + Shift + E`: Run evaluation once

### UI Components
- **Result Tab**: Shows overall evaluation result with pass/fail status
- **Details Tab**: Hierarchical view of condition evaluation with drill-down capability
- **Test Data Tab**: Editable JSON viewer for modifying test data on the fly

## Usage

```tsx
import { RuleEvaluator } from '@usex/rule-engine-builder';

function MyApp() {
  const handleEvaluationChange = (result) => {
    console.log('Evaluation result:', result);
  };

  return (
    <RuleEvaluator
      defaultSampleData={mySampleData}
      onEvaluationChange={handleEvaluationChange}
      className="my-custom-class"
    />
  );
}
```

## Props

| Prop | Type | Description | Default |
|------|------|-------------|---------|
| `className` | `string` | Additional CSS classes for styling | - |
| `defaultSampleData` | `any` | Initial sample data for evaluation | `sampleEcommerceData` |
| `onEvaluationChange` | `(result: EvaluationResult \| null) => void` | Callback when evaluation result changes | - |

## How It Works

### Evaluation Process
1. The component uses the `@usex/rule-engine` package to evaluate rules
2. It subscribes to the enhanced rule store for rule updates
3. In live mode, it automatically re-evaluates when rules change
4. Results are displayed with detailed condition breakdowns

### Visual Feedback
- **Green indicators**: Rule or condition passed
- **Red indicators**: Rule or condition failed
- **Animated transitions**: Smooth UI updates for better UX
- **Hierarchical display**: Nested conditions are indented and collapsible

### Test Data Management
- Edit test data directly in the component
- Reset to default data with one click
- JSON syntax validation
- Real-time updates when data changes

## Integration with Rule Builder

The `RuleEvaluator` component is designed to work seamlessly with the `TreeRuleBuilder`:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">
    <TreeRuleBuilder sampleData={sampleData} />
  </div>
  <div className="lg:col-span-1">
    <RuleEvaluator defaultSampleData={sampleData} />
  </div>
</div>
```

## Advanced Features

### Condition Details
The component evaluates each condition recursively and shows:
- Condition type (AND, OR, NONE)
- Number of sub-conditions
- Individual constraint evaluation results
- Actual vs. expected values
- Custom error messages

### Performance
- Debounced evaluation in live mode
- Efficient re-rendering with React hooks
- Minimal state updates
- Optimized for large rule trees

## Styling

The component uses Tailwind CSS and follows the design system of the rule builder. It supports:
- Light and dark themes
- Responsive design
- Custom color schemes via CSS variables
- Smooth animations and transitions

## Error Handling

The component gracefully handles:
- Invalid rule structures
- Malformed test data
- Evaluation errors
- Network timeouts (if using async evaluation)

Errors are displayed with clear messages and don't crash the UI.