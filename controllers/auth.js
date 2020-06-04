const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Users = require("../model/users");

exports.login = async (req, res, next) => {
  // Check username is exist
  const user = await Users.findOne({ username: req.body.username }).select("password -_id");
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
    { username: req.body.username },
    "abdccf7cf5a25fb44f8cba244d42123285ce9207fac4db009e7b22423a17133f8ebc554537b64de47c8668ab9566c2078d4239b7e57be722edc887a3ad2bc40f",
    { expiresIn: "10y" }
  );

  res.json({ success: isLogin, accessToken: token });
};

exports.register = async (req, res, next) => {
  const [alreadyUser, hashedPassword] = await Promise.all([
    Users.findOne({ username: req.body.username, isDeleted: false }),
    bcrypt.hashSync(req.body.password, 10)
  ]);

  if (alreadyUser) {
    return res.json({
      success: false,
      error: "User is already exist"
    });
  }

  const newUser = await Users.create({
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
    const user = await Users.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });

    return res.json({ success: true, data: user._id });
  } catch (error) {
    return res.json({ success: false, error: error });
  }
};
