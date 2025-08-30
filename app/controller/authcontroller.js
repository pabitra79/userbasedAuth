const hassedpassword = require("../helper/hassedpassword");
const generationToken = require("../helper/jwttokencreate");
const User = require("../model/authschema");
const bcrypt = require("bcryptjs");

class AuthController {
  // Show register page
  async showRegisterPage(req, res) {
    res.render("auth/register", {
      title: "Register",
      error: null,
    });
  }

  // Show login page
  async showLoginPage(req, res) {
    res.render("auth/login", {
      title: "Login",
      error: null,
    });
  }
  // REGISTER
  async register(req, res) {
    try {
      const { name, email, phone, role, password } = req.body;

      // validate inputs
      if (!name || !email || !phone || !role || !password) {
        if (req.originalUrl.includes("/api/")) {
          return res.status(400).json({ message: "All fields are required" });
        }
        return res.render("auth/register", {
          title: "Register",
          error: "All fields are required",
        });
      }

      // check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        if (req.originalUrl.includes("/api/")) {
          return res.status(400).json({ message: "User already exists" });
        }
        return res.render("auth/register", {
          title: "Register",
          error: "User already exists",
        });
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

      // return res.status(201).json({
      if (req.originalUrl.includes("/api/")) {
        return res.status(201).json({
          message: "User registered successfully",
          user: savedUser,
          token,
        });
      }
      // For web requests, set cookie and redirect
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.redirect("/products");
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
        if (req.originalUrl.includes("/api/")) {
          return res.status(400).json({
            message: "Email and password are required",
          });
        }
        return res.render("auth/login", {
          title: "Login",
          error: "Email and password are required",
        });
      }

      // find user
      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        if (req.originalUrl.includes("/api/")) {
          return res.status(401).json({
            error: "Invalid email or password",
          });
        }
        return res.render("auth/login", {
          title: "Login",
          error: "Invalid email or password",
        });
      }

      // compare password
      const isMatch = await bcrypt.compare(password, existingUser.password);
      if (!isMatch) {
        if (req.originalUrl.includes("/api/")) {
          return res.status(401).json({
            error: "Invalid email or password",
          });
        }
        return res.render("auth/login", {
          title: "Login",
          error: "Invalid email or password",
        });
      }

      // generate token
      const token = generationToken(existingUser._id);

      // Check if it's API request
      if (req.originalUrl.includes("/api/")) {
        return res.status(200).json({
          message: "Login successful",
          user: existingUser,
          token,
        });
      }

      // For web requests, set cookie and redirect
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.redirect("/products");
    } catch (err) {
      console.error(err);
      if (req.originalUrl.includes("/api/")) {
        return res
          .status(500)
          .json({ error: "Something went wrong, try again!" });
      }
      return res.render("auth/login", {
        title: "Login",
        error: "Something went wrong, try again!",
      });
    }
  }

  async logout(req, res) {
    try {
      if (req.originalUrl.includes("/api/")) {
        res.json({ success: true, message: "Logout successful" });
      } else {
        res.cookie("token", "", {
          httpOnly: true,
          expires: new Date(0),
        });
        res.redirect("/auth/login");
      }
    } catch (error) {
      if (req.originalUrl.includes("/api/")) {
        res.status(500).json({ success: false, message: "Logout failed" });
      } else {
        res.redirect("/auth/login");
      }
    }
  }
}
module.exports = new AuthController();
