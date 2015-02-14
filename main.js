var express = require('express')
var app = express()
var db = require('./config/database')
var bodyParser = require('body-parser')
var methodOverride = require('method-override')

app.set('views', './views')
app.set('view engine', 'jade')
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())
app.use(methodOverride('_method'))

app.get('/', function (req, res) {
  res.redirect('/books')
})

var server = app.listen(8080, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})

app.get('/books', function(req, res) {
  db.Book.findAndCountAll().then(function(books) {
    res.render('books/index', { books: books })
  })
})

app.post('/books', function(req, res) {
  var flash
  if (req.body && !!req.body.author.trim() && !!req.body.title.trim()) {
    flash = 'Book was added.'
    db.Book.create({ author: req.body.author, title: req.body.title })
  }
  else
    flash = 'Error: Book was not added. Mandatory fields cannot be empty.'
  console.log(flash)
  db.Book.findAndCountAll().then(function(books) {
    res.render('books/index', { books: books, flash: flash })
  })
})

app.get('/books/:id', function(req, res) {
  db.Book.find(req.params.id).then(function(book) {
    res.render('books/show', { book: book })
  })
})

app.put('/books/:id', function(req, res) {
  db.Book.find(req.params.id).then(function(book) {
    var flash = 'Error: can\'t update book.'
    if (book && req.body && !!req.body.author.trim() && !!req.body.title.trim()) {
      book.updateAttributes({
        title: req.body.title,
        author: req.body.author
      })
      flash = 'Book was updated.'
    }
    res.render('books/show', { book: book, flash: flash })
  })
})

app.delete('/books/:id', function(req, res) {
  db.Book.find(req.params.id).then(function(book) {
    if (book) {
      book.destroy()
    }
    res.redirect('/books')
  })
})