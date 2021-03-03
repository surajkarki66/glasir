import bcrypt from "bcryptjs";

const comparePassword = async (plainText, actualPassword) => {
  return await bcrypt.compare(plainText, actualPassword);
};
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

export { comparePassword, hashPassword, escapeRegex };
