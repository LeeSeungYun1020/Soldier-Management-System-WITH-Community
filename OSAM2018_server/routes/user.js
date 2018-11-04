var express = require('express');
var router = express.Router();
const db = require('../lib/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;

router.get('/', function(req, res, next) {
  res.send('ok');
});

router.get('/info', (req, res) => {
	db.query('select id, nickname, keycode from user where id=?', [req.id], (error, results, fields) => {
				if(error) return res.json({isSuccess: false, message: error});
				else if (!results[0]) return res.json({isSuccess: false, message: "키코드 값 조회에 실패했습니다."});
				else res.send(Object.assign(results[0], {isSuccess: true, message: "ok"}));
			});
});
// 사용자가 자신이 원하는 정보만 입력하여 변경할 수 있도록 구현됨.
router.post('/change', (req, res) => {
	var id = req.body.id; // 사용자 입력 값
	var pw = req.body.pw; // 사용자 입력 값
	var pw_re = req.body.pw_re; // 사용자 입력 값
	var nickname = req.body.nickname; // 사용자 입력 값
	var idPass = false;
	var nicknamePass = false;

	if(pw_re) // 사용자가 비밀번호를 입력한 경우
		if(pw != pw_re) return res.json({isSuccess: false, message: "비밀번호와 비밀번호 확인 값이 다릅니다."});
		else pw = bcrypt.hashSync(pw, saltRounds);
	db.query('select * from user where id=?', [req.id/*기존 id*/], (error, results, fields) => {
		if(error) return res.json({isSuccess: false, message: error});
		if(!results[0]) return res.json({isSuccess: false, message: "사용자 데이터를 조회할 수 없습니다."});
		if(!pw) pw = results[0].pw;
		if(!id) { // id 미입력 기존 값 그대로 사용
			id = req.id;
			idPass = true;
		}
		if(!nickname) { // nickname 미입력 기존 값 그대로 사용
			nickname = results[0].nickname;
			nicknamePass = true;
		} 
			
		checkIdReduplication(idPass, id, (error, isValidate) => {
			if (error) return ron({isSuccess: false, message: error});
			else if (!isValidate) return res.json({isSuccess: false, message: "아이디 중복 오류입니다."});
			else checkNicknameReduplication(nicknamePass, nickname, (error, isValidate) => {
				if (error) return res.json({isSuccess: false, message: error});
				else if (!isValidate) return res.json({isSuccess: false, message: "닉네임 중복 오류입니다."});
				else db.query('UPDATE user SET id = ?, pw = ?, nickname = ? WHERE id=?', [id, pw, nickname, req.id], (error, checks, fields) => {
					if(error) return res.json({isSuccess: false, message: error});
					else if(results[0].nickname != nickname)
						db.query('UPD0ATE article SET creator=? WHERE creator=?', [nickname, results[0].nickname], (error, results, fields) => {
							if(error) return res.json({isSuccess: true, sync: false, token: jwt.sign({id: id}, '2018osam!@#'), message: "사용자 정보는 변경되었지만 게시판 동기화에 실패하였습니다."});
							else return res.json({isSuccess: true, sync: true, token: jwt.sign({id: id}, '2018osam!@#'), message: "사용자 정보가 변경되었습니다."});
						});
					else return res.json({isSuccess: true, sync: true, token: jwt.sign({id: id}, '2018osam!@#'), message: "사용자 정보가 변경되었습니다."});
				});
			});
		});
	});
});

function checkIdReduplication(pass, id, callback){
	if (psss){
		return callback(null, true);
	} else
		db.query('select * from user where id=?', [id], (error, results, fields) => {
		
			if(error)
				return callback(error, null);
			else{
				if(results[0]) return callback("이미 사용중인 i 입니다.", null);
				else return callback(null, true);
			}
		});
}

function checkNicknameReduplication(pass, nickname, callback){
	if (psss){
		return callback(null, true);
	} else
		db.query('select * from user where nickname=?', [nickname], (error, results, fields) => {

			if(error)
				return callback(error, null);
			else{
				if(results[0]) callback("이미 사용중인 닉네임 입니다.", null);
				else callback(null, true);
			}
		});
}

module.exports = router;
