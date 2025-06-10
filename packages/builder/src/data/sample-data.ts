// Comprehensive sample data for showcasing the rule builder
import type { FieldConfig } from "../types";

export const sampleEcommerceData = {
  user: {
    id: "usr_123456",
    name: "John Doe",
    email: "john.doe@example.com",
    age: 32,
    status: "active",
    role: "premium",
    createdAt: "2023-01-15T10:30:00Z",
    lastLoginAt: "2024-01-20T14:22:00Z",
    profile: {
      avatar: "https://example.com/avatar/john.jpg",
      bio: "Software developer and tech enthusiast",
      preferences: {
        newsletter: true,
        notifications: {
          email: true,
          push: false,
          sms: true,
        },
        theme: "dark",
        language: "en",
        timezone: "America/New_York",
      },
      social: {
        twitter: "@johndoe",
        linkedin: "john-doe-123",
        github: "johndoe",
      },
    },
    address: {
      billing: {
        street: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "USA",
        isDefault: true,
      },
      shipping: [
        {
          id: "addr_1",
          label: "Home",
          street: "123 Main St",
          city: "New York",
          state: "NY",
          zip: "10001",
          country: "USA",
          isDefault: true,
        },
        {
          id: "addr_2",
          label: "Office",
          street: "456 Business Ave",
          city: "New York",
          state: "NY",
          zip: "10002",
          country: "USA",
          isDefault: false,
        },
      ],
    },
    membership: {
      tier: "gold",
      points: 15420,
      expiresAt: "2024-12-31T23:59:59Z",
      benefits: ["free_shipping", "priority_support", "exclusive_deals"],
      history: [
        { tier: "bronze", startDate: "2023-01-15", endDate: "2023-06-30" },
        { tier: "silver", startDate: "2023-07-01", endDate: "2023-12-31" },
        { tier: "gold", startDate: "2024-01-01", endDate: null },
      ],
    },
  },
  cart: {
    id: "cart_789012",
    items: [
      {
        id: "item_1",
        productId: "prod_001",
        name: "Wireless Headphones",
        category: "electronics",
        price: 149.99,
        quantity: 1,
        discount: 0.1,
        attributes: {
          color: "black",
          warranty: "2 years",
          brand: "TechSound",
        },
      },
      {
        id: "item_2",
        productId: "prod_002",
        name: "Smart Watch",
        category: "electronics",
        price: 299.99,
        quantity: 2,
        discount: 0.15,
        attributes: {
          color: "silver",
          size: "42mm",
          brand: "TimeTech",
        },
      },
      {
        id: "item_3",
        productId: "prod_003",
        name: "Running Shoes",
        category: "sports",
        price: 89.99,
        quantity: 1,
        discount: 0,
        attributes: {
          color: "blue",
          size: "10",
          brand: "RunFast",
        },
      },
    ],
    subtotal: 839.96,
    tax: 67.2,
    shipping: 9.99,
    discount: 134.99,
    total: 782.16,
    couponCode: "SAVE15",
    isGift: false,
  },
  order: {
    recent: [
      {
        id: "ord_456789",
        date: "2024-01-10T16:45:00Z",
        status: "delivered",
        total: 567.89,
        items: 3,
        trackingNumber: "1Z999AA1234567890",
      },
      {
        id: "ord_456790",
        date: "2023-12-25T09:30:00Z",
        status: "delivered",
        total: 234.56,
        items: 2,
        trackingNumber: "1Z999AA0987654321",
      },
    ],
    statistics: {
      totalOrders: 45,
      totalSpent: 12456.78,
      averageOrderValue: 276.82,
      lastOrderDaysAgo: 10,
    },
  },
  payment: {
    methods: [
      {
        id: "pay_001",
        type: "credit_card",
        brand: "visa",
        last4: "4242",
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
        billingAddress: "addr_1",
      },
      {
        id: "pay_002",
        type: "paypal",
        email: "john.doe@example.com",
        isDefault: false,
      },
    ],
    wallet: {
      balance: 125.5,
      currency: "USD",
      transactions: [
        {
          id: "txn_001",
          type: "credit",
          amount: 50.0,
          date: "2024-01-15T10:00:00Z",
          description: "Refund for order #456788",
        },
        {
          id: "txn_002",
          type: "debit",
          amount: 25.0,
          date: "2024-01-18T14:30:00Z",
          description: "Applied to order #456791",
        },
      ],
    },
  },
  recommendations: {
    products: [
      {
        id: "prod_rec_001",
        name: "Laptop Stand",
        category: "accessories",
        price: 49.99,
        score: 0.95,
        reason: "frequently_bought_together",
      },
      {
        id: "prod_rec_002",
        name: "USB-C Hub",
        category: "accessories",
        price: 39.99,
        score: 0.89,
        reason: "similar_interests",
      },
    ],
    categories: ["electronics", "accessories", "sports"],
    basedOn: ["purchase_history", "browsing_behavior", "similar_users"],
  },
  session: {
    id: "sess_abc123",
    startTime: "2024-01-20T14:00:00Z",
    lastActivity: "2024-01-20T14:35:00Z",
    pageViews: 12,
    device: {
      type: "desktop",
      browser: "chrome",
      os: "macOS",
      screenResolution: "2560x1440",
    },
    location: {
      country: "USA",
      region: "NY",
      city: "New York",
      ip: "192.168.1.1",
    },
    referrer: "google.com",
    utmSource: "email",
    utmCampaign: "winter_sale_2024",
  },
};

// Field configurations for the rule builder
export const ecommerceFields: FieldConfig[] = [
  // User fields
  {
    name: "user.age",
    label: "User Age",
    type: "number",
    description: "Age of the user in years",
  },
  {
    name: "user.status",
    label: "User Status",
    type: "string",
    values: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
    ],
    description: "Current account status",
  },
  {
    name: "user.role",
    label: "User Role",
    type: "string",
    values: [
      { value: "basic", label: "Basic" },
      { value: "premium", label: "Premium" },
      { value: "vip", label: "VIP" },
    ],
    description: "User subscription tier",
  },
  {
    name: "user.membership.tier",
    label: "Membership Tier",
    type: "string",
    values: [
      { value: "bronze", label: "Bronze" },
      { value: "silver", label: "Silver" },
      { value: "gold", label: "Gold" },
      { value: "platinum", label: "Platinum" },
    ],
    description: "Current membership level",
  },
  {
    name: "user.membership.points",
    label: "Loyalty Points",
    type: "number",
    description: "Total accumulated loyalty points",
  },
  // Cart fields
  {
    name: "cart.total",
    label: "Cart Total",
    type: "number",
    description: "Total cart value including tax and shipping",
  },
  {
    name: "cart.items.length",
    label: "Items in Cart",
    type: "number",
    description: "Number of items in the shopping cart",
  },
  // Order fields
  {
    name: "order.statistics.totalOrders",
    label: "Total Orders",
    type: "number",
    description: "Lifetime number of orders placed",
  },
  {
    name: "order.statistics.totalSpent",
    label: "Total Spent",
    type: "number",
    description: "Lifetime amount spent",
  },
  {
    name: "order.statistics.averageOrderValue",
    label: "Average Order Value",
    type: "number",
    description: "Average value per order",
  },
  // Session fields
  {
    name: "session.device.type",
    label: "Device Type",
    type: "string",
    values: [
      { value: "desktop", label: "Desktop" },
      { value: "mobile", label: "Mobile" },
      { value: "tablet", label: "Tablet" },
    ],
    description: "Type of device being used",
  },
  {
    name: "session.location.country",
    label: "Country",
    type: "string",
    description: "User's country based on IP",
  },
];
