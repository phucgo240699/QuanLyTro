const Params = require("../model/params");
const { pick, isEmpty } = require("lodash");
const { model, startSession } = require("mongoose");
const { commitTransactions, abortTransactions } = require("../services/transactions");

exports.create = async (req, res, next) => {
  let sessions = [];
  try {
    const name = req.body.name;
    const value = req.body.value;

    if (isEmpty(name) || !value) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    // Transactions
    let session = await startSession();
    session.startTransaction();
    sessions.push(session);

    const newParam = await Params.create([{ name: name, value: value }], {
      session: session
    });

    if (isEmpty(newParam)) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: "Created failed"
      });
    }

    // Check exist
    const old = await Params.find({
      ...pick(req.body, "name"),
      isDeleted: false
    });

    if (old.length > 0) {
      await abortTransactions(sessions);
      return res.status(409).json({
        success: false,
        error: "This name is already exist"
      });
    }

    // Done
    await commitTransactions(sessions);

    return res.status(201).json({
      success: true,
      data: newParam[0]
    });
  } catch (error) {
    await abortTransactions(sessions);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    const updated = await Params.findOneAndUpdate(
      { _id: req.params.id },
      { ...pick(req.body, "value") },
      { new: true }
    );
    if (isEmpty(updated)) {
      return res.status(406).json({
        success: false,
        error: "Updated failed"
      });
    }

    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.get = async (req, res) => {
  try {
    const param = await Params.findOne({ _id: req.params.id, isDeleted: false });

    if (isEmpty(param)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: param
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const params = await Params.find({ isDeleted: false });

    return res.status(200).json({
      success: true,
      data: params
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.delete = async (req, res, next) => {
  try {
    const deleted = await Params.findOneAndUpdate({
      _id: req.params.id,
      isDeleted: false
    });

    if (isEmpty(deleted)) {
      return res.status(406).json({
        success: false,
        error: "Deleted failed"
      });
    }
    return res.status(200).json({
      success: true,
      data: deleted._id
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
