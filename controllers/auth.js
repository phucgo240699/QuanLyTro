const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../model/users");

exports.login = async (req, res, next) => {
  // Check username is exist
  const user = await User.findOne({ where: { username: req.body.username } });
  if (user == null) {
    return res.json({ success: false, error: "Login failed" });
  }

  // Compare password of user above
  const isLogin = await bcrypt.compareSync(req.body.password, user.password);

  if (!isLogin) {
    return res.json({ success: false, error: "Login failed" });
  }

  // Generate token
  const token = jwt.sign(
    req.body.username,
    "abdccf7cf5a25fb44f8cba244d42123285ce9207fac4db009e7b22423a17133f8ebc554537b64de47c8668ab9566c2078d4239b7e57be722edc887a3ad2bc40f"
  );

  res.json({ success: isLogin, accessToken: token });
};

exports.register = async (req, res, next) => {
  if (req.body.password !== req.body.confirmPassword) {
    return res.json({
      success: false,
      error: "Confirm password and password must be the same"
    });
  }

  const users = await User.findAll();

  users.forEach(user => {
    if (req.body.username === user.username) {
      return res.json({
        success: false,
        error: "User is already exist"
      });
    }
  });
  const hashedPassword = await bcrypt.hashSync(req.body.password, 10);

  const newUser = await User.create({
    username: req.body.username,
    password: hashedPassword,
    isAdmin: req.body.isAdmin
  });

  res.json({
    success: true,
    data: newUser
  });
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    user.destroy();
    return res.json({ success: true, data: `User is deleted successfully` });
  } catch (error) {
    return res.json({ success: false, error: error });
  }
};
