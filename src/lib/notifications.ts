import "server-only";

import type { PlacedOrder } from "@/lib/placed-order";
import { formatMoneyExact } from "@/lib/format";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildOrderConfirmationHtml(order: PlacedOrder): string {
  const items = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #eee;">
            ${escapeHtml(item.name)}
            <span style="color:#888;">&times; ${item.quantity}</span>
          </td>
          <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">
            ${escapeHtml(formatMoneyExact(item.price * item.quantity))}
          </td>
        </tr>`,
    )
    .join("");

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#faf7f2;font-family:Georgia,serif;color:#2d1f12;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:24px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #eadfce;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#2d1f12;color:#faf7f2;padding:28px 32px;">
                <h1 style="margin:0;font-size:20px;letter-spacing:0.5px;">Bonbon Sweet Shop</h1>
                <p style="margin:6px 0 0;color:#d8b98a;font-size:13px;">Order confirmation</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <p style="font-size:15px;line-height:1.6;margin:0 0 8px;">Thank you, ${escapeHtml(order.customerName)}!</p>
                <p style="font-size:14px;line-height:1.6;margin:0 0 24px;color:#555;">
                  Your order <strong>${escapeHtml(order.orderNumber)}</strong> has been received.
                  Payment method: <strong>${escapeHtml(order.paymentMethod)}</strong>.
                </p>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
                  ${items}
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin-top:16px;">
                  <tr>
                    <td style="padding:4px 0;color:#555;">Subtotal</td>
                    <td style="padding:4px 0;text-align:right;">${escapeHtml(formatMoneyExact(order.amounts.subtotal))}</td>
                  </tr>
                  ${order.amounts.discount > 0 ? `<tr>
                    <td style="padding:4px 0;color:#555;">Discount</td>
                    <td style="padding:4px 0;text-align:right;color:#1d7f4f;">-${escapeHtml(formatMoneyExact(order.amounts.discount))}</td>
                  </tr>` : ""}
                  <tr>
                    <td style="padding:4px 0;color:#555;">Delivery</td>
                    <td style="padding:4px 0;text-align:right;">${order.amounts.delivery === 0 ? "Free" : escapeHtml(formatMoneyExact(order.amounts.delivery))}</td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0 4px;font-size:15px;font-weight:bold;">Total</td>
                    <td style="padding:10px 0 4px;text-align:right;font-size:15px;font-weight:bold;">${escapeHtml(formatMoneyExact(order.amounts.total))}</td>
                  </tr>
                </table>

                <p style="font-size:13px;line-height:1.6;color:#555;margin:24px 0 0;">
                  Delivering to:<br />
                  ${escapeHtml(order.address.line1)}${order.address.line2 ? `, ${escapeHtml(order.address.line2)}` : ""}<br />
                  ${escapeHtml(order.address.city)}${order.address.state ? `, ${escapeHtml(order.address.state)}` : ""} - ${escapeHtml(order.address.postalCode)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Sends an order-confirmation email via the Resend HTTP API. Requires
 * `RESEND_API_KEY` and `RESEND_FROM` in the environment — when either is
 * missing the email is skipped (never an error for the caller).
 */
export async function sendOrderConfirmationEmail(input: {
  to: string;
  order: PlacedOrder;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: `Order ${input.order.orderNumber} confirmed — Bonbon`,
        html: buildOrderConfirmationHtml(input.order),
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}