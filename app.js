const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;

const User = require("./model/users");

app.use(bodyParser.json());

const authenticateToken = async (req, res, next) => {
  const username = jwt.verify(
    req.headers.authorization,
    "abdccf7cf5a25fb44f8cba244d42123285ce9207fac4db009e7b22423a17133f8ebc554537b64de47c8668ab9566c2078d4239b7e57be722edc887a3ad2bc40f",
    async function (err, decoded) {
      if (err) {
        return res.json({ success: false, error: err });
      }
      const user = await mongoose
        .model("users")
        .findOne({ username: decoded.username, isDeleted: false });
      if (user) {
        req.user = user;
      } else {
        return res.json({ success: false, error: "User not found" });
      }

      next();
    }
  );
};

app.use("/", require("./routes/auth"));
app.use("/facilities", authenticateToken, require("./routes/facilities"));
app.use("/rooms", authenticateToken, require("./routes/rooms"));

app.get("/", authenticateToken, (req, res) => {
  res.send("<h1> Hello world</h1>");
});
app.get("/users", async (req, res) => {
  try {
    const users = await mongoose
      .model("users")
      .find()
      .select("username password");
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
