import isEmail from "validator/lib/isEmail";
import isByteLength from "validator/lib/isByteLength";
import { PASSWORD_REGEX, PASSWORD_MAX_BYTES } from "@repo/shared-validation";

export type ErrorKey =
  | "errors.nameRequired"
  | "errors.nameLength"
  | "errors.emailRequired"
  | "errors.emailInvalid"
  | "errors.passwordRule"
  | "errors.passwordRequired"
  | "errors.passwordTooLong"
  | "errors.invalidCredentials";

type Field = "name" | "email" | "password";

export function validateName(value: string): ErrorKey | undefined {
  const name = value.trim();

  if (!name) return "errors.nameRequired";
  if (name.length < 2 || name.length > 50) return "errors.nameLength";
}

export function validateEmail(value: string): ErrorKey | undefined {
  const email = value.trim();

  if (!email) return "errors.emailRequired";

  if (!isEmail(email)) {
    return "errors.emailInvalid";
  }
}

export function validatePassword(value: string): ErrorKey | undefined {
  if (!PASSWORD_REGEX.test(value)) return "errors.passwordRule";
  if (!isByteLength(value, { max: PASSWORD_MAX_BYTES })) {
    return "errors.passwordTooLong";
  }
}

export function validateLoginPassword(value: string): ErrorKey | undefined {
  if (!value) return "errors.passwordRequired";
}

const SERVER_RULES: { pattern: RegExp; field: Field; key: ErrorKey }[] = [
  {
    pattern: /^name must be (longer|shorter) than or equal to \d+ characters$/,
    field: "name",
    key: "errors.nameLength",
  },
  {
    pattern: /^email must be an email$/,
    field: "email",
    key: "errors.emailInvalid",
  },
  {
    pattern: /^password must be longer than or equal to \d+ characters$/,
    field: "password",
    key: "errors.passwordRule",
  },
  {
    pattern: /^Password must contain at least one letter and one number$/,
    field: "password",
    key: "errors.passwordRule",
  },
  {
    pattern: /^password should not be empty$/,
    field: "password",
    key: "errors.passwordRequired",
  },
  {
    pattern: /^Password is too long$/,
    field: "password",
    key: "errors.passwordTooLong",
  },
];

export function mapServerErrors(messages: unknown) {
  const list = [messages].flat().filter((m) => typeof m === "string");
  const fieldErrors: Partial<Record<Field, ErrorKey>> = {};
  let unexpected = list.length === 0;

  for (const msg of list) {
    const rule = SERVER_RULES.find((r) => r.pattern.test(msg));
    if (rule) fieldErrors[rule.field] = rule.key;
    else unexpected = true;
  }

  return { fieldErrors, unexpected };
}
