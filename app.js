const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fileUpload = require("express-fileupload")

const app = express();
const port = process.env.PORT || 3000;

const User = require("./model/users");

const { authenticateToken } = require("./services/authenticateToken");
const { checkToken } = require("./services/checkToken");
const { urlencoded } = require("body-parser");

app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(fileUpload())
app.use(express.static("./public"))

app.get("/checkToken", checkToken);
app.use("/users", require("./routes/auth"));
app.use("/facilities", authenticateToken, require("./routes/facilities"));
app.use("/rooms", authenticateToken, require("./routes/rooms"));
app.use("/room-facilities", authenticateToken, require("./routes/roomFacilities"));
app.use("/customers", authenticateToken, require("./routes/customers"));
app.use("/contracts", authenticateToken, require("./routes/contracts"));
app.use("/invoices", authenticateToken, require("./routes/invoices"));
app.use("/params", authenticateToken, require("./routes/params"));
app.use("/reports", authenticateToken, require("./routes/reports"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
})
app.post("/uploads", async (req, res, next) => {
  
  if (req.files) {
    const file = req.files.file
    const fileName = file.name

    console.log({fileName})

    await file.mv(`${__dirname}/uploads/${fileName}`, function(err) {
      if (err) {
        res.status(406).send({err})
      }
      else {
        res.status(200).send("Uploaded Successfully")
      }
    })
  }
  else {
    res.status(406).send("Missing file")
  }

})

mongoose
  .connect(
    "mongodb+srv://phucly:6J0UaO4A9T3lE2Yj@quanlytro-kcaua.mongodb.net/shop?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(result => {
    console.log("Database connected successfully");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(error => {
    console.log(error.message);
  });
