import bcrypt from "bcryptjs";

export async function comparePassword(plainText, actualPassword) {
  return await bcrypt.compare(plainText, actualPassword);
}
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}
