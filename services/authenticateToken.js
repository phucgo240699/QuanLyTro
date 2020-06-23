const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

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

module.exports = { authenticateToken };
