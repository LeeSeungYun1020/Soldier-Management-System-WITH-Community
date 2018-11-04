const express = require('express');
const sanitizeHtml = require('sanitize-html');
const router = express.Router();
const db = require('../lib/db');


// id type title content	
router.post('/create', (req, res) => {
	var id = req.id;
	var type = req.body.type;
	var title = req.body.title;
	var content = req.body.content;
	checkidType(id, type, (error, nickname)=> {
		if (error) return res.json({isSuccess: false, message: error});
		else
			db.query('INSERT INTO article (title, content, creator, created_time, articletype) VALUES(?, ?, ?, NOW(), ?)', [sanitizeHtml(title), sanitizeHtml(content), nickname, type], (error, results, fields) => {
				if (error) return res.json({isSuccess: false, message: error});
				else return res.json({isSuccess: true, message: "게시글이 등록되었습니다."});
			});
	});
});

// id type num title content		   
router.post('/update', (req, res) => {
	checkidType(req.id, req.body.type, (error, nickname)=> {
		if (error) res.send(error);
		else
			checkArticle(req.body.num, (error, creator) => {
				if(error) return res.json({isSuccess: false, message: error});
				else if(creator != nickname) return res.json({isSuccess: false, message: "이 게시글에 대한 수정 권한이 없습니다."});
				else
					db.query('UPDATE article SET title = ?, content = ?, created_time = NOW(), type = ? WHERE article_no=?', [sanitizeHtml(req.body.title), sanitizeHtml(req.body.content), req.body.type, req.body.num], (error, results, fields) => {
						if (error) return res.json({isSuccess: false, message: error});
						else return res.json({isSuccess: true, message: "게시글이 수정되었습니다."});
					});
			});
	});
});

router.get('/', (req, res) => {
	checkidType(req.id, req.body.type, (error, nickname) => {
		if(error) return res.json({isSuccess: false, message: error});
		else {
			var articletype = req.query.articletype;
			if(articletype)
				db.query('select * from article WHERE articletype=?',[articletype], (error, results, fields) => {
					if(error) return res.json({isSuccess: false, message: error});
					else return res.json(results);
				});
			else
				db.query('select * from article', (error, results, fields) => {
					if(error) return res.json({isSuccess: false, message: error});
					else return res.json(results);
				});
			
		}
	});
});

router.get('/article', (req, res) => {
	var articleNo = req.query.article_no;
	db.query('select * from article where article_no=?', [articleNo], (error, results, fields) => {
		if(error) return error;
		
		return res.json(results);
	});
	
});


//id type num
router.post('/delete', (req, res) => {
	checkidType(req.id, req.body.type, (error, nickname) => {
		if(error) return res.json({isSuccess: false, message: error});
		else
			checkArticle(req.body.num, (error, creator) => {
				if(error) return res.json({isSuccess: false, message: error});
				else checkUsertype(req.id, (error, usertype) => {
					if(creator !== nickname)
						return res.json({isSuccess: false, message: "이 게시글에 대한 삭제 권한이 없습니다."});
					else
						db.query('DELETE FROM article WHERE article_no = ?', [req.body.num], (error, results, fields) => {
							if(error) return res.json({isSuccess: false, message: error});
							else return res.json({isSuccess: true, message: "게시글이 삭제되었습니다."});
						});
				});
			});
				
	});
});



function checkidType(id, type, callback){
	if(type < 0 || type > 3)
		return callback("type error", null);
	
	db.query('select * from user where id=?', [id], (error, results, fields) => {
		
		if(error)
			return callback(error, null);
		else{
			var nickname = results[0].nickname;
			if (nickname) callback(null, nickname);
			else return callback("닉네임 조회 불가", null);
		}
	});
}

function checkUsertype(id, callback){
	db.query('select * from user where id=?', [id], (error, results, fields) => {
		
		if(error)
			return callback(error, null);
		else{
			var usertype = results[0].usertype;
			if (usertype) callback(null, usertype);
			else return callback("유저 권한 조회 불가", null);
		}
	});
}

function checkArticle(num, callback) {
	db.query('select * from article where article_no=?', [num], (error, results, fields) => {
		if(error)
			return callback(error, null);
		return callback(null, results[0].creator);
	});
}

module.exports = router;