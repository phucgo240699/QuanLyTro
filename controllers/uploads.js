exports.upload = (req, res, next) => {
  
    if (req.files) {
      const file = req.files.image
      // file.mv("../uploads", file.name, function({err}) {
      //   if (err) {
      //     res.status(406).send({err})
      //   }
      //   else {
      //     res.status(200).send("Uploaded Successfully")
      //   }
      // })
      res.send(file.name)
    }
    else {
      res.status(406).send("Missing file")
    }
  
}