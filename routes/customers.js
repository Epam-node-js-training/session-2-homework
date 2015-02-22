var express = require('express');
var customer = require('./../models/customerModel');
var book = require('./../models/bookModel');

var router = express.Router();

router
    .route('/')
    .get(function (req, res) {
    customer.find({},
            function (err, value) {
        if (err)
            throw err;
        if (!value || value.length == 0) {
            res.end('There is no customer.');
        } else {
            res.render('customers', { customers: value });
        }
    });
})
.post(function (req, res) {
    customer.findOne({ id: req.body.id }, function (error, customerWithId) {
        if (!!customerWithId) {
            customerWithId.update({ $set: { name: req.body.name } }, function (err, value) {
                if (err)
                    throw err;
                res.end('Customer was successfully updated.');
            });
        } else {
            customer.create({ id: req.body.id, name: req.body.name }, function (err, value) {
                if (err)
                    throw err;
                res.end('New customer was successfully added.');
            });
        }
    });
});
router
.route('/:id')
.get(function (req, res) {
    customer.findOne({ id: req.params.id },
        function (err, value) {
        if (err)
            throw err;
        if (!value) {
            res.end('There is no customer with such id');
        } else {
            res.render('customer', value);
        }
    });
})
    .delete(function (req, res) {
    customer.remove({ id: req.params.id }, function (err, value) {
        if (err)
            throw err;
        res.end('Customer was successfully deleted.');
    });
})
.put(function (req, res) {
    customer.update({ id: req.params.id }, { $set: { name: req.body.name } }, function (err, value) {
        if (err)
            throw err;
        res.end('Customer was successfully updated.');
    });
});

router
    .route('/:id/books')
    .get(function (req, res) {
    customer.findOne({ id: req.params.id },
            function (err, value) {
        if (err)
            throw err;
        if (!value) {
            res.end('There is no customer with such id');
        } else {
            value.populate('books');
            res.render('customer', value);
        }
    });
});
router
    .route('/:id/books/:bookId')
    .post(function (req, res) {
    
    customer.findOne({ id: req.params.id }, function (err, value) {
        if (err)
            throw err;
        if (!value) {
            throw new Error('There is no customer with such id');
        } else {
            
            book.findOne({ id: req.params.bookId }, function (err, existingBook) {
                if (err)
                    throw err;
                if (!existingBook) {
                    throw new Error('There is no book with such id.');
                }
                
                if (!value.books) {
                    value.books = [];
                }
                
                if (value.books.indexOf(existingBook._id) == -1) {
                    value.books.push(existingBook);
                    value.save();
                }
                
                customer
                .findOne({ id: req.params.id })
                .populate('books')
                .exec(function (err, val) {
                    if (err)
                        throw err;
                    res.render('customerBooks', val);
                });
            });
            
        }
    });


})
.delete(function(req, res) {
    customer.findOne({ id: req.params.id }, function(err, value) {
        if (err)
            throw err;
        if (!value) {
            throw new Error('There is no customer with such id');
        } else {

        }
        book.findOne({ id: req.params.bookId }, function (err, existingBook) {
            if (err)
                throw err;
            if (!existingBook) {
                throw new Error('There is no book with such id.');
            }
            
            if (!value.books) {
                value.books = [];
            }

            var index = value.books.indexOf(existingBook._id);
            if(index != -1) {
                value.books.splice(index, 1);
                value.save();
            }
            
            customer
                .findOne({ id: req.params.id })
                .populate('books')
                .exec(function (err, val) {
                if (err)
                    throw err;
                res.render('customerBooks', val);
            });
        });
    });
});

module.exports = router;