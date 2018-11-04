require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const saltRounds = 10;

router.get('/', (req, res) => {
	res.send(jwt.sign({id: 'lee1020'}, '2018osam!@#'));
});

router.post('/signup', (req, res) => {//아이디 패스워드 키코드 닉네임 입력됨.
	/*
		TODO: 나중에 보안 강화를 위해 GET 방식에서 POST 방식으로 변경하고, id, pw 를 바당오는 방식을 바꿔야함.
	*/
	var id = req.body.id;
	var pw = req.body.pw;
	var pw_re = req.body.pw_re;
	if(pw != pw_re) return res.json({isSuccess: false, message: "비밀번호와 비밀번호 확인 값이 다릅니다."});
	var nickname =req.body.nickname;
	var keycode = req.body.keycode;
	checkKeycode(keycode, (error, usertype) => { // keycode 확인
		if(error) return res.json({isSuccess: false, message: error});
		if(usertype === 0 || usertype === 1)
			checkIdReduplication(id, (error, isValidate) => {// ID 중복 확인
				if(error)
					return res.json({isSuccess: false, message: error});
				else if(!isValidate)
					return res.json({isSuccess: false, message: "이미 사용중인 ID 입니다."});
				else
					checkNicknameReduplication(nickname, (error, isValidate) => {
						if(error)
							return res.json({isSuccess: false, message: error});
						else if(!isValidate)
							return res.json({isSuccess: false, message: "이미 사용중인 닉네임 입니다."});
						else
						// TODO: bcrypt 라이브러리를 이용한 패스워드 hash 암호화를 RSA 알고리즘으로 대체할 필요성이 있음.
						bcrypt.hash(pw, saltRounds, function(err, hash) {
							if(err) return res.json({isSuccess: false, message: err});
							else db.query('INSERT INTO user (id, pw, keycode, nickname, usertype, created_time) VALUES(?, ?, ?, ?, ?, NOW())', [id, hash, keycode, nickname, usertype], (error, results, fields) => {
								if(error) return res.json({isSuccess: false, message: error});
								else return res.json({isSuccess: true, message: "회원가입에 성공하였습니다."});
						});
					
					});
					});
					
					
			});
		else return res.json({isSuccess: false, message: "유저권한 조회에 실패하였습니다."});
	});
});

router.post('/login', (req, res) => { //아이디 비밇번호 입력됨
	/*
		TODO: 나중에 보안 강화를 위해 GET 방식에서 POST 방식으로 변경하고, id, pw 를 받아오는 방식을 바꿔야함.
	*/
	var id = req.body.id;
	var pw = req.body.pw;
	
	db.query('select * from user where id=?', [id], (error, results, fields) => {
		if(error) return res.json({isSuccess: false, token: null, message: error});
		else
			if(!results[0])
				return res.json({isSuccess: false, token: null, message: "id 또는 비밀번호를 다시 확인하십시오."});
			else
				// TODO: bcrypt 라이브러리를 이용한 패스워드 hash 암호화를 RSA 알고리즘으로 대체할 필요성이 있음.
				bcrypt.compare(pw, results[0].pw, function(err, check) {
					if(err) return res.json({isSuccess: false, token: null, message: err});
    				else if(check) {
						/*
							JSONWebToken 을 사용한 토큰 인증 방식을 차용.
							Signing 을 진행함.
						*/
						return res.json({isSuccess: true, token: jwt.sign({id: id}, '2018osam!@#'), message: "로그인되었습니다."});
					}
					else return res.json({isSuccess: false, token: null, message: "id 또는 비밀번호를 다시 확인하십시오."});
		});
	});
});

function checkKeycode(keycode, callback) {
	db.query('select * from keycode where keycode=?', [keycode], (error, results, fields) => {
		if(error)
			return callback(error, null);
		else if(!results[0])
			return callback("키코드 조회에 실패하였습니다.", null);
		return callback(null, results[0].usertype);
	});
}

function checkIdReduplication(id, callback){
	db.query('select * from user where id=?', [id], (error, results, fields) => {
		
		if(error)
			return callback(error, null);
		else{
			if(results[0]) callback("이미 사용중인 id 입니다.", null);
			else callback(null, true);
		}
	});
}

function checkNicknameReduplication(nickname, callback){
	db.query('select * from user where nickname=?', [nickname], (error, results, fields) => {
		
		if(error)
			return callback(error, null);
		else{
			if(results[0]) callback("이미 사용중인 nickname 입니다.", null);
			else callback(null, true);
		}
	});
}

module.exports = router;