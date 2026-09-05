import "./store.css";

import { CartProvider } from "@/components/store/cart-context";
import { StoreFooter } from "@/components/store/store-footer";
import { StoreHeader } from "@/components/store/store-header";
import { getSession } from "@/lib/auth";

/**
 * Public customer-facing layout. Wraps all store pages with the shared header
 * and footer. Rendered inside the root layout (fonts + theme provider).
 *
 * `.store-scope` on the wrapper activates the customer-facing Sweet Shop
 * design system (see store.css), scoping its tokens so the Admin Dashboard
 * is completely unaffected.
 */
export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="store-scope flex min-h-svh flex-col">
      <CartProvider>
        <StoreHeader sessionRole={session?.role ?? null} />
        <main className="flex-1">{children}</main>
      </CartProvider>
      <StoreFooter />
    </div>
  );
}
