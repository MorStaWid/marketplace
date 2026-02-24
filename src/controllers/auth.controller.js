const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findByEmail } = require("../models/user.model");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid email format. Please provide a valid email address.",
      });
    }

    const hash = await bcrypt.hash(password, 12);
    await createUser(username, email, hash, role || "customer");

    return res.status(201).json({
      status: 201,
      message: "Registration successful. Your account has been created.",
    });
  } catch (err) {
    console.error("Register error:", err);
    const status = err.code === "23505" ? 409 : 500;
    const message =
      err.code === "23505"
        ? "An account with this email or username already exists."
        : "Registration failed. Please try again later.";
    return res.status(status).json({ status, message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = (await findByEmail(email)).rows[0];
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: "Invalid email or password. Please check your credentials.",
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({
        status: 401,
        message: "Invalid email or password. Please check your credentials.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      status: 200,
      message: "Login successful.",
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      status: 500,
      message: "Login failed. Please try again later.",
    });
  }
};
