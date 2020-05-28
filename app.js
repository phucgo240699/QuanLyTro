const express = require("express");
const bodyParser = require("body-parser");
const sequelize = require("./utils/database");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 3000;

const User = require("./model/users");

app.use(bodyParser.json());

function authenticateToken(req, res, next) {
  const username = jwt.verify(
    req.headers.authorization,
    "abdccf7cf5a25fb44f8cba244d42123285ce9207fac4db009e7b22423a17133f8ebc554537b64de47c8668ab9566c2078d4239b7e57be722edc887a3ad2bc40f",
    function (err, decoded) {
      if (err) {
        return res.json({ success: false, error: err });
      }
      req.username = username;
      next();
    }
  );
}

app.use("/", require("./routes/auth"));
app.get("/", authenticateToken, (req, res) => {
  res.send("<h1> Hello world</h1>");
});
app.get("/users", async (req, res) => {
  try {
    const users = await User.findAll();
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.json({ success: false, error: error });
  }
});
sequelize
  .sync()
  .then(result => {
    console.log("Database is connected");
    app.listen(port, () => {
      console.log("Server is running ...");
    });
  })
  .catch(error => {
    console.log(error);
  });
