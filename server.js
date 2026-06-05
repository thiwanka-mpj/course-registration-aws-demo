require("dotenv").config();
const express = require("express");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const STATIC_DIR = process.env.STATIC_DIR || path.resolve(__dirname, "client");

app.use(express.static(STATIC_DIR));
app.use(express.json());

// --- Page routes ---
app.get("/", (req, res) =>
  res.sendFile(path.resolve(STATIC_DIR, "index.html"))
);
app.get("/success", (req, res) =>
  res.sendFile(path.resolve(STATIC_DIR, "success.html"))
);
app.get("/cancel", (req, res) =>
  res.sendFile(path.resolve(STATIC_DIR, "cancel.html"))
);

// Individual course pages
["course1", "course2", "course3", "course4", "course5", "course6"].forEach(
  (course) => {
    app.get(`/courses/${course}`, (req, res) =>
      res.sendFile(path.resolve(STATIC_DIR, `courses/${course}.html`))
    );
  }
);

// --- Stripe Checkout ---
app.post("/create-checkout-session/:pid", async (req, res) => {
  const priceId = req.params.pid;
  const domain = process.env.DOMAIN || `http://localhost:${process.env.PORT || 3000}`;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/cancel`,
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- Session info endpoint ---
app.get("/session-status", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);
    res.json({
      status: session.payment_status,
      customer_email: session.customer_details?.email,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🎓 Course Registration Server running on http://localhost:${PORT}`)
);
