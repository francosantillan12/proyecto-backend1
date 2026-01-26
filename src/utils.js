import bcrypt from "bcrypt";

export const createHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

export const isValidPassword = function (password, passwordHash) {
  return bcrypt.compareSync(password, passwordHash);
};


