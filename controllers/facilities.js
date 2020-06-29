const Facilities = require("../model/facilities");
const { pick, isEmpty } = require("lodash");
const { model, startSession } = require("mongoose");
const { commitTransactions, abortTransactions } = require("../services/transactions");

exports.create = async (req, res, next) => {
  let sessions = [];
  try {
    const name = req.body.name;
    const price = req.body.price;
    const quantity = req.body.quantity;

    if (isEmpty(name) || !price || !quantity) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    // Transactions
    let session = await startSession();
    session.startTransaction();
    sessions.push(session);

    // Create
    const facility = await model("facilities").create(
      [
        {
          ...pick(req.body, "name", "price", "quantity", "description")
        }
      ],
      { session: session }
    );

    if (isEmpty(facility)) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: "Created failed"
      });
    }

    // Check exist
    const old = await Facilities.find({
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
      data: facility
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
    let facility = await Facilities.findOne({
      _id: req.params.id,
      isDeleted: false
    }).select("name price quantity description createdAt updatedAt");

    if (isEmpty(facility)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    return res.status(201).json({
      success: true,
      data: facility
    });
  } catch (error) {
    return res.status(500).json({
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

    return res.status(200).json({
      success: true,
      data: facilities
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.update = async (req, res, next) => {
  let sessions = [];
  try {
    // Transactions
    let session = await startSession();
    session.startTransaction();
    sessions.push(session);

    const updated = await Facilities.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false
      },
      {
        ...pick(req.body, "name", "price", "quantity", "description")
      },
      { session, new: true }
    );

    if (isEmpty(updated)) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: "Updated failed"
      });
    }

    // Check exist
    if (req.body.name) {
      let isChangeName = true;
      const [facilities, beforeUpdated] = await Promise.all([
        Facilities.find({ name: req.body.name, isDeleted: false }),
        Facilities.findOne({
          _id: req.params.id,
          isDeleted: false
        })
      ]);

      if (beforeUpdated.name === updated.name) {
        isChangeName = false;
      }

      if (facilities.length > 0 && isChangeName) {
        await abortTransactions(sessions);
        return res.status(409).json({
          success: false,
          error: "This name is already exist"
        });
      }
    }

    // Done
    await commitTransactions(sessions);

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

exports.delete = async (req, res, next) => {
  try {
    const deleted = await Facilities.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false
      },
      {
        isDeleted: true
      },
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
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.adjustQuantity = async ({ quantity, facilityId, isDeleted = false, session }) => {
  //let sessions = [];
  try {
    // let session = await startSession(); // Start Session
    // session.startTransaction(); // Start transaction
    // sessions.push(session); // add session to sessions(list of session)

    const result = await model("facilities").findOneAndUpdate(
      { _id: facilityId, isDeleted: isDeleted },
      { $inc: { quantity: quantity } },
      { session, new: true }
    );

    if (result.quantity < 0) {
      return {
        success: false,
        error: "Out of stock"
      };
    }

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
