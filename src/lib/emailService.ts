import { CartItem } from "./types";

/**
 * Service to simulate email communication for registration verification
 * and transaction invoices. Emits detailed logs to the console for testing.
 */
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    console.group("📬 [GreenMart Email Service] - Verification Required");
    console.log(`To: ${email}`);
    console.log(`Subject: Verify Your GreenMart Account`);
    console.log(`Verification Code: ${code}`);
    console.log(`HTML: <h2>Welcome to GreenMart!</h2><p>Your verification code is: <strong>${code}</strong></p><p>This code will expire in 10 minutes.</p>`);
    console.groupEnd();
    
    // In production: Integrate SendGrid, AWS SES or Resend fetch API here.
    return true;
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return false;
  }
}

export async function sendOrderConfirmation(
  email: string, 
  orderId: string, 
  total: number, 
  items: CartItem[], 
  shippingAddress: string
): Promise<boolean> {
  try {
    console.group("📬 [GreenMart Email Service] - Order Confirmed");
    console.log(`To: ${email}`);
    console.log(`Subject: Order Confirmation - ${orderId}`);
    console.log(`Total: $${total.toFixed(2)}`);
    console.log(`Address: ${shippingAddress}`);
    console.log("Items purchased:", items.map(i => `${i.name} (x${i.quantity})`));
    console.groupEnd();
    
    return true;
  } catch (error) {
    console.error("Failed to send order confirmation email:", error);
    return false;
  }
}
