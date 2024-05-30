// index.js
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const MongoStore = require("connect-mongo");
const cors = require("cors");

const app = express();

// Middleware configurations
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["POST", "GET"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,UPDATE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
  );
  next();
});

app.use(
  session({
    name: "debai_test.sid",
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Set to true if using HTTPS
      httpOnly: true,
      maxAge: 3600000, // 1 hour
      sameSite: "None",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_ROOT_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Here you would find or create a user in your database
      const user = {
        id: new Date().getTime(),
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      };
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  console.log("serializeing",user)
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}`); // Redirect to your frontend
  }
);
app.get("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy();
    res.clearCookie("debai.sid");
    res.redirect(`${process.env.FRONTEND_URL}`);
  });
});
// New endpoint to get session user
app.get("/api/auth/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
