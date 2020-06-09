const checkIsAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.json({ success: false, error: "Not allow" });
  } else {
    next();
  }
};

module.exports = { checkIsAdmin };
