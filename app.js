const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;

const User = require("./model/users");

app.use(bodyParser.json());

const { authenticateToken } = require("./services/authenticateToken");

app.use("/users", require("./routes/auth"));
app.use("/facilities", authenticateToken, require("./routes/facilities"));
app.use("/rooms", authenticateToken, require("./routes/rooms"));
app.use("/room-facilities", authenticateToken, require("./routes/roomFacilities"));
app.use("/customers", authenticateToken, require("./routes/customers"));
app.use("/contracts", authenticateToken, require("./routes/contracts"));
app.use("/invoices", authenticateToken, require("./routes/invoices"));

app.get("/", authenticateToken, (req, res) => {
  res.send("<h1> Hello world</h1>");
});
app.get("/users", async (req, res) => {
  try {
    const users = await mongoose.model("users").find().select("username password");
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.json({ success: false, error: error });
  }
});
mongoose
  .connect(
    "mongodb+srv://phucly:6J0UaO4A9T3lE2Yj@quanlytro-kcaua.mongodb.net/shop?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(result => {
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(error => {
    console.log(error.message);
  });
