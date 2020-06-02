const Facilities = require("../model/facilities");

exports.create = async (req, res, next) => {
  try {
    const facility = await Facilities.create({ name: req.body, description: req.description });

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
    let facility = await Facilities.findOne({ id: req.params.id, isDeleted: false });

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
      facilities = await Facilities.findAll({ isDeleted: true });
    } else {
      // Paginate
      facilities = await Facilities.findAll({ isDeleted: true, offset: total * (page - 1), limit: total });
    }

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

exports.update = async (req, res, next) => {
  try {
    const facility = await Facilities.findByPk(req.params.id);

    facility.name = req.body.name;
    facility.description = req.body.description;

    facility.save();

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
    const facility = await Facilities.findByPk(req.params.id);

    facility.isDeleted = true;

    facility.save();

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
