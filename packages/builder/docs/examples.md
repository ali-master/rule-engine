# Examples and Use Cases

Comprehensive collection of real-world examples using @usex/rule-engine-builder.

## Table of Contents

- [E-commerce Examples](#e-commerce-examples)
- [Access Control Examples](#access-control-examples)
- [Form Validation Examples](#form-validation-examples)
- [Business Logic Examples](#business-logic-examples)
- [Data Processing Examples](#data-processing-examples)
- [Integration Examples](#integration-examples)

## E-commerce Examples

### Dynamic Pricing Rules

```tsx
import { TreeRuleBuilder, FieldConfig } from '@usex/rule-engine-builder';

const pricingFields: FieldConfig[] = [
  {
    name: 'product.category',
    label: 'Product Category',
    type: 'string',
    group: 'Product',
    values: [
      { value: 'electronics', label: 'Electronics' },
      { value: 'clothing', label: 'Clothing' },
      { value: 'books', label: 'Books' },
      { value: 'home', label: 'Home & Garden' }
    ]
  },
  {
    name: 'product.price',
    label: 'Base Price',
    type: 'number',
    group: 'Product'
  },
  {
    name: 'customer.tier',
    label: 'Customer Tier',
    type: 'string',
    group: 'Customer',
    values: [
      { value: 'bronze', label: 'Bronze' },
      { value: 'silver', label: 'Silver' },
      { value: 'gold', label: 'Gold' },
      { value: 'platinum', label: 'Platinum' }
    ]
  },
  {
    name: 'order.quantity',
    label: 'Order Quantity',
    type: 'number',
    group: 'Order'
  },
  {
    name: 'order.total',
    label: 'Order Total',
    type: 'number',
    group: 'Order'
  },
  {
    name: 'customer.isFirstTime',
    label: 'First Time Customer',
    type: 'boolean',
    group: 'Customer'
  },
  {
    name: 'season.current',
    label: 'Current Season',
    type: 'string',
    group: 'Context',
    values: [
      { value: 'spring', label: 'Spring' },
      { value: 'summer', label: 'Summer' },
      { value: 'fall', label: 'Fall' },
      { value: 'winter', label: 'Winter' }
    ]
  }
];

function DynamicPricingBuilder() {
  const [pricingRule, setPricingRule] = useState(null);
  
  const sampleData = {
    product: {
      category: 'electronics',
      price: 299.99,
      name: 'Wireless Headphones'
    },
    customer: {
      tier: 'gold',
      isFirstTime: false,
      totalSpent: 1500
    },
    order: {
      quantity: 2,
      total: 599.98
    },
    season: {
      current: 'winter'
    }
  };
  
  const handlePricingRuleChange = (rule) => {
    setPricingRule(rule);
    console.log('Pricing rule updated:', rule);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Dynamic Pricing Rules</h2>
        <p className="text-gray-600 mb-6">
          Create rules to automatically adjust pricing based on customer, product, and context factors.
        </p>
        
        <TreeRuleBuilder
          fields={pricingFields}
          sampleData={sampleData}
          onChange={handlePricingRuleChange}
          labels={{
            addGroup: 'Add Pricing Condition',
            noRules: 'No pricing rules defined. Add conditions to create dynamic pricing.'
          }}
          colors={{
            and: 'border-green-500/30 bg-green-500/5',
            or: 'border-blue-500/30 bg-blue-500/5',
            none: 'border-red-500/30 bg-red-500/5'
          }}
        />
      </div>
      
      {/* Example rule preview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Example Pricing Rules:</h3>
        <ul className="text-sm space-y-1">
          <li>• Gold/Platinum customers get 15% off electronics over $200</li>
          <li>• First-time customers get 10% off their first order</li>
          <li>• Bulk orders (5+ items) get 20% off</li>
          <li>• Winter season: 25% off clothing items</li>
        </ul>
      </div>
    </div>
  );
}
```

### Shipping Rate Calculator

```tsx
const shippingFields: FieldConfig[] = [
  {
    name: 'order.weight',
    label: 'Package Weight (lbs)',
    type: 'number',
    group: 'Package'
  },
  {
    name: 'order.dimensions',
    label: 'Package Dimensions',
    type: 'object',
    group: 'Package'
  },
  {
    name: 'destination.country',
    label: 'Destination Country',
    type: 'string',
    group: 'Destination',
    values: [
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
      { value: 'MX', label: 'Mexico' },
      { value: 'UK', label: 'United Kingdom' },
      { value: 'DE', label: 'Germany' }
    ]
  },
  {
    name: 'destination.state',
    label: 'Destination State',
    type: 'string',
    group: 'Destination'
  },
  {
    name: 'destination.isRemote',
    label: 'Remote Location',
    type: 'boolean',
    group: 'Destination'
  },
  {
    name: 'shipping.method',
    label: 'Shipping Method',
    type: 'string',
    group: 'Shipping',
    values: [
      { value: 'standard', label: 'Standard (5-7 days)' },
      { value: 'expedited', label: 'Expedited (2-3 days)' },
      { value: 'overnight', label: 'Overnight' }
    ]
  },
  {
    name: 'customer.isPremium',
    label: 'Premium Customer',
    type: 'boolean',
    group: 'Customer'
  }
];

function ShippingCalculatorBuilder() {
  const sampleData = {
    order: {
      weight: 2.5,
      dimensions: { length: 12, width: 8, height: 6 },
      value: 199.99
    },
    destination: {
      country: 'US',
      state: 'CA',
      zipCode: '90210',
      isRemote: false
    },
    shipping: {
      method: 'standard'
    },
    customer: {
      isPremium: true
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Shipping Rate Rules</h2>
        
        <TreeRuleBuilder
          fields={shippingFields}
          sampleData={sampleData}
          onChange={(rule) => console.log('Shipping rule:', rule)}
          labels={{
            addGroup: 'Add Shipping Condition',
            noRules: 'No shipping rules defined. Create rules to calculate shipping rates.'
          }}
        />
      </div>
      
      {/* Rate examples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded">
          <h4 className="font-semibold">Standard Shipping</h4>
          <p className="text-sm">$5.99 base + $0.50/lb</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded">
          <h4 className="font-semibold">Expedited Shipping</h4>
          <p className="text-sm">$12.99 base + $1.00/lb</p>
        </div>
        <div className="bg-red-50 p-4 rounded">
          <h4 className="font-semibold">Overnight Shipping</h4>
          <p className="text-sm">$24.99 base + $2.00/lb</p>
        </div>
      </div>
    </div>
  );
}
```

### Promotional Campaign Rules

```tsx
const promotionFields: FieldConfig[] = [
  {
    name: 'campaign.code',
    label: 'Promotion Code',
    type: 'string',
    group: 'Campaign'
  },
  {
    name: 'campaign.startDate',
    label: 'Campaign Start Date',
    type: 'date',
    group: 'Campaign'
  },
  {
    name: 'campaign.endDate',
    label: 'Campaign End Date',
    type: 'date',
    group: 'Campaign'
  },
  {
    name: 'customer.email',
    label: 'Customer Email',
    type: 'string',
    group: 'Customer'
  },
  {
    name: 'customer.previousOrders',
    label: 'Previous Orders Count',
    type: 'number',
    group: 'Customer'
  },
  {
    name: 'order.items',
    label: 'Order Items',
    type: 'array',
    group: 'Order'
  },
  {
    name: 'order.categories',
    label: 'Product Categories',
    type: 'array',
    group: 'Order'
  }
];

function PromotionalCampaignBuilder() {
  const sampleData = {
    campaign: {
      code: 'SAVE20',
      startDate: '2024-01-01',
      endDate: '2024-01-31'
    },
    customer: {
      email: 'customer@example.com',
      previousOrders: 3,
      registrationDate: '2023-06-15'
    },
    order: {
      items: ['item1', 'item2', 'item3'],
      categories: ['electronics', 'accessories'],
      total: 299.99
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Promotional Campaign Rules</h2>
        <p className="text-gray-600 mb-6">
          Define complex promotional rules with multiple conditions and customer targeting.
        </p>
        
        <TreeRuleBuilder
          fields={promotionFields}
          sampleData={sampleData}
          onChange={(rule) => console.log('Promotion rule:', rule)}
          labels={{
            addGroup: 'Add Promotion Condition',
            or: 'ANY of these conditions',
            and: 'ALL of these conditions',
            none: 'NONE of these conditions'
          }}
        />
      </div>
      
      {/* Campaign examples */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg">
        <h3 className="font-semibold mb-4">Example Campaign Rules:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded">
            <h4 className="font-semibold text-purple-700">New Customer Welcome</h4>
            <ul className="text-sm mt-2 space-y-1">
              <li>• First-time customers only</li>
              <li>• 20% off first order</li>
              <li>• Minimum $50 purchase</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded">
            <h4 className="font-semibold text-pink-700">Loyalty Rewards</h4>
            <ul className="text-sm mt-2 space-y-1">
              <li>• 5+ previous orders</li>
              <li>• 15% off electronics</li>
              <li>• Free shipping included</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Access Control Examples

### Role-Based Access Control (RBAC)

```tsx
const rbacFields: FieldConfig[] = [
  {
    name: 'user.role',
    label: 'User Role',
    type: 'string',
    group: 'User',
    values: [
      { value: 'admin', label: 'Administrator' },
      { value: 'manager', label: 'Manager' },
      { value: 'employee', label: 'Employee' },
      { value: 'contractor', label: 'Contractor' },
      { value: 'guest', label: 'Guest' }
    ]
  },
  {
    name: 'user.department',
    label: 'Department',
    type: 'string',
    group: 'User',
    values: [
      { value: 'engineering', label: 'Engineering' },
      { value: 'sales', label: 'Sales' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'hr', label: 'Human Resources' },
      { value: 'finance', label: 'Finance' }
    ]
  },
  {
    name: 'user.permissions',
    label: 'User Permissions',
    type: 'array',
    group: 'User'
  },
  {
    name: 'resource.type',
    label: 'Resource Type',
    type: 'string',
    group: 'Resource',
    values: [
      { value: 'document', label: 'Document' },
      { value: 'project', label: 'Project' },
      { value: 'user-profile', label: 'User Profile' },
      { value: 'financial-data', label: 'Financial Data' },
      { value: 'system-config', label: 'System Configuration' }
    ]
  },
  {
    name: 'resource.owner',
    label: 'Resource Owner',
    type: 'string',
    group: 'Resource'
  },
  {
    name: 'resource.confidentiality',
    label: 'Confidentiality Level',
    type: 'string',
    group: 'Resource',
    values: [
      { value: 'public', label: 'Public' },
      { value: 'internal', label: 'Internal' },
      { value: 'confidential', label: 'Confidential' },
      { value: 'restricted', label: 'Restricted' }
    ]
  },
  {
    name: 'action.type',
    label: 'Action Type',
    type: 'string',
    group: 'Action',
    values: [
      { value: 'read', label: 'Read' },
      { value: 'write', label: 'Write' },
      { value: 'delete', label: 'Delete' },
      { value: 'share', label: 'Share' },
      { value: 'export', label: 'Export' }
    ]
  },
  {
    name: 'context.time',
    label: 'Access Time',
    type: 'string',
    group: 'Context'
  },
  {
    name: 'context.location',
    label: 'Access Location',
    type: 'string',
    group: 'Context'
  }
];

function RBACBuilder() {
  const sampleData = {
    user: {
      id: 'user123',
      role: 'manager',
      department: 'engineering',
      permissions: ['read', 'write', 'manage-team'],
      clearanceLevel: 3
    },
    resource: {
      id: 'doc456',
      type: 'document',
      owner: 'user789',
      confidentiality: 'internal',
      department: 'engineering'
    },
    action: {
      type: 'read'
    },
    context: {
      time: '14:30',
      location: 'office',
      ipAddress: '192.168.1.100'
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Access Control Rules</h2>
        <p className="text-gray-600 mb-6">
          Define role-based access control rules with fine-grained permissions.
        </p>
        
        <TreeRuleBuilder
          fields={rbacFields}
          sampleData={sampleData}
          onChange={(rule) => console.log('Access rule:', rule)}
          labels={{
            addGroup: 'Add Access Condition',
            noRules: 'No access rules defined. Create rules to control resource access.'
          }}
          colors={{
            and: 'border-green-500/30 bg-green-500/5',
            or: 'border-orange-500/30 bg-orange-500/5',
            none: 'border-red-500/30 bg-red-500/5'
          }}
        />
      </div>
      
      {/* Access examples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded border border-green-200">
          <h4 className="font-semibold text-green-800">Admin Access</h4>
          <ul className="text-sm mt-2 space-y-1 text-green-700">
            <li>• Full system access</li>
            <li>• All resource types</li>
            <li>• All actions allowed</li>
          </ul>
        </div>
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h4 className="font-semibold text-blue-800">Manager Access</h4>
          <ul className="text-sm mt-2 space-y-1 text-blue-700">
            <li>• Department resources</li>
            <li>• Team management</li>
            <li>• Read/Write permissions</li>
          </ul>
        </div>
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <h4 className="font-semibold text-gray-800">Employee Access</h4>
          <ul className="text-sm mt-2 space-y-1 text-gray-700">
            <li>• Own resources only</li>
            <li>• Public documents</li>
            <li>• Limited actions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

### Multi-Factor Authentication Rules

```tsx
const mfaFields: FieldConfig[] = [
  {
    name: 'user.riskScore',
    label: 'User Risk Score',
    type: 'number',
    group: 'User',
    description: 'Calculated risk score from 0-100'
  },
  {
    name: 'device.trusted',
    label: 'Trusted Device',
    type: 'boolean',
    group: 'Device'
  },
  {
    name: 'location.knownLocation',
    label: 'Known Location',
    type: 'boolean',
    group: 'Location'
  },
  {
    name: 'location.country',
    label: 'Country',
    type: 'string',
    group: 'Location'
  },
  {
    name: 'session.lastLogin',
    label: 'Last Login',
    type: 'date',
    group: 'Session'
  },
  {
    name: 'action.sensitivity',
    label: 'Action Sensitivity',
    type: 'string',
    group: 'Action',
    values: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' }
    ]
  }
];

function MFABuilder() {
  const sampleData = {
    user: {
      id: 'user123',
      riskScore: 25,
      hasActiveMFA: true
    },
    device: {
      id: 'device456',
      trusted: true,
      type: 'mobile'
    },
    location: {
      knownLocation: false,
      country: 'US',
      ipAddress: '203.0.113.1'
    },
    session: {
      lastLogin: '2024-01-15T10:30:00Z',
      duration: 30
    },
    action: {
      type: 'transfer-funds',
      sensitivity: 'critical'
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Multi-Factor Authentication Rules</h2>
        <p className="text-gray-600 mb-6">
          Create intelligent MFA rules based on risk assessment and context.
        </p>
        
        <TreeRuleBuilder
          fields={mfaFields}
          sampleData={sampleData}
          onChange={(rule) => console.log('MFA rule:', rule)}
          labels={{
            addGroup: 'Add MFA Condition'
          }}
        />
      </div>
      
      {/* MFA scenarios */}
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="font-semibold mb-4 text-yellow-800">MFA Trigger Scenarios:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">High Risk Scenarios:</h4>
            <ul className="text-sm space-y-1">
              <li>• Unknown device or location</li>
              <li>• High-sensitivity actions</li>
              <li>• Elevated risk score (&gt; 50)</li>
              <li>• International access</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Low Risk Scenarios:</h4>
            <ul className="text-sm space-y-1">
              <li>• Trusted device + known location</li>
              <li>• Low-sensitivity actions</li>
              <li>• Recent successful authentication</li>
              <li>• Low risk score (&lt; 20)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Form Validation Examples

### User Registration Validation

```tsx
const registrationFields: FieldConfig[] = [
  {
    name: 'email',
    label: 'Email Address',
    type: 'string',
    group: 'Contact'
  },
  {
    name: 'password',
    label: 'Password',
    type: 'string',
    group: 'Security'
  },
  {
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'string',
    group: 'Security'
  },
  {
    name: 'firstName',
    label: 'First Name',
    type: 'string',
    group: 'Personal'
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'string',
    group: 'Personal'
  },
  {
    name: 'age',
    label: 'Age',
    type: 'number',
    group: 'Personal'
  },
  {
    name: 'phoneNumber',
    label: 'Phone Number',
    type: 'string',
    group: 'Contact'
  },
  {
    name: 'acceptTerms',
    label: 'Accept Terms',
    type: 'boolean',
    group: 'Legal'
  },
  {
    name: 'marketingConsent',
    label: 'Marketing Consent',
    type: 'boolean',
    group: 'Legal'
  }
];

function RegistrationValidationBuilder() {
  const [validationRule, setValidationRule] = useState(null);
  const [formData, setFormData] = useState({
    email: 'user@example.com',
    password: 'securePass123!',
    confirmPassword: 'securePass123!',
    firstName: 'John',
    lastName: 'Doe',
    age: 25,
    phoneNumber: '+1-555-0123',
    acceptTerms: true,
    marketingConsent: false
  });
  
  const validateForm = async (data) => {
    if (!validationRule) return { isValid: true, errors: [] };
    
    try {
      const result = await RuleEngine.evaluate(validationRule, data);
      return {
        isValid: result.isPassed,
        errors: result.isPassed ? [] : ['Validation failed']
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [error.message]
      };
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Registration Validation Rules</h2>
        <p className="text-gray-600 mb-6">
          Create comprehensive validation rules for user registration forms.
        </p>
        
        <TreeRuleBuilder
          fields={registrationFields}
          sampleData={formData}
          onChange={setValidationRule}
          labels={{
            addGroup: 'Add Validation Rule',
            noRules: 'No validation rules defined. Add rules to validate form fields.'
          }}
        />
      </div>
      
      {/* Form testing */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-4">Test Validation</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Sample Form Data:</h4>
            <pre className="text-xs bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium mb-2">Validation Rules:</h4>
            <ul className="text-sm space-y-1">
              <li>• Email must be valid format</li>
              <li>• Password minimum 8 characters</li>
              <li>• Password must contain uppercase, lowercase, number, symbol</li>
              <li>• Passwords must match</li>
              <li>• Age must be 18 or older</li>
              <li>• Terms must be accepted</li>
            </ul>
          </div>
        </div>
        
        <button
          onClick={() => validateForm(formData)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Validate Form
        </button>
      </div>
    </div>
  );
}
```

### Dynamic Form Validation

```tsx
const dynamicValidationFields: FieldConfig[] = [
  {
    name: 'field.name',
    label: 'Field Name',
    type: 'string',
    group: 'Field'
  },
  {
    name: 'field.type',
    label: 'Field Type',
    type: 'string',
    group: 'Field',
    values: [
      { value: 'text', label: 'Text' },
      { value: 'email', label: 'Email' },
      { value: 'number', label: 'Number' },
      { value: 'date', label: 'Date' },
      { value: 'select', label: 'Select' },
      { value: 'checkbox', label: 'Checkbox' }
    ]
  },
  {
    name: 'field.required',
    label: 'Required Field',
    type: 'boolean',
    group: 'Field'
  },
  {
    name: 'field.value',
    label: 'Field Value',
    type: 'string',
    group: 'Field'
  },
  {
    name: 'form.step',
    label: 'Form Step',
    type: 'number',
    group: 'Form'
  },
  {
    name: 'user.role',
    label: 'User Role',
    type: 'string',
    group: 'Context',
    values: [
      { value: 'admin', label: 'Administrator' },
      { value: 'user', label: 'Regular User' },
      { value: 'guest', label: 'Guest' }
    ]
  }
];

function DynamicValidationBuilder() {
  const sampleData = {
    field: {
      name: 'businessLicense',
      type: 'text',
      required: true,
      value: 'BL123456789'
    },
    form: {
      step: 2,
      totalSteps: 4,
      category: 'business-registration'
    },
    user: {
      role: 'user',
      accountType: 'business'
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Dynamic Form Validation</h2>
        <p className="text-gray-600 mb-6">
          Create conditional validation rules that adapt based on form context and user role.
        </p>
        
        <TreeRuleBuilder
          fields={dynamicValidationFields}
          sampleData={sampleData}
          onChange={(rule) => console.log('Dynamic validation rule:', rule)}
          labels={{
            addGroup: 'Add Conditional Validation'
          }}
        />
      </div>
      
      {/* Validation scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">Step-Based Validation</h4>
          <ul className="text-sm space-y-1 text-blue-700">
            <li>• Step 1: Basic info required</li>
            <li>• Step 2: Business details (if business account)</li>
            <li>• Step 3: Payment info (if paid plan)</li>
            <li>• Step 4: Final verification</li>
          </ul>
        </div>
        <div className="bg-green-50 p-4 rounded border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">Role-Based Validation</h4>
          <ul className="text-sm space-y-1 text-green-700">
            <li>• Admin: All fields optional</li>
            <li>• Business: Additional docs required</li>
            <li>• Individual: Simplified validation</li>
            <li>• Guest: Limited access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

## Business Logic Examples

### Lead Scoring System

```tsx
const leadScoringFields: FieldConfig[] = [
  {
    name: 'company.size',
    label: 'Company Size',
    type: 'string',
    group: 'Company',
    values: [
      { value: 'startup', label: 'Startup (1-10 employees)' },
      { value: 'small', label: 'Small (11-50 employees)' },
      { value: 'medium', label: 'Medium (51-200 employees)' },
      { value: 'large', label: 'Large (201-1000 employees)' },
      { value: 'enterprise', label: 'Enterprise (1000+ employees)' }
    ]
  },
  {
    name: 'company.industry',
    label: 'Industry',
    type: 'string',
    group: 'Company',
    values: [
      { value: 'technology', label: 'Technology' },
      { value: 'finance', label: 'Finance' },
      { value: 'healthcare', label: 'Healthcare' },
      { value: 'retail', label: 'Retail' },
      { value: 'manufacturing', label: 'Manufacturing' }
    ]
  },
  {
    name: 'company.revenue',
    label: 'Annual Revenue',
    type: 'number',
    group: 'Company'
  },
  {
    name: 'contact.title',
    label: 'Job Title',
    type: 'string',
    group: 'Contact',
    values: [
      { value: 'ceo', label: 'CEO' },
      { value: 'cto', label: 'CTO' },
      { value: 'vp', label: 'VP' },
      { value: 'director', label: 'Director' },
      { value: 'manager', label: 'Manager' },
      { value: 'individual', label: 'Individual Contributor' }
    ]
  },
  {
    name: 'engagement.emailOpens',
    label: 'Email Opens (30 days)',
    type: 'number',
    group: 'Engagement'
  },
  {
    name: 'engagement.websiteVisits',
    label: 'Website Visits (30 days)',
    type: 'number',
    group: 'Engagement'
  },
  {
    name: 'engagement.contentDownloads',
    label: 'Content Downloads',
    type: 'number',
    group: 'Engagement'
  },
  {
    name: 'behavior.demoRequested',
    label: 'Demo Requested',
    type: 'boolean',
    group: 'Behavior'
  },
  {
    name: 'behavior.pricingPageViews',
    label: 'Pricing Page Views',
    type: 'number',
    group: 'Behavior'
  }
];

function LeadScoringBuilder() {
  const sampleData = {
    company: {
      size: 'medium',
      industry: 'technology',
      revenue: 5000000,
      location: 'US'
    },
    contact: {
      title: 'cto',
      email: 'cto@example.com',
      firstName: 'Jane',
      lastName: 'Smith'
    },
    engagement: {
      emailOpens: 8,
      websiteVisits: 15,
      contentDownloads: 3
    },
    behavior: {
      demoRequested: true,
      pricingPageViews: 5,
      trialStarted: false
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Lead Scoring Rules</h2>
        <p className="text-gray-600 mb-6">
          Create intelligent lead scoring based on company fit and engagement metrics.
        </p>
        
        <TreeRuleBuilder
          fields={leadScoringFields}
          sampleData={sampleData}
          onChange={(rule) => console.log('Lead scoring rule:', rule)}
          labels={{
            addGroup: 'Add Scoring Condition'
          }}
        />
      </div>
      
      {/* Scoring matrix */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-4">Lead Scoring Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold text-red-600">Cold Lead (0-25)</h4>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Small company</li>
              <li>• Low engagement</li>
              <li>• No demo interest</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold text-yellow-600">Warm Lead (26-50)</h4>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Medium company</li>
              <li>• Some engagement</li>
              <li>• Content downloads</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold text-orange-600">Hot Lead (51-75)</h4>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Large company</li>
              <li>• High engagement</li>
              <li>• Pricing interest</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded shadow">
            <h4 className="font-semibold text-green-600">Qualified Lead (76-100)</h4>
            <ul className="text-sm mt-2 space-y-1">
              <li>• Enterprise company</li>
              <li>• Decision maker</li>
              <li>• Demo requested</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Inventory Management Rules

```tsx
const inventoryFields: FieldConfig[] = [
  {
    name: 'product.sku',
    label: 'Product SKU',
    type: 'string',
    group: 'Product'
  },
  {
    name: 'product.category',
    label: 'Product Category',
    type: 'string',
    group: 'Product'
  },
  {
    name: 'inventory.currentStock',
    label: 'Current Stock',
    type: 'number',
    group: 'Inventory'
  },
  {
    name: 'inventory.minimumStock',
    label: 'Minimum Stock Level',
    type: 'number',
    group: 'Inventory'
  },
  {
    name: 'inventory.maximumStock',
    label: 'Maximum Stock Level',
    type: 'number',
    group: 'Inventory'
  },
  {
    name: 'sales.velocity',
    label: 'Sales Velocity (units/day)',
    type: 'number',
    group: 'Sales'
  },
  {
    name: 'sales.trend',
    label: 'Sales Trend',
    type: 'string',
    group: 'Sales',
    values: [
      { value: 'increasing', label: 'Increasing' },
      { value: 'stable', label: 'Stable' },
      { value: 'decreasing', label: 'Decreasing' }
    ]
  },
  {
    name: 'supplier.leadTime',
    label: 'Supplier Lead Time (days)',
    type: 'number',
    group: 'Supplier'
  },
  {
    name: 'season.current',
    label: 'Current Season',
    type: 'string',
    group: 'Context'
  }
];

function InventoryManagementBuilder() {
  const sampleData = {
    product: {
      sku: 'WH-001',
      category: 'electronics',
      name: 'Wireless Headphones'
    },
    inventory: {
      currentStock: 15,
      minimumStock: 10,
      maximumStock: 100,
      warehouseLocation: 'A1-B2'
    },
    sales: {
      velocity: 2.5,
      trend: 'increasing',
      lastWeekSales: 18
    },
    supplier: {
      leadTime: 7,
      reliability: 0.95,
      cost: 45.00
    },
    season: {
      current: 'holiday'
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Inventory Management Rules</h2>
        <p className="text-gray-600 mb-6">
          Automate inventory decisions with intelligent reordering and stock level management.
        </p>
        
        <TreeRuleBuilder
          fields={inventoryFields}
          sampleData={sampleData}
          onChange={(rule) => console.log('Inventory rule:', rule)}
          labels={{
            addGroup: 'Add Inventory Condition'
          }}
        />
      </div>
      
      {/* Inventory actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <h4 className="font-semibold text-red-800">Reorder Alert</h4>
          <ul className="text-sm mt-2 space-y-1 text-red-700">
            <li>• Stock below minimum</li>
            <li>• High sales velocity</li>
            <li>• Long supplier lead time</li>
          </ul>
        </div>
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <h4 className="font-semibold text-yellow-800">Overstock Warning</h4>
          <ul className="text-sm mt-2 space-y-1 text-yellow-700">
            <li>• Stock above maximum</li>
            <li>• Decreasing sales trend</li>
            <li>• Season ending</li>
          </ul>
        </div>
        <div className="bg-green-50 p-4 rounded border border-green-200">
          <h4 className="font-semibold text-green-800">Optimal Stock</h4>
          <ul className="text-sm mt-2 space-y-1 text-green-700">
            <li>• Between min/max levels</li>
            <li>• Stable sales trend</li>
            <li>• Adequate supply buffer</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

## Integration Examples

### Complete E-commerce Platform

```tsx
function EcommercePlatformDemo() {
  const [activeTab, setActiveTab] = useState('pricing');
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          E-commerce Rule Engine Platform
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'pricing', label: 'Dynamic Pricing' },
                { id: 'shipping', label: 'Shipping Rules' },
                { id: 'promotions', label: 'Promotions' },
                { id: 'inventory', label: 'Inventory' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'pricing' && <DynamicPricingBuilder />}
            {activeTab === 'shipping' && <ShippingCalculatorBuilder />}
            {activeTab === 'promotions' && <PromotionalCampaignBuilder />}
            {activeTab === 'inventory' && <InventoryManagementBuilder />}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Multi-tenant SaaS Platform

```tsx
function SaaSRulePlatform() {
  const [tenant, setTenant] = useState('tenant1');
  const [ruleType, setRuleType] = useState('access');
  
  const tenantData = {
    tenant1: {
      name: 'Acme Corp',
      plan: 'enterprise',
      features: ['advanced-rules', 'api-access', 'audit-logs']
    },
    tenant2: {
      name: 'StartupXYZ',
      plan: 'pro',
      features: ['basic-rules', 'api-access']
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">SaaS Rule Engine</h1>
            <div className="flex items-center space-x-4">
              <select
                value={tenant}
                onChange={(e) => setTenant(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="tenant1">Acme Corp</option>
                <option value="tenant2">StartupXYZ</option>
              </select>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="access">Access Control</option>
                <option value="validation">Validation</option>
                <option value="pricing">Pricing</option>
              </select>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {tenantData[tenant].name} - {ruleType.charAt(0).toUpperCase() + ruleType.slice(1)} Rules
            </h2>
            <p className="text-gray-600">
              Plan: {tenantData[tenant].plan} | Features: {tenantData[tenant].features.join(', ')}
            </p>
          </div>
          
          {ruleType === 'access' && <RBACBuilder />}
          {ruleType === 'validation' && <RegistrationValidationBuilder />}
          {ruleType === 'pricing' && <DynamicPricingBuilder />}
        </div>
      </main>
    </div>
  );
}
```

---

For more examples and detailed implementation guides, see the [main documentation](../README.md).