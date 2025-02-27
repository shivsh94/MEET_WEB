import express from "express";
import { googleAuth, logout } from "../controller/userController.js";

const router = express.Router();

router.post("/google", googleAuth);
// router.get("/profile", getProfile);
router.post("/logout", logout); 
  

export default router;
