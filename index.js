var express = require('express');
var bodyParser = require('body-parser')
var app = express();
app.use(bodyParser.json())

var bookRouter = require('./routes/books');
var customerRouter = require('./routes/customers');
app.use('/books', bookRouter);
app.use('/customers', customerRouter);

app.listen(8080);

