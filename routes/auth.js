const router = require("express").Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
router.post(
  "/register",
  [
    body("firstName", "at least 3 characters expected").isLength({ min: 3 }),
    body("lastName", "at least 3 characters expected").isLength({ min: 3 }),
    body("email", "enter a valid email").isEmail(),
    body("phone", "enter a valid mobile number").isMobilePhone(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry account with this email already exists" });
      }
      const phone = await User.findOne({ phone: req.body.phone });
      if (phone) {
        return res.status(400).json({
          error:
            "Account with this phone number exists try to register with different number",
        });
      }
      const salt = await bcrypt.genSalt(10);
      const secPassword = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        password: secPassword,
      });

      const authToken = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRETE,
      );

      res.json({ authToken });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "internal server error" });
    }
  }
);

//login

router.post(
  "/login",
  [
    body("email", "enter a valid email").isEmail(),
    body("password", "password should contain at least 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, password } = req.body;
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Enter valid credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "Enter valid credentials" });
      }

      const authToken = jwt.sign(
        { id: user._id, isAdmin: user.isAdmin },
        process.env.JWT_SECRETE,
      );

      res.json({ authToken });
    } catch (error) {
      res.status(500).json({ error: "internal server error" });
    }
  }
);

module.exports = router;
