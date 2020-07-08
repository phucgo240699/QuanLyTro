const Contracts = require("../model/contracts");
const { isEmpty, pick } = require("lodash");
const { model, startSession } = require("mongoose");
const moment = require("moment");
const { commitTransactions, abortTransactions } = require("../services/transactions");
const customerController = require("./customers");

exports.create = async (req, res, next) => {
  let sessions = [];
  try {
    const roomId = req.body.roomId;
    const identityCard = req.body.identityCard;
    const name = req.body.name;
    const dueDate = req.body.dueDate;
    const deposit = req.body.deposit;
    const entryDate = req.body.entryDate;

    if (
      isEmpty(roomId) ||
      isEmpty(identityCard) ||
      isEmpty(name) ||
      isEmpty(dueDate) ||
      isEmpty(entryDate) ||
      !deposit
    ) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    // Check format date
    if (
      !moment(dueDate, "YYYY-MM-DD", true).isValid() ||
      !moment(entryDate, "YYYY-MM-DD", true).isValid()
    ) {
      return res.status(406).json({
        success: false,
        error: "Incorrect formate date"
      });
    }

    // Check entryDate
    if (entryDate > dueDate) {
      return res.status(406).json({
        success: false,
        error: "Invalid time. entryDate must be less than dueDate"
      });
    }

    // Transactions
    let session = await startSession();
    session.startTransaction();
    sessions.push(session);

    // Create Host for Contract
    const { success, data, error } = await customerController.createHost({
      body: {
        ...pick(
          req.body,
          "name",
          "email",
          "phoneNumber",
          "birthday",
          "identityCard",
          "identityCardFront",
          "identityCardBack",
          "province",
          "district",
          "ward",
          "address",
          "roomId"
        )
      },
      session: session
    });

    if (success === false) {
      await abortTransactions(sessions);
      return res.status(500).json({
        success: false,
        error: error
      });
    }

    // Prepare data for Create Contract
    const newHostCustomer = data;
    req.body.customerId = newHostCustomer._id;

    req.body.latestInvoiceDate = entryDate;

    let newMonth;
    let newYear;

    if (entryDate.getMonth() >= 11) {
      newMonth = 0;
      newYear = entryDate.getFullYear() + 1;
    } else {
      newMonth = entryDate.getMonth() + 1;
      newYear = entryDate.getFullYear();
    }

    let latestInvoiceDate = req.body.latestInvoiceDate;
    latestInvoiceDate.setMonth(newMonth);
    latestInvoiceDate.setYear(newYear);

    req.body.latestInvoiceDate = latestInvoiceDate;

    // Create Contract
    const newContract = await Contracts.create(
      [
        {
          ...pick(
            req.body,
            "customerId",
            "roomId",
            "dueDate",
            "deposit",
            "entryDate",
            "latestInvoiceDate",
            "descriptions"
          )
        }
      ],
      { session: session }
    );

    if (isEmpty(newContract)) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: "Created failed"
      });
    }

    const [oldContracts, room] = await Promise.all([
      Contracts.find({
        $or: [{ roomId: roomId }, { customerId: req.body.customerId }],
        isDeleted: false
      }),
      model("rooms").findOne({ _id: roomId, isDeleted: false })
    ]);

    // Check exist
    if (oldContracts.length > 0) {
      await abortTransactions(sessions);
      return res.status(409).json({
        success: false,
        error: "You have created a contract for this customer in this room"
      });
    }

    // Check room is not empty
    if (room.slotStatus !== "empty") {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: "This room is much be empty"
      });
    }

    // Done
    await commitTransactions(sessions);

    return res.status(201).json({
      success: true,
      data: newContract[0]
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
    let contract = await Contracts.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (isEmpty(contract)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    return res.status(201).json({
      success: true,
      data: contract
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
    let contracts;
    let query = {
      ...pick(
        req.body,
        "customerId",
        "roomId",
        "dueDate",
        "deposit",
        "entryDate",
        "latestInvoiceDate"
      ),
      isDeleted: false
    };
    if (!page || !limit) {
      // Not paginate if request doesn't has one of these param: page, limit
      contracts = await Contracts.find(query)
        .select("customerId roomId")
        .populate("customerId", "name")
        .populate("roomId", "name");
    } else {
      // Paginate
      contracts = await Contracts.find(query)
        .select("customerId roomId")
        .populate("customerId", "name")
        .populate("roomId", "name")
        .skip(limit * (page - 1))
        .limit(limit);
    }

    return res.status(200).json({
      success: true,
      data: contracts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.update = async (req, res, next) => {
  try {
    const updated = await Contracts.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (isEmpty(updated)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    if (isEmpty(req.body.dueDate)) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    if (!moment(req.body.dueDate, "YYYY-MM-DD", true).isValid()) {
      return res.status(406).json({
        success: false,
        error: "Incorrect formate date"
      });
    }

    if (req.body.dueDate <= updated.dueDate) {
      return res.status(406).json({
        success: false,
        error: "New due date must be greater than old"
      });
    }

    updated.dueDate = req.body.dueDate;
    await updated.save();

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
    const deleted = await Contracts.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (isEmpty(deleted)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    deleted.isDeleted = true;
    await deleted.save();

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
