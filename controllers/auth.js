const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isEmpty, pick } = require("lodash");

const Users = require("../model/users");

exports.login = async (req, res, next) => {
  try {
    // Check username is exist
    const user = await Users.findOne({ username: req.body.username }).select(
      "password -_id"
    );
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

    return res.status(200).json({ success: isLogin, accessToken: token });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.register = async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const isAdmin = req.body.isAdmin;
    const owner = req.body.owner;

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
    if (isEmpty(username) || isEmpty(password) || isAdmin === undefined) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    if (isAdmin === false && isEmpty(req.body.owner)) {
      return res.status(406).json({
        success: false,
        error: "Account for customer must have owner property"
      });
    }

    const newUser = await Users.create({
      ...pick(req.body, "username", "password", "isAdmin", "owner")
    });

    return res.status(200).json({
      success: true,
      data: newUser
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await Users.findOne({ _id: req.params.id, isDeleted: false });

    if (isEmpty(user)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }
    user.isDeleted = true;
    await user.save();

    return res.status(200).json({ success: true, data: user._id });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await Users.findOne({ _id: req.params.id, isDeleted: false });

    if (isEmpty(user)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    let hashedPassword;
    if (!isEmpty(req.body.password)) {
      hashedPassword = await bcrypt.hashSync(req.body.password, 10);
      user.password = hashedPassword;
    }
    if (!isEmpty(req.body.username)) {
      user.username = req.body.username;
    }

    await user.save();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
