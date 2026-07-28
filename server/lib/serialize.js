/** Normalize money fields for JSON (supports Float or Prisma Decimal). */
export function toNum(value) {
  if (value == null) return value;
  if (typeof value === "number") return value;
  if (typeof value?.toNumber === "function") return value.toNumber();
  return Number(value);
}

export function serializeMoney(obj) {
  if (!obj) return obj;
  const serialized = { ...obj };
  if (obj.balance != null) serialized.balance = toNum(obj.balance);
  if (obj.amount != null) serialized.amount = toNum(obj.amount);
  return serialized;
}

/** @deprecated use serializeMoney */
export const serializeDecimal = serializeMoney;
