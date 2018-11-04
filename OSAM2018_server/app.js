const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

require('dotenv').config();

var app = express();// Express

const helmet = require('helmet');
app.use(helmet());//Security

const compression = require('compression');
app.use(compression());//Compress

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', require('./routes/auth'));

// 인증
app.use(function(req, res, next) {
	var token = decodeURIComponent(req.query.token);
	if(!token) token = req.body.token;
	if(!token) token = req.params.token;
	
	if(token) {
		var decoded = jwt.verify(token, '2018osam!@#');
		/*
			TODO: 세션 유지에 필요한 보안성 강화 필요. 시간날 때 추가하는 것으로 정리.
		*/
		req.id = decoded.id;
		next();	
	}
	else {
		res.json({isExpired: true});
	}
});


app.use('/', require('./routes/index'));
app.use('/user', require('./routes/user'));
app.use('/store', require('./routes/store'));
app.use('/getouts', require('./routes/getout'));
app.use('/points', require('./routes/point'));
app.use('/control', require('./routes/control'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(80, () => console.log('Example app listening on port: ' + 80));

module.exports = app;
