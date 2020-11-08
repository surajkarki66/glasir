import bcrypt from "bcryptjs";

async function comparePassword(plainText, actualPassword) {
  return await bcrypt.compare(plainText, actualPassword);
}
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

export { comparePassword, hashPassword };
