interface VerificationCode {
  code: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}

/**
 * Persists and validates 6-digit registration codes in localStorage
 * so that users do not lose verification states during page refreshes.
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
}

export function storeVerificationCode(email: string, code: string): void {
  if (typeof window === "undefined") return;
  
  const now = Date.now();
  const data: VerificationCode = {
    code,
    email,
    createdAt: now,
    expiresAt: now + 10 * 60 * 1000 // 10 minutes expiry
  };
  
  localStorage.setItem(`gm_verify_${email}`, JSON.stringify(data));
}

export function verifyCode(email: string, code: string): boolean {
  if (typeof window === "undefined") return false;
  
  const stored = localStorage.getItem(`gm_verify_${email}`);
  if (!stored) return false;
  
  try {
    const data: VerificationCode = JSON.parse(stored);
    
    // Check if code is expired
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(`gm_verify_${email}`);
      return false;
    }
    
    // Validate match
    if (data.code === code) {
      localStorage.removeItem(`gm_verify_${email}`); // Clean up after successful validation
      return true;
    }
  } catch (error) {
    console.error("Failed to parse verification code:", error);
  }
  
  return false;
}

export function isCodeExpired(email: string): boolean {
  if (typeof window === "undefined") return true;
  
  const stored = localStorage.getItem(`gm_verify_${email}`);
  if (!stored) return true;
  
  try {
    const data: VerificationCode = JSON.parse(stored);
    return Date.now() > data.expiresAt;
  } catch {
    return true;
  }
}
