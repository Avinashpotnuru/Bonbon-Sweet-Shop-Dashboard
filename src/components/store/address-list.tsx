"use client";

import { useRouter } from "next/navigation";
import { MapPin, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { SavedAddress } from "@/lib/customer-repo";
import {
  makeDefaultAddressAction,
  removeAddressAction,
} from "@/components/store/account-actions";

export function AddressList({ addresses }: { addresses: SavedAddress[] }) {
  const router = useRouter();

  async function handleRemove(id: string, label: string) {
    const res = await removeAddressAction(id);
    if (!res.ok) {
      toast.error("Could not remove address.");
      return;
    }
    toast.success(`Removed ${label}.`);
    router.refresh();
  }

  async function handleDefault(id: string, label: string) {
    const res = await makeDefaultAddressAction(id);
    if (!res.ok) {
      toast.error("Could not update address.");
      return;
    }
    toast.success(`${label} is now your default.`);
    router.refresh();
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="flex flex-col justify-between gap-4 rounded-2xl border bg-card p-5 shadow-card"
        >
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              <span className="inline-flex items-center gap-1.5 font-heading font-semibold">
                {address.label}
                {address.isDefault && (
                  <Star className="size-3.5 fill-amber-400 text-amber-400" aria-label="Default" />
                )}
              </span>
            </div>
            <address className="mt-2 text-sm leading-relaxed text-muted-foreground not-italic">
              <p>{address.line1}</p>
              {address.line2 && <p>{address.line2}</p>}
              <p>
                {address.city}{address.state ? `, ${address.state}` : ""} {address.postalCode}
              </p>
              {address.phone && <p className="mt-1">{address.phone}</p>}
            </address>
          </div>

          <div className="flex items-center gap-2">
            {!address.isDefault && (
              <button
                type="button"
                onClick={() => handleDefault(address.id, address.label)}
                className="text-sm font-medium text-primary underline-offset-2 hover:underline"
              >
                Make default
              </button>
            )}
            <button
              type="button"
              onClick={() => handleRemove(address.id, address.label)}
              className="ml-auto text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              <span className="sr-only">Remove {address.label}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
