const hassedpassword = require("../helper/hassedpassword");
const generationToken = require("../helper/jwttokencreate");
const User = require("../model/authschema");
const bcrypt = require("bcryptjs");

class AuthController {
  // REGISTER
  async register(req, res) {
    try {
      const { name, email, phone, role, password } = req.body;

      // validate inputs
      if (!name || !email || !phone || !role || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // hash password
      const hashedPass = await hassedpassword(password);

      // create new user
      const newUser = new User({
        name,
        email,
        phone,
        role,
        password: hashedPass,
      });

      const savedUser = await newUser.save();

      // generate token
      const token = generationToken(savedUser._id);

      return res.status(201).json({
        message: "User registered successfully",
        user: savedUser,
        token,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // LOGIN
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "Email and password are required",
        });
      }

      // find user
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      // compare password
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        return res.status(401).json({
          error: "Invalid email or password",
        });
      }

      // generate token
      const token = generationToken(existingUser._id);

      return res.status(200).json({
        message: "Login successful",
        user: existingUser,
        token,
      });
    } catch (err) {
      console.error(err);
      return res
        .status(500)
        .json({ error: "Something went wrong, try again!" });
    }
  }
  async logout(req, res) {
    try {
      // Logout logic
      res.json({ success: true, message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Logout failed" });
    }
  }
}

module.exports = new AuthController();
