var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var dbOperations = require('./routes/dbOperations');
// var createOperations = require('./routes/createOperations');
var readOperations = require('./routes/readOperations');
// var reports = require('./routes/reports');
// var updateOperations = require('./routes/updateOperations');
var sessionOperations = require('./routes/sessionOperations');
var adminOperations = require('./routes/adminOperations');

var dataForm = require('./routes/dataFormOperations');
// var schemes = require('./routes/schemes');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

const oneDay = 1000 * 60 * 60 * 24;
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: 'keyboard cat',
  cookie: { maxAge: oneDay }
}));

//https://stackoverflow.com/a/19965089/5746368 (Edit 3)
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//Public directory from where all HTML files are served
app.use(express.static(path.join(__dirname, 'public'))); 

/////////////////////////////////////////////////////////////////////////////////////////////
//All server operations/routes are defined here

//Session management operations: Login/logout
app.use('/', indexRouter);
app.use('/db', dbOperations);
app.use('/session', sessionOperations);
app.use('/admin', adminOperations);

//Data manipulation: Insert, Read, Edit.
// app.use('/create', createOperations);
app.use('/read-list', readOperations);
// app.use('/update', updateOperations);

app.use('/dataform', dataForm); //DataForm Operations (Onshore)
// app.use('/schemes', schemes); //Scheme Details Management

//Reporting: For Tables and charts
// app.use('/report', reports);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
