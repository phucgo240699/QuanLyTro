const Customers = require("../model/customers");
const { isEmpty, pick } = require("lodash");
const { model } = require("../model/customers");

exports.create = async (req, res, next) => {
  try {
    const identityCard = req.body.identityCard;
    const name = req.body.name;

    // Check not enough property
    if (isEmpty(identityCard) || isEmpty(name)) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    const old = await Customers.findOne({
      identityCard: identityCard,
      isDeleted: false
    });

    // Check exist
    if (!isEmpty(old)) {
      return res.status(404).json({
        success: false,
        error: "Identity card is already exist"
      });
    }

    const newCustomer = await Customers.create({
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
    });

    if (isEmpty(newCustomer)) {
      return res.status(406).json({
        success: false,
        error: "Created failed"
      });
    }

    return res.status(201).json({
      success: true,
      data: newCustomer
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
    let customers;

    if (!page || !limit) {
      // Not paginate if request doesn't has one of these param: page, limit
      customers = await Customers.find({ isDeleted: false }).select(
        "name identityCard phoneNumber birthday"
      );
    } else {
      // Paginate
      customers = await Customers.aggregate()
        .match({ isDeleted: false })
        .skip(limit * (page - 1))
        .limit(limit)
        .project("name identityCard phoneNumber birthday");
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
  try {
    const identityCard = req.body.identityCard;
    const name = req.body.name;

    // Check not enough property
    if (isEmpty(identityCard) || isEmpty(name)) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    const old = await Customers.findOne({
      identityCard: identityCard,
      isDeleted: false
    });

    // Check exist
    if (!isEmpty(old)) {
      return res.status(404).json({
        success: false,
        error: "Identity card is already exist"
      });
    }

    const updated = await Customers.findOneAndUpdate(
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

exports.delete = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (isEmpty(id)) {
      return res.status(406).json({
        success: false,
        error: "Not enough property"
      });
    }

    const [customer, user] = await Promise.all([
      Customers.findOne({
        _id: req.params.id,
        isDeleted: false
      }),
      model("users").findOne({ owner: req.params.id, isDeleted: false })
    ]);

    if (isEmpty(customer)) {
      return res.status(404).json({
        success: false,
        error: "Not Found"
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
