const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
app.get("/", (req, res, next) => {
  res.send("<h1>Welcome to Quan Ly Tro</h1>");
});

app.listen(port, () => {
  console.log("Server is running ...");
});
