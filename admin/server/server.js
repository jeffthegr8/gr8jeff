require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 5000;
const publicDirectory = path.join(__dirname, "..", "public");

app.use(cors());
app.use(express.json());

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables. Check your .env file.");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    message: "GR8JEFF Admin API is running"
  });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

   const { data: admin, error: adminError } = await supabase
  .from("admins")
  .select("id")
  .eq("id", data.user.id)
  .maybeSingle();
    if (adminError || !admin) {
      await supabase.auth.signOut();
      return res.status(403).json({
        error: "This account is not authorized as an administrator"
      });
    }

    res.json({
      message: "Login successful",
      user: {
        id: data.user.id,
        email: data.user.email
      },
      session: data.session
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      error: "Internal server error"
    });
  }
});

app.use(express.static(publicDirectory));

app.listen(PORT, () => {
  console.log(`GR8JEFF Admin API running at http://localhost:${PORT}`);
});