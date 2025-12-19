import express from "express";
const router = express.Router();

router.post("/", (req, res) => {
    // Simply log or mock sending email
    console.log("Contact form submitted:", req.body);
    res.status(200).json({ message: "Message sent successfully" });
});

export default router;
