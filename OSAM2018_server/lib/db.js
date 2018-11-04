var mysql      = require('mysql');
var db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'osam2018!',
  database : 'osam',
  dateStrings: 'date'
});
try{
	db.connect();
}catch(error){
	console.error(error);
	
}
module.exports = db;