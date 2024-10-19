var express = require('express');
var router = express.Router();
const fs = require("fs");

let envirData = fs.readFileSync("envirData.json", "utf-8");
envirData = JSON.parse(envirData);
//watch file envir data
fs.watch("envirData.json", (event, filename) => {
  envirData = fs.readFileSync("envirData.json", "utf-8");
  envirData = JSON.parse(envirData);
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/chartdata", (req, res) => {
  if (envirData.length > 10) {
    return res.json(envirData.slice(envirData.length - 10));
  } else {
    return res.json(envirData);
  }
});

module.exports = router;
