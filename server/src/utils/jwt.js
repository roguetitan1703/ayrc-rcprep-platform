import jwt from "jsonwebtoken";

export function signJwt(payload, options = {}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign(payload, secret, { expiresIn: "7d", ...options });
}

export function verifyJwt(token) {
  const secret = process.env.JWT_SECRET;
  return jwt.verify(token, secret);
}
