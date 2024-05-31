require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");


const app = express();
app.use(express.json())



// Middleware configurations
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["POST", "PUT", "DELETE", "OPTIONS", "GET"],
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

app.set("trust proxy", 1);

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
      sameSite: "None", // For cross-domain cookies
    },
  })
);





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
