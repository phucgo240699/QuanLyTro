const jwt = require("jsonwebtoken");

const checkToken = async (req, res, next) => {
  const username = jwt.verify(
    req.headers.authorization,
    process.env.SECRET_KEY.toString(),
    async function (err, decoded) {
      if (err) {
        return res.json({ success: false, error: err.message });
      }

      res.json({
        success: true
      });
    }
  );
};

module.exports = { checkToken };
