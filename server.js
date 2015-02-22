var mongoose = require('mongoose');
var uri = 'mongodb://localhost/library';
global.db = mongoose.createConnection(uri);
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var bodyParser = require('body-parser');
var cons = require('consolidate');
 
var books = require('./routes/books');
var customers = require('./routes/customers');

var app = express();
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.engine('hdl', cons.handlebars);
app.set('view engine', 'hdl');
app.use(favicon());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/books', books);
app.use('/customers', customers);

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.listen(8080);