const Reports = require("../model/reports");
const { pick, isEmpty } = require("lodash");

exports.create = async (req, res) => {
  try {
    const name = req.body.name;

    if (isEmpty(name)) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    const newReport = await Reports.create({
      ...pick(req.body, "name", "description"),
      userId: req.user._id
    });

    if (isEmpty(newReport)) {
      return res.status(406).json({
        success: false,
        error: "Created failed"
      });
    }

    return res.status(201).json({ success: true, data: newReport });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.get = async (req, res, next) => {
  try {
    let query;
    if (req.user.isAdmin === true) {
      query = { _id: req.params.id, isDeleted: false };
    } else {
      query = { _id: req.params.id, userId: req.user._id, isDeleted: false };
    }

    const report = await Reports.findOne(query);

    if (isEmpty(report)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    return res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const page = Number(req.query.page); // page index
    const limit = Number(req.query.limit); // limit docs per page

    let query;
    if (req.user.isAdmin === true) {
      query = { ...pick(req.body, "name", "status", "userId"), isDeleted: false };
    } else {
      query = { userId: req.user._id, isDeleted: false };
    }

    let reports;

    if (!page || !limit) {
      reports = await Reports.find(query).select("name status description");
    } else {
      reports = await Reports.find(query)
        .select("name status description")
        .skip(limit * (page - 1))
        .limit(limit);
    }

    return res.status(200).json({ success: true, data: reports });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const status = req.body.status;

    const updated = await Reports.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { status: status },
      { new: true }
    );

    if (isEmpty(updated)) {
      return res.status(406).json({
        success: false,
        error: "Created failed"
      });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

exports.delete = async (req, res, next) => {
  try {
    const deleted = await Reports.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (isEmpty(deleted)) {
      return res.status(406).json({
        success: false,
        error: "Deleted failed"
      });
    }

    return res.status(200).json({
      success: true,
      data: deleted
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
