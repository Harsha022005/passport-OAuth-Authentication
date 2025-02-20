import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import pg from "pg";
import bcrypt from "bcrypt";
import passport from "passport";
import session from "express-session";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// PostgreSQL Connection
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

(async () => {
  try {
    await db.connect();
    console.log(`Connected to PostgreSQL`);
  } catch (err) {
    console.log(`Database not connected:`, err);
  }
})();

// Session Setup
app.use(
  session({
    secret: "passport_googleOAuth",
    resave: false,
    saveUninitialized: true,
  })
);

// Passport Initialization
app.use(passport.initialize());
app.use(passport.session());

// Local Strategy for Passport Authentication
passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, cb) => {
    try {
      const existingUser = await db.query(
        "SELECT * FROM users_auth WHERE email=$1",
        [email]
      );

      if (existingUser.rows.length === 0) {
        return cb(null, false, { message: "User not registered" });
      }

      const isMatch = await bcrypt.compare(
        password,
        existingUser.rows[0].password
      );

      if (!isMatch) {
        return cb(null, false, { message: "Passwords do not match" });
      }

      return cb(null, existingUser.rows[0], {
        message: "Logged in successfully",
      });
    } catch (err) {
      console.log(err);
      return cb(err);
    }
  })
);
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accestoken, refreshtoken, profile, cb) => {
      try {
        const existingUser = await db.query(
          "select * from users_auth where email=$1",
          [profile.emails[0].value]
        );
        if (existingUser.rows.length > 0) {
          return cb(null, existingUser.rows[0]);
        } else {
          const newUser = await db.query(
            "INSERT INTO users_auth (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [profile.displayName, profile.emails[0].value, ""]
          );
          return cb(null, newUser.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);

//  Serialize and Deserialize User
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query("SELECT * FROM users_auth WHERE id=$1", [id]);
    cb(null, result.rows[0]);
  } catch (err) {
    cb(err);
  }
});

// Signup Route
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const user = await db.query("SELECT * FROM users_auth WHERE email=$1", [
      email,
    ]);
    if (user.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users_auth (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
    );

    return res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error in registering" });
  }
});

// 🔹 Login Route
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).json({ message: "Logged in successfully" });
    });
  })(req, res, next);
});
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);
// Logout Route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    req.session.destroy();
    res.json({ message: "Logged out successfully" });
  });
});

//  Protected Route
app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  res.json({ message: "Welcome to Dashboard", user: req.user });
});
app.get("/", (req, res) => {
  res.send("Welcome to the Authentication API!");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
