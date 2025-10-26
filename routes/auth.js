const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");

// Register
router.post("/register", async (req, res) => {
    try {
        const customer = new Customer(req.body);
        await customer.save();
        res.status(201).json({ message: "Customer registered successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const customer = await Customer.findOne({ email });
        if (!customer) return res.status(400).json({ error: "User not found" });

        const isMatch = await customer.comparePassword(password);
        if (!isMatch) return res.status(400).json({ error: "Invalid password" });

        res.json({ message: "Login successful", customerId: customer._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
