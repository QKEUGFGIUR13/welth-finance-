/**
 * Server-side validation.
 *
 * The client validates with Zod for instant feedback, but a request can also
 * reach the API from Postman/curl, so every write endpoint re-validates here.
 */

const TRANSACTION_TYPES = ["INCOME", "EXPENSE"];
const RECURRING_INTERVALS = ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"];
const ACCOUNT_TYPES = ["CURRENT", "SAVINGS"];

/** Turns "12.50" or 12.5 into a finite number, or null when unusable. */
function parseAmount(value) {
  const num = typeof value === "string" ? Number(value) : value;
  return typeof num === "number" && Number.isFinite(num) ? num : null;
}

export function validateTransaction(body) {
  const errors = {};
  const data = {};

  if (!TRANSACTION_TYPES.includes(body.type)) {
    errors.type = "Type must be INCOME or EXPENSE";
  } else {
    data.type = body.type;
  }

  const amount = parseAmount(body.amount);
  if (amount === null) {
    errors.amount = "Amount must be a number";
  } else if (amount <= 0) {
    errors.amount = "Amount must be greater than 0";
  } else {
    data.amount = amount;
  }

  const date = body.date ? new Date(body.date) : null;
  if (!date || Number.isNaN(date.getTime())) {
    errors.date = "A valid date is required";
  } else {
    data.date = date;
  }

  if (!body.category || typeof body.category !== "string") {
    errors.category = "Category is required";
  } else {
    data.category = body.category;
  }

  if (!body.accountId || typeof body.accountId !== "string") {
    errors.accountId = "Account is required";
  } else {
    data.accountId = body.accountId;
  }

  if (body.description != null && typeof body.description !== "string") {
    errors.description = "Description must be text";
  } else if (body.description && body.description.length > 200) {
    errors.description = "Description must be under 200 characters";
  } else {
    data.description = body.description || null;
  }

  data.isRecurring = Boolean(body.isRecurring);
  if (data.isRecurring) {
    if (!RECURRING_INTERVALS.includes(body.recurringInterval)) {
      errors.recurringInterval =
        "Recurring transactions need a valid interval";
    } else {
      data.recurringInterval = body.recurringInterval;
    }
  } else {
    data.recurringInterval = null;
  }

  return { valid: Object.keys(errors).length === 0, errors, data };
}

export function validateAccount(body) {
  const errors = {};
  const data = {};

  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    errors.name = "Name is required";
  } else if (body.name.length > 50) {
    errors.name = "Name must be under 50 characters";
  } else {
    data.name = body.name.trim();
  }

  if (!ACCOUNT_TYPES.includes(body.type)) {
    errors.type = "Type must be CURRENT or SAVINGS";
  } else {
    data.type = body.type;
  }

  const balance = parseAmount(body.balance);
  if (balance === null) {
    errors.balance = "Initial balance must be a number";
  } else {
    data.balance = balance;
  }

  data.isDefault = Boolean(body.isDefault);

  return { valid: Object.keys(errors).length === 0, errors, data };
}

export function validateBudget(body) {
  const errors = {};
  const amount = parseAmount(body.amount);

  if (amount === null) {
    errors.amount = "Budget amount must be a number";
  } else if (amount <= 0) {
    errors.amount = "Budget amount must be greater than 0";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    data: { amount },
  };
}

/** Sends a 400 with field-level errors so the UI can show them inline. */
export function sendValidationError(res, errors) {
  return res.status(400).json({
    success: false,
    error: Object.values(errors)[0],
    errors,
  });
}
