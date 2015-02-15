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
  res.render('root')
})

var server = app.listen(8080, function () {
  var host = server.address().address
  var port = server.address().port
  console.log('Example app listening at http://%s:%s', host, port)
})

// Books controller
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
    if (book)
      book.destroy()
    res.redirect('/books')
  })
})

app.get('/books/:id/customers', function(req, res) {
  db.Book.find(req.params.id).then(function(book) {
    book.getCustomers().on('success', function(customers) {
      res.render('books/customers', { book: book, customers: customers })
    })
  })
})

// Customers controller
app.get('/customers', function(req, res) {
  db.Customer.findAndCountAll().then(function(customers) {
    res.render('customers/index', { customers: customers })
  })
})

app.post('/customers', function(req, res) {
  var flash
  if (req.body && !!req.body.name.trim()) {
    flash = 'Customer was added.'
    db.Customer.create({ name: req.body.name })
  }
  else
    flash = 'Error: Customer was not added. Mandatory fields cannot be empty.'
  db.Customer.findAndCountAll().then(function(customers) {
    res.render('customers/index', { customers: customers, flash: flash })
  })
})

app.get('/customers/:id', function(req, res) {
  db.Customer.find(req.params.id).then(function(customer) {
    customer.getBooks().complete(function(err, added_books) {
      var b_ids = added_books.map(function(b) { return b.id })
      if (b_ids.length < 1)
        b_ids = [0]
      db.Book.findAndCountAll({where: { id: {not: b_ids } } }).then(function(books) {
        res.render('customers/show', { customer: customer, books: books })
      })
    })
  })
})

app.put('/customers/:id', function(req, res) {
  db.Customer.find(req.params.id).then(function(customer) {
    var flash = 'Error: can\'t update customer.'
    if (customer && req.body && !!req.body.name.trim()) {
      customer.updateAttributes({
        name: req.body.name
      })
      flash = 'Customer was updated.'
    }
    res.render('customers/show', { customer: customer, flash: flash })
  })
})

app.delete('/customers/:id', function(req, res) {
  db.Customer.find(req.params.id).then(function(customer) {
    if (customer)
      customer.destroy()
    res.redirect('/customers')
  })
})

app.get('/customers/:id/books', function(req, res) {
  db.Customer.find(req.params.id).then(function(customer) {
    customer.getBooks().complete(function(err, _books) {
      var b_ids = _books.map(function(b) {return b.dataValues.id})
      if (b_ids.length < 1)
        b_ids = [0]
      db.Book.findAndCountAll({ where: { id: b_ids }}).then(function(books) {
        res.render('customers/books', { customer: customer, books: books })
      })
    })
  })
})

app.post('/customers/:customer_id/books/:book_id', function(req, res) {
  db.Book.find(req.params.book_id).then(function(book) {
    if (book) {
      db.Customer.find(req.params.customer_id).then(function(customer) {
        if (customer) {
          book.addCustomers([customer]).complete(function(err, customers) {
            console.log("Customer (ID: " + customer.id + ") ordered book (ID: " + book.id + ")")
          })
        }
      })
    }
    res.redirect("/customers/" + req.params.customer_id)
  })
})

app.delete('/customers/:customer_id/books/:book_id', function(req, res) {
  db.Book.find(req.params.book_id).then(function(book) {
    if (book) {
      db.Customer.find(req.params.customer_id).then(function(customer) {
        if (customer) {
          book.removeCustomers([customer]).complete(function(err, customers) {
            console.log("Removed book (ID: " + book.id + ") from customer (ID: " + customer.id + ") ordered")
          })
        }
      })
    }
    res.redirect("/customers/" + req.params.customer_id)
  })
})