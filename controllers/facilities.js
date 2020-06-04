const Facilities = require("../model/facilities");

exports.create = async (req, res, next) => {
  try {
    const facility = await Facilities.create({
      name: req.body.name,
      description: req.body.description
    });

    return res.json({
      success: true,
      data: facility
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error
    });
  }
};

exports.get = async (req, res, next) => {
  try {
    let facility = await Facilities.findOne({ _id: req.params.id, isDeleted: false });

    return res.json({
      success: true,
      data: facility
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error
    });
  }
};

exports.getAll = async (req, res, next) => {
  const page = req.params.page; // page index
  const total = req.params.total; // total docs per page

  try {
    let facilities;

    if (!page || !total) {
      // Not paginate if request doesn't has one of these param: page, total
      facilities = await Facilities.find({ isDeleted: false }).select("name");
    } else {
      // Paginate
      facilities = await Facilities.find({
        isDeleted: false,
        offset: total * (page - 1),
        limit: total
      }).select("name");
    }

    return res.json({
      success: true,
      data: facilities
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error
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
      error: error
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
      error: error
    });
  }
};
