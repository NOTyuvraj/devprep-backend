import { signupUser, loginUser } from "../services/auth.service.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });
  try {
    const token = await signupUser(name, email, password);
    return res.status(201).json({ token });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Signup failed" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "All fields required" });
  try {
    const token = await loginUser(email, password);
    return res.status(200).json({ token });
  } catch (err) {
    return res.status(400).json({ message: err.message || "Login failed" });
  }
};