/**
 * MCP Tools Catalog
 * All tools available to TrueForge agents
 */

export * from "./finance.js";
export * from "./vendor.js";
export * from "./contracts.js";

/**
 * Tool definitions for registration with TrueForge
 */

export const toolsRegistry = [
  // Finance tools
  {
    name: "get_invoice_details",
    description: "Retrieve detailed information about a specific invoice",
    inputSchema: {
      type: "object",
      properties: {
        invoiceId: {
          type: "string",
          description: "The ID of the invoice to retrieve",
        },
      },
      required: ["invoiceId"],
    },
  },
  {
    name: "analyze_invoice_variance",
    description:
      "Analyze invoice amount variance against historical data and contract ceiling",
    inputSchema: {
      type: "object",
      properties: {
        invoiceId: {
          type: "string",
          description: "The ID of the invoice to analyze",
        },
        vendorId: {
          type: "string",
          description: "The ID of the vendor",
        },
      },
      required: ["invoiceId", "vendorId"],
    },
  },
  {
    name: "get_payment_history",
    description: "Retrieve payment history for a specific vendor",
    inputSchema: {
      type: "object",
      properties: {
        vendorId: {
          type: "string",
          description: "The ID of the vendor",
        },
      },
      required: ["vendorId"],
    },
  },

  // Vendor tools
  {
    name: "get_vendor_details",
    description: "Retrieve vendor information including contacts and status",
    inputSchema: {
      type: "object",
      properties: {
        vendorId: {
          type: "string",
          description: "The ID of the vendor",
        },
      },
      required: ["vendorId"],
    },
  },
  {
    name: "get_vendor_bank_history",
    description: "Retrieve vendor's bank account history and changes",
    inputSchema: {
      type: "object",
      properties: {
        vendorId: {
          type: "string",
          description: "The ID of the vendor",
        },
      },
      required: ["vendorId"],
    },
  },
  {
    name: "verify_vendor_contact",
    description: "Verify if a contact person is known and verified for a vendor",
    inputSchema: {
      type: "object",
      properties: {
        vendorId: {
          type: "string",
          description: "The ID of the vendor",
        },
        email: {
          type: "string",
          description: "The email address of the contact to verify",
        },
      },
      required: ["vendorId", "email"],
    },
  },
  {
    name: "check_bank_change_authorization",
    description:
      "Check if a recent bank account change was authorized by a verified contact",
    inputSchema: {
      type: "object",
      properties: {
        vendorId: {
          type: "string",
          description: "The ID of the vendor",
        },
        newBankAccount: {
          type: "string",
          description: "The new bank account reference",
        },
      },
      required: ["vendorId", "newBankAccount"],
    },
  },

  // Contract tools
  {
    name: "get_active_contract",
    description: "Retrieve the active contract for a vendor",
    inputSchema: {
      type: "object",
      properties: {
        vendorId: {
          type: "string",
          description: "The ID of the vendor",
        },
      },
      required: ["vendorId"],
    },
  },
  {
    name: "analyze_contract_compliance",
    description:
      "Analyze if an invoice amount complies with active contract terms",
    inputSchema: {
      type: "object",
      properties: {
        vendorId: {
          type: "string",
          description: "The ID of the vendor",
        },
        invoiceAmount: {
          type: "number",
          description: "The invoice amount to check",
        },
      },
      required: ["vendorId", "invoiceAmount"],
    },
  },
  {
    name: "get_purchase_order_details",
    description: "Retrieve details of a specific purchase order",
    inputSchema: {
      type: "object",
      properties: {
        poId: {
          type: "string",
          description: "The ID of the purchase order",
        },
      },
      required: ["poId"],
    },
  },
  {
    name: "check_po_coverage",
    description: "Check if an invoice amount is covered by active purchase orders",
    inputSchema: {
      type: "object",
      properties: {
        vendorId: {
          type: "string",
          description: "The ID of the vendor",
        },
        invoiceAmount: {
          type: "number",
          description: "The invoice amount to check",
        },
      },
      required: ["vendorId", "invoiceAmount"],
    },
  },
];
