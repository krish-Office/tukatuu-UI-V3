import crypto from "crypto";

export interface PaymentRequest {
  orderId: string;
  amount: number; // In dollars (e.g. 45.50)
  currency: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  status: "pending" | "completed" | "failed";
  message: string;
  chargeId?: string;
}

function generateRandomHex(length: number): string {
  const chars = "abcdef0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Simulates a Stripe payment gateway transaction with authentic response payloads,
 * error generation, and telemetry logging.
 */
export async function processPayment(request: PaymentRequest): Promise<PaymentResponse> {
  try {
    console.group("💳 [GreenMart Payment Gateway] - Initiating Transaction");
    console.log(`Order ID: ${request.orderId}`);
    console.log(`Amount: ${request.currency.toUpperCase()} ${request.amount.toFixed(2)}`);
    console.log(`Customer: ${request.customerName} (${request.customerEmail})`);
    console.groupEnd();

    // 50ms to 120ms standard connection latency simulation
    await new Promise(resolve => setTimeout(resolve, 80));

    // 95% success rate simulation for robust demo testing
    const success = Math.random() > 0.05;

    if (!success) {
      return {
        success: false,
        transactionId: "",
        status: "failed",
        message: "Payment declined by issuing bank. Please verify funds and try a different card."
      };
    }

    const transactionId = `txn_${generateRandomHex(16)}`;
    const chargeId = `ch_${generateRandomHex(16)}`;

    console.log(`✅ [GreenMart Payment Gateway] - Transaction Authorized. TransactionID: ${transactionId}`);

    return {
      success: true,
      transactionId,
      status: "completed",
      message: "Payment authorized and captured successfully.",
      chargeId
    };
  } catch (error) {
    console.error("Critical gateway failure:", error);
    return {
      success: false,
      transactionId: "",
      status: "failed",
      message: "An internal payment gateway error occurred. Please try again."
    };
  }
}

export function getAvailablePaymentMethods(): string[] {
  return ["Credit Card", "PayPal", "Google Pay", "Apple Pay"];
}
