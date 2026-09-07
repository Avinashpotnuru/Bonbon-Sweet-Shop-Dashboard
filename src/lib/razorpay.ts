import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export type RazorpayPublicConfig = {
  configured: boolean;
  keyId: string;
  currency: string;
};

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
};

export type RazorpayVerification = {
  orderId: string;
  paymentId: string;
  signature: string;
};

export function isRazorpayConfigured(): boolean {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  );
}

export function getRazorpayCheckoutConfig(): RazorpayPublicConfig {
  return {
    configured: isRazorpayConfigured(),
    keyId: process.env.RAZORPAY_KEY_ID ?? "",
    currency: process.env.RAZORPAY_CURRENCY || "INR",
  };
}

function authHeader(): string {
  const credentials = `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`;
  return `Basic ${Buffer.from(credentials, "utf8").toString("base64")}`;
}

export async function createRazorpayOrder(input: {
  amount: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amount,
      currency: getRazorpayCheckoutConfig().currency,
      receipt: input.receipt,
      notes: input.notes ?? {},
    }),
  });

  if (!response.ok) {
    let detail = "";
    try {
      const body = (await response.json()) as {
        error?: { description?: string };
      };
      detail = body.error?.description ?? "";
    } catch {
      // response body was not JSON — ignore
    }
    throw new Error(
      detail
        ? `Razorpay order creation failed: ${detail}`
        : `Razorpay order creation failed (${response.status})`,
    );
  }

  const order = (await response.json()) as {
    id: string;
    amount: number;
    currency: string;
  };

  return { id: order.id, amount: order.amount, currency: order.currency };
}

export async function verifyRazorpaySignature(
  verification: RazorpayVerification,
): Promise<boolean> {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const payload = `${verification.orderId}|${verification.paymentId}`;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const received = Buffer.from(verification.signature, "hex");

  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}