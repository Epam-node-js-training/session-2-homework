var express = require('express');
var book = require('./../models/bookModel');
var customer = require('./../models/customerModel');

var router = express.Router();

router
    .route('/')
    .get(function (req, res) {
    book.find({},
            function (err, value) {
        if (err)
            throw err;
        if (!value) {
            res.end('There is no book with such id');
        } else {
            res.render('library', { books: value });
        }
    });
})
.post(function (req, res) {
    book.findOne({ id: req.body.id }, function (err, bookWithId) {
        if (!!bookWithId) {
            bookWithId.update({ $set: { title: req.body.title, author: req.body.author } }, function (err, value) {
                if (err)
                    throw err;
                res.end('Book was successfully updated.');
            });
        } else {
            book.create({ id: req.body.id, title: req.body.title, author: req.body.author }, function (err, value) {
                if (err)
                    throw err;
                res.end('New book was successfully added.');
            });
        }
    });
});
router
.route('/:id')
.get(function (req, res) {
    book.findOne({ id: req.params.id },
        function (err, value) {
        if (err)
            throw err;
        if (!value) {
            res.end('There is no book with such id');
        } else {
            res.render('book', value);
        }
    });
})
    .delete(function (req, res) {
    book.remove({ id: req.params.id }, function (err, value) {
        if (err)
            throw err;
        res.end('Book was successfully deleted.');
    });
})
.put(function (req, res) {
    book.update({ id: req.params.id }, { $set: { title: req.body.title, author: req.body.author } }, function (err, value) {
        if (err)
            throw err;
        res.end('Book was successfully updated.');
    });
});

router
.route('/:id/customers')
.get(function (req, res) {
    book.findOne({ id: req.params.id }, function (err, value) {
        if (err)
            throw err;
        if (!value) {
            res.end('There is no book with such id');
        } else {

            customer.find({ books: value._id }, function(error, customers) {
                if (err)
                    throw err;
                value.customers = customers;
                res.render('book-with-customers', value);
            });
        }
    });
})
module.exports = router;