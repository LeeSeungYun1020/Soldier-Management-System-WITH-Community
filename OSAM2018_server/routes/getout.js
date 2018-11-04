const express = require('express');
const router = express.Router();
const db = require('../lib/db');

router.route('/')
	.get((req, res) => {
		db.query('select * from getout where id=?', [req.id], (error, results, fields) => {
				if(error) return res.json({isSuccess: false, message: error});
				else if (!results[0]) return res.json({isSuccess: false, message: "출타 기간 데이터 조회에 실패하였습니다."});
				else res.json(results.concat({isSuccess: true, message: "ok"}));
			});
})
	.post((req, res) => {
		var id = req.id;
		
		var type = req.body.type;
		var depart = req.body.depart;
		var arrive = req.body.arrive;
		db.query('INSERT INTO getout (id, type, depart, arrive) VALUES(?, ?, ?, ?)', [id, type, depart, arrive], (error, results, fields) => {
			if(error) return res.json({isSuccess: false, message: error});
			else return res.json({isSuccess: true, message: "출타 기간이 등록되었습니다."});
		});
});

module.exports = router;