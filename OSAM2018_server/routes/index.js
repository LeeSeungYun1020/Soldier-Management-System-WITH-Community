var express = require('express');
var router = express.Router();
const db = require('../lib/db');


/* GET home page. */
router.get('/', function(req, res) {
	res.send("connect");
});

module.exports = router;
