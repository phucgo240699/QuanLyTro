const Customers = require("../model/customers");
const { isEmpty, pick } = require("lodash");
const { model, startSession } = require("mongoose");
const { commitTransactions, abortTransactions } = require("../services/transactions");

exports.create = async (req, res, next) => {
  let sessions = [];
  try {
    const identityCard = req.body.identityCard;
    const name = req.body.name;
    const roomId = req.body.roomId;

    // Check not enough property
    if (isEmpty(identityCard) || isEmpty(name) || isEmpty(roomId)) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    // Transactions
    let session = await startSession();
    session.startTransaction();
    sessions.push(session);

    const newCustomer = await Customers.create(
      [
        {
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
        }
      ],
      { session: session }
    );

    if (isEmpty(newCustomer)) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: "Created failed"
      });
    }

    const [oldCustomers, room, customersInRoom, contractOfThisRoom] = await Promise.all([
      Customers.find({
        identityCard: identityCard,
        isDeleted: false
      }),
      model("rooms").findOne({
        _id: roomId,
        isDeleted: false
      }),
      Customers.find({ roomId: roomId, isDeleted: false }), // not include the newest customer you just create
      model("contracts").findOne({ roomId: roomId, isDeleted: false })
    ]);

    // Check exist
    if (oldCustomers.length > 0) {
      await abortTransactions(sessions);
      return res.status(409).json({
        success: false,
        error: "This identity card is already exist"
      });
    }

    // Check not create contract yet
    if (room.slotStatus == "empty" && isEmpty(contractOfThisRoom)) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: "You must create contract first"
      });
    }

    // Check room not found
    if (isEmpty(room)) {
      await abortTransactions(sessions);
      return res.status(404).json({
        success: false,
        error: "Room not found"
      });
    }

    if (Number(customersInRoom.length) + 1 < Number(room.capacity)) {
      room.slotStatus = "available";
    } else if (Number(customersInRoom.length) + 1 === Number(room.capacity)) {
      room.slotStatus = "full";
      await room.save();
    } else if (Number(customersInRoom.length) + 1 > Number(room.capacity)) {
      room.slotStatus = "full";
      await Promise.all([abortTransactions(sessions), room.save()]);
      return res.status(406).json({
        success: false,
        error: "Room had full"
      });
    }

    // Done
    await Promise.all([commitTransactions(sessions), room.save()]);

    return res.status(201).json({
      success: true,
      data: newCustomer[0]
    });
  } catch (error) {
    await abortTransactions(sessions);
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
    let customers;

    if (!page || !limit) {
      // Not paginate if request doesn't has one of these param: page, limit
      customers = await Customers.find({
        isDeleted: false
      })
        .select("name identityCard phoneNumber roomId")
        .populate("roomId", "name");
    } else {
      // Paginate
      customers = await Customers.aggregate()
        .find({ isDeleted: false })
        .select("name identityCard phoneNumber roomId")
        .populate("roomId", "name")
        .skip(limit * (page - 1))
        .limit(limit);
    }

    if (isEmpty(customers)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: customers
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
    let customer = await Customers.findOne({
      _id: req.params.id,
      isDeleted: false
    });

    if (isEmpty(customer)) {
      return res.status(404).json({
        success: false,
        error: "Not found"
      });
    }

    return res.status(201).json({
      success: true,
      data: customer
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
    // if (!isEmpty(req.body.identityCard)) {
    //   const [needToUpdate, olds] = await Promise.all([
    //     Customers.findOne({ _id: req.params.id, isDeleted: false }),
    //     Customers.find({
    //       identityCard: req.body.identityCard,
    //       isDeleted: false
    //     })
    //   ]);

    //   if (needToUpdate.identityCard !== req.body.identityCard) {
    //     if (olds.length >= 1) {
    //       return res.status(409).json({
    //         success: false,
    //         error: "This identityCard is already exist"
    //       });
    //     }
    //   }
    // }

    // Transactions
    let session = await startSession();
    session.startTransaction();
    sessions.push(session);

    const [beforeUpdated, updated] = await Promise.all([
      Customers.findOneAndUpdate({
        _id: req.params.id,
        isDeleted: false
      }),
      Customers.findOneAndUpdate(
        {
          _id: req.params.id,
          isDeleted: false
        },
        {
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
        { session, new: true }
      )
    ]);

    if (isEmpty(updated)) {
      await abortTransactions(sessions);
      return res.status(406).json({
        success: false,
        error: "Updated failed"
      });
    }

    // Check contract and new room when change roomId
    if (beforeUpdated.roomId !== updated.roomId) {
      const [room, contractOfThisCustomer] = await Promise.all([
        model("rooms").findOne({ roomId: updated.roomId, isDeleted: false }),
        model("contracts").findOne({ customerId: updated._id, isDeleted: false })
      ]);

      if (!isEmpty(contractOfThisCustomer)) {
        await abortTransactions(sessions);
        return res.status(406).json({
          success: false,
          error: "This customer is host, you must delete contract first"
        });
      }

      if (isEmpty(room)) {
        await abortTransactions(sessions);
        return res.status(404).json({
          success: false,
          error: "Room not found"
        });
      } else {
        await abortTransactions(sessions);
        if (room.slotStatus === "full") {
          return res.status(406).json({
            success: false,
            error: "This room is full now"
          });
        }
      }
    }

    // Done
    await commitTransactions(sessions);
    return res.status(200).json({
      success: true,
      data: updated
    });
  } catch (error) {
    await abortTransactions(sessions);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.delete = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (isEmpty(id)) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    const [customer, user, contractOfThisCustomer] = await Promise.all([
      Customers.findOne({
        _id: req.params.id,
        isDeleted: false
      }),
      model("users").findOne({ owner: req.params.id, isDeleted: false }),
      model("contracts").findOne({ customerId: req.params.id, isDeleted: false })
    ]);

    if (isEmpty(customer)) {
      return res.status(404).json({
        success: false,
        error: "Not Found"
      });
    }

    if (!isEmpty(contractOfThisCustomer)) {
      return res.status(406).json({
        success: false,
        error: "This customer is host, you must delete contract first"
      });
    }

    customer.isDeleted = true;
    user.isDeleted = true;

    await Promise.all([customer.save(), user.save()]);

    return res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
