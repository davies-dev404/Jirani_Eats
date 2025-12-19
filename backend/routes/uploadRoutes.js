import express from "express";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", upload.single("file"), (req, res) => {
  res.send(`/${req.file.path.replace(/\\/g, "/")}`);
});

export default router;
