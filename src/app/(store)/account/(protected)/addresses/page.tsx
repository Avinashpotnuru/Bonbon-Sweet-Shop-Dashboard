import { MapPin } from "lucide-react";

import { requireCustomerSession } from "@/lib/customer-auth";
import { listSavedAddresses } from "@/lib/customer-repo";
import { AddressForm } from "@/components/store/address-form";
import { AddressList } from "@/components/store/address-list";

export default async function AddressesPage() {
  const session = await requireCustomerSession();
  const addresses = await listSavedAddresses(session.userId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="store-eyebrow">Addresses</p>
        <h2 className="font-heading text-2xl font-bold">Saved addresses</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Saved delivery addresses are just a click away at checkout.
        </p>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-card px-6 py-14 text-center shadow-card">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60">
            <MapPin className="size-7 text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="font-heading text-lg font-bold">No addresses saved yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add a delivery address below so you can check out faster next time.
          </p>
        </div>
      ) : (
        <AddressList addresses={addresses} />
      )}

      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <h3 className="mb-4 font-heading text-lg font-bold">Add a new address</h3>
        <AddressForm />
      </div>
    </div>
  );
}
