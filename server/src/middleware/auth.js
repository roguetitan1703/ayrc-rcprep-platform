import { verifyJwt } from "../utils/jwt.js";
import { unauthorized, forbidden } from "../utils/http.js";
import { User } from "../models/User.js";
export async function authRequired(req, res, next) {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) throw unauthorized();
    const payload = verifyJwt(token);
    const user = await User.findById(payload.id);
    if (!user) {
      throw unauthorized();
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActiveDate = user.lastActiveDate;
    if (!lastActiveDate || lastActiveDate.toDateString() !== today.toDateString()) {
      await user.updateDailyStreak();
      console.log(`User ${user.email} streak updated to: ${user.dailyStreak}`);
    }
    req.user = user;

    next();
  } catch (e) {
    console.error("Auth Error:", e);
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
