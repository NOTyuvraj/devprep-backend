import { signupUser, loginUser } from "../services/auth.service.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const data = await signupUser(name, email, password);

    return res.status(201).json(data);
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Signup failed",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "All fields required",
      });
    }

    const data = await loginUser(email, password);

    return res.status(200).json(data);
  } catch (err) {
    return res.status(400).json({
      message: err.message || "Login failed",
    });
  }
};
