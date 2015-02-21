var express = require('express');
var Book = require('../models/m_book.js');

var router = express.Router();

router.route('/')
.get(function (req, res, next) {
    console.log('Getting all books from db.');
    
    Book.find(function (err, books) {
        if (err)
            return next(err);
        
        res.render('books', {
            values: books,
            title: "Books"
        });
    });
})
.post(function (req, res, next) {
    console.log('Posting a new book.');
    
    Book.create(req.body, function (err, post) {
        if (err)
            return next(err);
        
        console.log('Book has successfully been created.');
        res.json(post);
    });
});

router.route('/:id')
.get(function (req, res, next) {
    console.log('Getting a book with id %s', req.params.id);
    
    Book.findById(req.params.id, function (err, book) {
        if (err)
            return next(err);
        
        res.render('book', {
            value: book,
            title: "Book View"
        });
    });
})
.put(function (req, res, next) {
    console.log('Updating a book with id %s', req.params.id);
    
    Book.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err)
            return next(err);
        
        console.log("Book has successfully been updated");
        res.json(post);
    });
})
.delete(function (req, res, next) {
    console.log('Deleting a book with id %s', req.params.id);
    
    //NM: not using findByIdAndRemove because post handler does not execute with that method.
    Book.findById(req.params.id, function (err, book) {
        if (err)
            return next(err);
        
        book.remove(function (err, post) {
            if (err)
                next(err);
            
            console.log('Book has successfully been deleted.');
            res.json(post);
        });
    });
})

router.route('/:id/customers')
.get(function (req, res, next) {
    console.log('Getting customers who ordered a book with id %s', req.params.id);

    Book.findById(req.params.id, function (err, book) {
        if (err)
            return next(err);
        
        book.customers(function (err, customers) {
            if (err)
                next(err);
            
            res.render('customers', { title: "Customers ordered this book", values: customers });
        });              
    });   
});

module.exports = router;