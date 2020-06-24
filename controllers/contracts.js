const Contracts = require("../model/contracts");
const { isEmpty, pick } = require("lodash");
const { model } = require("../model/contracts");

exports.create = async (req, res, next) => {
  try {
    const customerId = req.body.customerId;
    const roomId = req.body.roomId;
    const dueDate = req.body.dueDate;
    const deposit = req.body.deposit;

    if (
      isEmpty(customerId) ||
      isEmpty(roomId) ||
      isEmpty(dueDate) ||
      !deposit
    ) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    const [oldContract, customersInRoom, room] = await Promise.all([
      Contracts.findOne({
        customerId,
        roomId,
        isDeleted: false
      }),
      Contracts.find({ roomId: roomId, isDeleted: false }),
      model("rooms").find({ _id: roomId, isDeleted: false })
    ]);

    // Check exist
    if (!isEmpty(oldContract)) {
      return res.status(409).json({
        success: false,
        error: "You have created a contract for this customer in this room"
      });
    }

    // Check full
    if (!isEmpty(customersInRoom) && !isEmpty(room)) {
      if (room.capacity == customersInRoom.length) {
        return res.status(406).json({
          success: false,
          error: "This room is full"
        });
      } else if (room.capacity < customersInRoom.length) {
        return res.status(406).json({
          success: false,
          error: "Amount of customer is lager than capacity in this room"
        });
      }
    }
    const newContract = await Contracts.create({
      ...pick(
        req.body,
        "customerId",
        "roomId",
        "dueDate",
        "deposit",
        "descriptions"
      )
    });

    if (isEmpty(newContract)) {
      return res.status(406).json({
        success: false,
        error: "Created failed"
      });
    }

    return res.status(201).json({
      success: true,
      data: newContract
    });
  } catch (error) {
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

    if (!page || !limit) {
      // Not paginate if request doesn't has one of these param: page, limit
      contracts = await Contracts.find({ isDeleted: false })
        .select("customerId roomId")
        .populate("customerId", "name")
        .populate("roomId", "name");
    } else {
      // Paginate
      contracts = await Contracts.find({ isDeleted: false })
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

exports.delete = async (req, res, next) => {
  try {
    const deleted = await Contracts.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false
      },
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
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
