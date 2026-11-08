// Usage: node scripts/pin-hash.mjs 1234  → prints a bcrypt hash for the SQL editor
import bcrypt from "bcryptjs";
const pin = process.argv[2];
if (!/^\d{4}$/.test(pin ?? "")) { console.error("Give a 4-digit PIN"); process.exit(1); }
console.log(await bcrypt.hash(pin, 10));
