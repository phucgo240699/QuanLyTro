const Facilities = require("../model/facilities");
const { pick } = require("lodash");

exports.create = async (req, res, next) => {
  try {
    const facility = await Facilities.create({
      ...pick(req.body, "name", "description")
    });

    return res.json({
      success: true,
      data: facility
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message
    });
  }
};

exports.get = async (req, res, next) => {
  try {
    let facility = await Facilities.findOne({
      _id: req.params.id,
      isDeleted: false
    }).select("name description createdAt updatedAt");

    return res.json({
      success: true,
      data: facility
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message
    });
  }
};

exports.getAll = async (req, res, next) => {
  const page = Number(req.query.page); // page index
  const total = Number(req.query.total); // total docs per page

  try {
    let facilities;

    if (!page || !total) {
      // Not paginate if request doesn't has one of these param: page, total
      facilities = await Facilities.find({ isDeleted: false }).select("name");
    } else {
      // Paginate
      facilities = await Facilities.aggregate()
        .match({ isDeleted: false })
        .skip(total * (page - 1))
        .limit(total)
        .project("name description");
    }

    return res.json({
      success: true,
      data: facilities
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    const facility = await Facilities.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { name: req.body.name, description: req.body.description },
      { new: true }
    );

    return res.json({
      success: true,
      data: facility
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message
    });
  }
};

exports.delete = async (req, res, next) => {
  try {
    const facility = await Facilities.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );

    if (facility) {
      return res.json({
        success: true,
        data: facility._id
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      error: error.message
    });
  }
};
