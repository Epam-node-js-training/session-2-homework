var express = require('express');

var Customer = require('../models/m_customer.js');

var router = express.Router();

router.route('/')
.get(function (req, res, next) {
    console.log('Getting all customers from db.');
    Customer.find(function (err, customers) {
        if (err)
            return next(err);
        
        res.render('customers', {
            values: customers,
            title: "Customers"
        });
    });
})
.post(function (req, res, next) {
    console.log('Posting a new customer.');
    
    Customer.create(req.body, function (err, post) {
        if (err)
            return next(err);
        
        res.json(post);
    });
});

router.route('/:id')
.get(function (req, res, next) {
    console.log('Getting customer with id %s', req.params.id);
    
    Customer.findById(req.params.id, function (err, customer) {
        if (err)
            return next(err);
        
        res.render('customer', {
            value: customer,
            title: "Customer View"
        });
    });
})
.put(function (req, res, next) {
    console.log('Updating a customer with id %s', req.params.id);
    
    Customer.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err)
            return next(err);
        
        res.json(post);
    });
})
.delete(function (req, res, next) {
    console.log('Deleting a customer with id %s', req.params.id);
    
    Customer.findById(req.params.id, function (err, customer) {
        if (err)
            return next(err);
        
        customer.remove(function (err, post) {
            if (err)
                next(err);
            
            res.json(post);
        });
    });
})

router.route('/:id/books')
.get(function (req, res, next) {
    console.log('Getting books ordered by customer with id %s', req.params.id);

    Customer.findById(req.params.id, function (err, customer) {
        if (err)
            return next(err);
        
        customer.books(function (err, books) { 
            if (err)
                next(err);

            res.render('books', { title: "Books ordered by this customer", values: books });
        });              
    });
   
})

router.route('/:id/books/:bookId')
.post(function (req, res, next) {
    console.log('Ordering a book with id %s by customer with id %s', req.params.bookId, req.params.id);

    Customer.findById(req.params.id, function (err, customer) {
        if (err)
            return next(err);
        
        customer.order(req.params.bookId, function (err, record) {
            if (err)
                next(err);

            res.send('Book has successfully been ordered.');
        });       
    });   
})
.delete(function (req, res, next) {
    console.log('Deleting record about the book with id %s ordered by customer with id %s', req.params.bookId, req.params.id);

    //NM: not using findByIdAndRemove because post handler does not execute with that method.
    Customer.findById(req.params.id, function (err, customer) {
        if (err)
            return next(err);
        
        customer.return(req.params.bookId, function (err, customer) { 
            if (err)
                next(err);

            res.send('Book record has successfully been deleted.');
        });
    });   
})

module.exports = router;