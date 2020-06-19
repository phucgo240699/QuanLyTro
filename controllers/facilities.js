const Facilities = require("../model/facilities");
const { pick, isEmpty } = require("lodash");
const { model, startSession } = require("mongoose");
const { findOne, update } = require("../model/facilities");

const commitTransactions = async sessions => {
  return await Promise.all(
    sessions.map(async session => {
      await session.commitTransaction();
      await session.endSession();
    })
  );
};

const abortTransactions = async sessions => {
  return await Promise.all(
    sessions.map(async session => {
      await session.abortTransaction();
      await session.endSession();
    })
  );
};

exports.create = async (req, res, next) => {
  try {
    // Check exist
    const oldFacility = await model("facilities").findOne({
      name: req.body.name,
      isDeleted: false
    });
    if (oldFacility) {
      return res.json({
        success: false,
        error: "You have created this facility"
      });
    }

    const facility = await model("facilities").create({
      ...pick(req.body, "name", "price", "quantity", "description")
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
    }).select("name price quantity description createdAt updatedAt");

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
  const limit = Number(req.query.limit); // limit docs per page

  try {
    let facilities;

    if (!page || !limit) {
      // Not paginate if request doesn't has one of these param: page, limit
      facilities = await Facilities.find({ isDeleted: false }).select(
        "name price quantity"
      );
    } else {
      // Paginate
      facilities = await Facilities.aggregate()
        .match({ isDeleted: false })
        .skip(limit * (page - 1))
        .limit(limit)
        .project("name price quantity");
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
    const updated = await Facilities.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false
      },
      {
        ...pick(req.body, "name", "price", "quantity", "description")
      },
      { new: true }
    );

    return res.json({
      success: true,
      data: updated
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
    if (isEmpty(req.body.name)) {
      return res.json({
        success: false,
        error: "Not enough property"
      });
    }

    const [facilityNeedToDelete, deleted] = await Promise.all([
      Facilities.findOne({
        _id: req.params.id,
        isDeleted: false
      }),
      Facilities.findOne({ name: req.body.name, isDeleted: true })
    ]);

    if (isEmpty(facilityNeedToDelete)) {
      return res.json({
        success: false,
        error: "Not found"
      });
    }

    if (isEmpty(deleted)) {
      facilityNeedToDelete.isDeleted = true;
      await facilityNeedToDelete.save();
    } else {
      await this.adjustQuantity({
        quantity: facilityNeedToDelete.quantity,
        facilityId: deleted._id,
        isDeleted: true
      });
      await facilityNeedToDelete.remove();
    }

    return res.json({
      success: true,
      data: facilityNeedToDelete._id
    });
  } catch (error) {
    return res.json({
      success: false,
      error: error.message
    });
  }
};

exports.adjustQuantity = async ({
  quantity,
  facilityId,
  isDeleted = false
}) => {
  let sessions = [];
  try {
    let session = await startSession(); // Start Session
    session.startTransaction(); // Start transaction
    sessions.push(session); // add session to sessions(list of session)

    const result = await model("facilities").findOneAndUpdate(
      { _id: facilityId, isDeleted: isDeleted },
      { $inc: { quantity: quantity } },
      { session, new: true }
    );

    if (result.quantity < 0) {
      await abortTransactions(sessions);
      return {
        success: false,
        error: "Out of stock"
      };
    }

    await commitTransactions(sessions);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
