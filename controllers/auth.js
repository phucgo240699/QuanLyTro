const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isEmpty, pick } = require("lodash");
const { model, startSession } = require("mongoose");
const { commitTransactions, abortTransactions } = require("../services/transactions");

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
      { expiresIn: "1y" }
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
    let sessions = [];
    const username = req.body.username;
    const password = req.body.password;
    const isAdmin = req.body.isAdmin;
    const owner = req.body.owner;

    if (isEmpty(username) || isEmpty(password) || isAdmin === undefined) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    if (isAdmin !== true && isEmpty(owner)) {
      return res.status(406).json({
        success: false,
        error: "Account for customer must have owner property"
      });
    }

    const hashedPassword = await bcrypt.hashSync(req.body.password, 10);

    //Users.findOne({ username: req.body.username, isDeleted: false }),
    // if (alreadyUser) {
    //   return res.status(409).json({
    //     success: false,
    //     error: "Username is already exist"
    //   });
    // }

    req.body.password = hashedPassword;

    // Transactions
    let session = await startSession();
    session.startTransaction();
    sessions.push(session);

    let newUser;
    // Create
    if (isAdmin === true) {
      newUser = await Users.create(
        [
          {
            ...pick(req.body, "username", "password", "isAdmin")
          }
        ],
        { session: session }
      );
    } else {
      newUser = await Users.create(
        [
          {
            ...pick(req.body, "username", "password", "isAdmin", "owner")
          }
        ],
        { session: session }
      );
    }

    // Check create failed
    if (isEmpty(newUser)) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: "Created failed"
      });
    }

    const [old, customer] = await Promise.all([
      Users.find({
        ...pick(req.body, "username"),
        isDeleted: false
      }),
      model("customers").findOne({ _id: owner, isDeleted: false })
    ]);

    // Check exist
    if (old.length > 0) {
      await abortTransactions(sessions);
      return res.status(409).json({
        success: false,
        error: "This username is already exist"
      });
    }

    // Check owner is real
    if (isAdmin === false && isEmpty(customer)) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: "Owner is not exist"
      });
    }

    // Done
    await commitTransactions(sessions);

    return res.status(200).json({
      success: true,
      data: newUser[0]
    });
  } catch (error) {
    await abortTransactions(sessions);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.get = async (req, res, next) => {
  try {
    let query;
    query = { _id: req.params.id, isDeleted: false };

    const user = await Users.findOne(query);

    if (isEmpty(user)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const page = Number(req.query.page); // page index
    const limit = Number(req.query.limit); // limit docs per page

    let users;
    let query = {
      ...pick(req.body, "username", "isAdmin"),
      isDeleted: false
    };
    if (!page || !limit) {
      users = await Users.find(query).select("username password isAdmin");
    } else {
      users = await Users.find(query)
        .select("username password isAdmin")
        .skip(limit * (page - 1))
        .limit(limit);
    }

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
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

    return res.status(200).json({ success: true, data: user });
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
