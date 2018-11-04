// 테스트시 아래 항목 사용 
// 관리자token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImtvcmVhMzQiLCJpYXQiOjE1NDA2NDA1NDl9.W852fNEKX3FVT3aRsBH884jlCYT1k6aGdDRmA7FuqMQ
// 일반사용자 token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImxlZTEwMjAiLCJpYXQiOjE1NDA2NDI1OTd9.-lZo-gYZGYf5KQg27A37wQrtFF-i7OKtLMjTKbyW8lI

var express = require('express');
var router = express.Router();
const db = require('../lib/db');
const jwt = require('jsonwebtoken');



router.get('/', (req, res) => {
	return res.redirect(`/control/keycode?token=${jwt.sign({id: req.id}, '2018osam!@#')}`);
});
router.post('/keycode', (req, res) => {
	return res.redirect(`/control/keycode?token=${jwt.sign({id: req.id}, '2018osam!@#')}`);
});
router.get('/keycode', (req, res) => {
	var html = `
<style>
  .add-form {
    text-align: center;
}
  h1, h4 {
	text-align: center;
  }
  table, th, td {
    border: 1px solid #bcbcbc;
	vertical-align: middle;
  }
  table {
    margin-left: auto;
    margin-right: auto;
  }
</style>
`;
	db.query('select id, nickname, usertype from user where id=?', [req.id], (error, results, fields) => {
		if(error) return res.send(error);
		else if(!results[0]) return res.send("비인가 사용자 접근 불가");
		else{
			html += `${results[0].nickname}님 환영합니다. ${req.id}로 로그인되었습니다. <h1>통합병력지원시스템</h1>`;
			var usertype = results[0].usertype;
			// if(usertype === 0){ // 관리자 1
			// 	html += '<h4>체계 이용 권한이 없습니다. 관리자가 아닙니다.</h4>';
			// 	return res.send(html);
			// }
			html += '<h4>환영합니다. 통합병력지원시스템체계입니다.</h4>';
			db.query("select keycode, usertype, created_time from keycode", (error, results, fields) => {
				console.log(results[0]);
				html += `
<table>
	<caption>키코드 목록</caption>
	<thead><tr>
		<th>순번</th>
		<th>키코드</th>
		<th>인가 유형</th>
		<th>인가 시간</th>
	</tr></thead>
`;
				if(error){
					html += `
	<tfoot><tr>
		<td colspan="4">데이터베이스 오류 : 키코드 데이터를 불러올 수 없습니다.</td>
	</tr></tfoot>
</table>
`;
					return res.send(html);
				} else if(!results[0]){
					html += `
	<tfoot><tr>
		<td colspan="4">현재 활성화된 키코드가 없습니다.</td>
	</tr></tfoot>
</table>
`;
					return res.send(html);
				} else if(usertype === 0){
					html += `
	<tfoot><tr>
		<td colspan="4">체계 이용 권한이 없습니다. 관리자가 아닙니다.</td>
	</tr></tfoot>
</table>
`;
					return res.send(html);
				} else {
				
				
				for(var i in results){
					html += `
	<tbody><tr>
		<td>${Number(i) + 1}</td>
		<td>${results[i].keycode}</td>
		<td>${(results[i].usertype === 1) ? '관리자' : '일반 사용자'}</td>
		<td>${results[i].created_time}</td>
		<td><form action="/control/keycode/delete/${results[i].keycode}?token=${jwt.sign({id: req.id}, '2018osam!@#')}" method="post">
	<input type="submit" value="비활성화(제거)"></form></td>
	</tr></tbody>
`;
				}
				html += '</table>';
				html += `
<div class = "add-form">
<form action="/control/keycode/add?token=${jwt.sign({id: req.id}, '2018osam!@#')}" method="post">
  <input type="submit" value="키코드 활성화(추가)">
</form></div>`;
				return res.send(html);
				}
			});
		}
	});
});

router.route('/keycode/add')
	.get((req, res) => {
		var html = 
	`<form action="/control/keycode/add?token=${jwt.sign({id: req.id}, '2018osam!@#')}" method="post">
	  <p> </p>
	  <p>keycode</p>
	  <input type="text" name="keycode" value="">
	  <p>usertype</p>
		<div>
	  <input type="radio" name="usertype" value="일반"> 일반
	  <input type="radio" name="usertype" value="관리자"> 관리자
		</div>
	  <p></p>
	  <input type="submit" value="추가">
	  <input type="reset" value="초기화">
	  <input type=submit value="취소" formaction="/control/keycode?token=${jwt.sign({id: req.id}, '2018osam!@#')}" method="get">
	</form>`;
		return res.send(html);
	})
	.post((req, res) => {
		var keycode = req.body.keycode;
		if(!keycode || keycode.length < 4)
			return res.redirect(`/control/keycode/add?token=${jwt.sign({id: req.id}, '2018osam!@#')}`);
		var usertype = 0;
		if (req.body.usertype == "관리자")
			usertype = 1;
		db.query('select keycode from keycode where keycode=?', [keycode], (error, results, fields) => {
			if(error) return res.redirect(`/control/keycode/add?token=${jwt.sign({id: req.id}, '2018osam!@#')}`);
			else if(results[0]) return res.redirect(`/control/keycode?token=${jwt.sign({id: req.id}, '2018osam!@#')}`);
			else db.query('INSERT INTO keycode (keycode, usertype, created_time) VALUES(?, ?, NOW())', [keycode, usertype], (error, results, fields) => {
				if(error) return res.redirect(`/control/keycode/add?token=${jwt.sign({id: req.id}, '2018osam!@#')}`);
				else return res.redirect(`/control/keycode?token=${jwt.sign({id: req.id}, '2018osam!@#')}`);
			});
		});
	});

router.post('/keycode/delete/:keycode', (req, res) => {
		var keycode = req.params.keycode;
		db.query('DELETE FROM keycode WHERE keycode = ?', [keycode], (error, results, fields) => {
			console.log(results);
			return res.redirect(`/control/keycode/?token=${jwt.sign({id: req.id}, '2018osam!@#')}`);
		});
	});

module.exports = router;