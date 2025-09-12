import { Router } from "express";
import { authRequired } from "../middleware/auth.js";
import {
  getTodayRcs,
  getArchive,
  getRcById,
} from "../controllers/rc.controller.js";

const router = Router();
router.get("/today", authRequired, getTodayRcs);
router.get("/archive", authRequired, getArchive);
router.get("/:id", authRequired, getRcById);
export default router;
