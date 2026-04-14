const express = require("express");
const cors = require("cors");
const authRoutes = require("./auth.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Server läuft auf Port", PORT);
});
``