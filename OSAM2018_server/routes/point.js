const express = require('express');
const router = express.Router();
const db = require('../lib/db');

router.route('/')
	.get((req, res) => {
		db.query('select * from point where id=?', [req.id], (error, results, fields) => {
				if(error) return res.json({isSuccess: false, message: error});
				else if (!results[0]) return res.json({isSuccess: false, message: "상벌점 데이터 조회에 실패하였습니다."});
				else res.json(results.concat({isSuccess: true, message: "ok"}));
			});
})
	.post((req, res) => {
		var id = req.id;
		var plus = req.body.plus;
		var minus = req.body.minus;
		var switch_standard = req.body.switch_standard;
		db.query('INSERT INTO point (id, plus, minus, switch_standard) VALUES(?, ?, ?, ?)', [id, plus, minus, switch_standard], (error, results, fields) => {
			if(error) return res.json({isSuccess: false, message: error});
			else return res.json({isSuccess: true, message: "상벌점이 수정되었습니다."});
		});
});

module.exports = router;