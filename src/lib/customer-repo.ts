import "server-only";

import { ObjectId } from "mongodb";

import { getDb, COLLECTIONS } from "@/lib/mongodb";

export type SavedAddress = {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
};

export type AccountSettings = {
  receivePromotions: boolean;
  orderUpdates: boolean;
};

export type CustomerProfileDoc = {
  userId: string;
  addresses: SavedAddress[];
  settings: AccountSettings;
  updatedAt: Date;
};

export type CustomerOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  itemCount: number;
  total: number;
  status: string;
  placedAt: string;
  paymentMethod?: string;
  coupon?: string | null;
  address?: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
  };
  notes?: string;
  amounts?: {
    subtotal: number;
    discount: number;
    delivery: number;
    total: number;
  };
  items?: Array<{
    productId: string;
    name: string;
    price: number;
    category: string;
    quantity: number;
  }>;
};

const DEFAULT_SETTINGS: AccountSettings = {
  receivePromotions: true,
  orderUpdates: true,
};

function serializeOrder(doc: Record<string, unknown>): CustomerOrder {
  return {
    id: doc._id ? String(doc._id) : "",
    orderNumber: String(doc.orderNumber ?? ""),
    customerName: String(doc.customerName ?? ""),
    customerEmail: String(doc.customerEmail ?? ""),
    itemCount: Number(doc.itemCount ?? 0),
    total: Number(doc.total ?? 0),
    status: String(doc.status ?? "Pending"),
    placedAt: (doc.placedAt as Date).toISOString(),
    paymentMethod: doc.paymentMethod as string | undefined,
    coupon: doc.coupon as string | null | undefined,
    address: doc.address as CustomerOrder["address"],
    notes: doc.notes as string | undefined,
    amounts: doc.amounts as CustomerOrder["amounts"],
    items: doc.items as CustomerOrder["items"],
  };
}

function ensureProfile(userId: string): Promise<CustomerProfileDoc> {
  return getDb()
    .collection<CustomerProfileDoc>(COLLECTIONS.customerProfiles)
    .findOneAndUpdate(
      { userId },
      {
        $setOnInsert: {
          userId,
          addresses: [],
          settings: DEFAULT_SETTINGS,
          updatedAt: new Date(),
        },
      },
      { upsert: true, returnDocument: "after" },
    )
    .then((res) =>
      res ?? {
        userId,
        addresses: [],
        settings: DEFAULT_SETTINGS,
        updatedAt: new Date(),
      },
    );
}

export async function listCustomerOrders(
  userId: string,
  email: string,
): Promise<CustomerOrder[]> {
  const docs = await getDb()
    .collection<Record<string, unknown>>(COLLECTIONS.orders)
    .find({
      $or: [
        { customerUserId: userId },
        { customerEmail: email.toLowerCase() },
      ],
    })
    .sort({ placedAt: -1 })
    .toArray();
  return docs.map(serializeOrder);
}

export async function getCustomerOrder(
  userId: string,
  email: string,
  orderNumber: string,
): Promise<CustomerOrder | null> {
  const doc = await getDb()
    .collection<Record<string, unknown>>(COLLECTIONS.orders)
    .findOne({
      orderNumber,
      $or: [{ customerUserId: userId }, { customerEmail: email.toLowerCase() }],
    });
  return doc ? serializeOrder(doc) : null;
}

export async function listSavedAddresses(userId: string): Promise<SavedAddress[]> {
  const profile = await ensureProfile(userId);
  return profile.addresses;
}

export async function addSavedAddress(
  userId: string,
  input: Omit<SavedAddress, "id">,
): Promise<SavedAddress> {
  const now = new Date();
  const profile = await ensureProfile(userId);
  const id = new ObjectId().toHexString();
  const isDefault = input.isDefault || profile.addresses.length === 0;
  const address: SavedAddress = { ...input, id, isDefault };
  const addresses =
    isDefault && profile.addresses.length > 0
      ? profile.addresses.map((a) => ({ ...a, isDefault: false }))
      : profile.addresses;
  addresses.push(address);
  await getDb()
    .collection<CustomerProfileDoc>(COLLECTIONS.customerProfiles)
    .updateOne(
      { userId },
      { $set: { addresses, updatedAt: now } },
    );
  return address;
}

export async function setDefaultAddress(
  userId: string,
  addressId: string,
): Promise<SavedAddress[]> {
  const now = new Date();
  const profile = await ensureProfile(userId);
  const addresses = profile.addresses.map((a) => ({
    ...a,
    isDefault: a.id === addressId,
  }));
  if (!addresses.some((a) => a.id === addressId)) return addresses;
  await getDb()
    .collection<CustomerProfileDoc>(COLLECTIONS.customerProfiles)
    .updateOne({ userId }, { $set: { addresses, updatedAt: now } });
  return addresses;
}

export async function deleteSavedAddress(
  userId: string,
  addressId: string,
): Promise<SavedAddress[]> {
  const now = new Date();
  const profile = await ensureProfile(userId);
  let addresses = profile.addresses.filter((a) => a.id !== addressId);
  if (addresses.some((a) => a.isDefault) === false && addresses.length > 0) {
    addresses = addresses.map((a, i) => ({ ...a, isDefault: i === 0 }));
  }
  await getDb()
    .collection<CustomerProfileDoc>(COLLECTIONS.customerProfiles)
    .updateOne({ userId }, { $set: { addresses, updatedAt: now } });
  return addresses;
}

export async function getAccountSettings(userId: string): Promise<AccountSettings> {
  const profile = await ensureProfile(userId);
  return { ...DEFAULT_SETTINGS, ...profile.settings };
}

export async function updateAccountSettings(
  userId: string,
  settings: Partial<AccountSettings>,
): Promise<AccountSettings> {
  const now = new Date();
  const profile = await ensureProfile(userId);
  const merged = { ...DEFAULT_SETTINGS, ...profile.settings, ...settings };
  await getDb()
    .collection<CustomerProfileDoc>(COLLECTIONS.customerProfiles)
    .updateOne({ userId }, { $set: { settings: merged, updatedAt: now } });
  return merged;
}
