import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
  requestPasswordReset,
} from "../controllers/auth.controller.js";
import { devSeedAdmin } from "../controllers/auth.controller.js";
import { verifyPincode } from "../middleware/pincode.js";

const router = Router();

router.post("/register", verifyPincode, register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/dev/seed-admin", devSeedAdmin);
router.get("/dev/seed-admin", devSeedAdmin);
router.post('/request-reset', requestPasswordReset)
router.post('/reset-password', resetPassword)

export default router;
