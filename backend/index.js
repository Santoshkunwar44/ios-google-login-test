require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const cors = require("cors");

const app = express();
app.use(express.json())



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

// Set 'trust proxy' if behind a proxy
app.set("trust proxy", 1); // Trust first proxy

app.use(
  session({
    name: "debai_test.sid",
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Set to true for HTTPS
      httpOnly: true,
      maxAge: 3600000, // 1 hour
      sameSite: "none", // For cross-domain cookies
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
  console.log("serializing", user);
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

app.post("/api/auth/logout", (req, res) => {
  // req.logout((err) => {
  //   if (err) return next(err);
  //   req.session.destroy();
  //   res.clearCookie("debai_test.sid");
  //   res.redirect(`${process.env.FRONTEND_URL}`);
  // });

     req.session.destroy((err) => {
       if (err) {
         throw Error(err);
       }
       res.clearCookie("debai_test.sid");
       res
         .status(200)
         .json({ message: "successfully logged out", success: true });
     });
});


// New endpoint to get session user
app.get("/api/auth/user", (req, res) => {
  const sessionUser = req.session?.user;
  console.log("session user ",sessionUser);
  if (sessionUser) {
    res.json({ user: req.session.user });
  } else {
    res.status(403).json({message:"No user in session"});
  }
});

app.post("/api/auth/session-user", (req, res) => {
  req.session.user = req.body;
  console.log("setting session user ", req.session?.user ,req.body);
  res.json({ user: req.session.user });
});

app.listen(8000, () => {
  console.log("Server is running on http://localhost:8000");
});
