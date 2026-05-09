import express from "express";
import { signup, login } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import passport from "passport";
import jwt from "jsonwebtoken";

import { validateSignup, validateLogin } from "../validators/authValidator.js";

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",

  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),

  async (req, res) => {
    const token = jwt.sign(
      {
        userId: req.user._id,
        email: req.user.email,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      },
    );

    return res.redirect(
      `${process.env.CLIENT_URL}` + `/oauth-success?token=${token}`,
    );
  },
);

router.get("/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    user: req.user,
  });
});

export default router;
