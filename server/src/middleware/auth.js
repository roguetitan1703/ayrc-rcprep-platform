import { verifyJwt } from "../utils/jwt.js";
import { unauthorized, forbidden } from "../utils/http.js";

export function authRequired(req, res, next) {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) throw unauthorized();
    const payload = verifyJwt(token);
    req.user = payload;
    next();
  } catch (e) {
    next(unauthorized());
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return next(unauthorized());
    if (req.user.role !== role) return next(forbidden());
    next();
  };
}
