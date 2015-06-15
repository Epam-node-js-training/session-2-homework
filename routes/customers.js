var express = require('express');
var Models = require('../models');
var Book=Models.Book;
var Customer=Models.Customer;
var customerRouter = express.Router();
var isValidCustomer = function (req) {
    return (req.body.name);

}
customerRouter.get('/', function (req, res) {
    Customer.findAll().then(function (customers) {
        res.json(customers);
    });
});
customerRouter.get('/:id', function (req, res) {
    Customer.find({where: {id: req.params.id}}).then(function (customer) {
        res.json(customer);
    });
});

customerRouter.get('/:id/books', function (req, res) {
    Customer.find({where: {id: req.params.id}}).then(function (customer) {
        customer.getBooks().then(function (books){
            res.json(books);
        });
    });
});
customerRouter.delete('/:id/books/:bookId', function (req, res) {
    Customer.find({where: {id: req.params.id}}).then(function (customer) {
        if (customer) {
            Book.find({where: {id: req.params.bookId}}).then(function (book) {
                if(book){
                    customer.removeBook(book).then(function () {
                        res.writeHead(200);
                        res.end();
                    });
                }else{
                    res.writeHead(404);
                    res.write("No  book with such id");
                    res.end();
                }
            });
        } else {
            //res.write("no such customer")
            res.writeHead(404);
            res.write("No customer with such id");
            res.end();
        }

    });
});
customerRouter.delete('/:id', function (req, res) {
    Customer.destroy({where: {id: req.params.id}}).then(function (customer) {
        if (customer) {
            res.writeHead(200);
        } else {
            res.writeHead(404);
        }
        res.end();
    });
});
customerRouter.post('/', function (req, res) {
    if (!isValidCustomer(req)) {
        res.writeHead(400);
        res.end();
    } else {
        Customer.create({name: req.body.name}).then(function () {
            res.writeHead(201);
            res.end();
        });
    }
});
customerRouter.post('/:id/books/:bookId', function (req, res) {
    Customer.find({where: {id: req.params.id}}).then(function (customer) {
        if (customer) {
            Book.find({where: {id: req.params.bookId}}).then(function (book) {
                if(book){
                    book.setCustomer(customer).then(function () {
                        res.writeHead(201);
                        res.end();
                    });
                }else{
                    res.writeHead(404);
                    res.write("No  book with such id");
                    res.end();
                }
            });
        } else {
            //res.write("no such customer")
            res.writeHead(404);
            res.write("No customer with such id");
            res.end();
        }

    });
});
customerRouter.put('/:id', function (req, res) {
    if (!isValidCustomer(req)) {
        res.writeHead(400);
        res.end();
    } else {
        Customer.update({ name: req.body.name}, {where: {id: req.params.id}}).then(function (customer) {
                if (customer && customer.length > 0) {
                    if (customer[0] > 0) {
                        res.writeHead(200);
                    }
                    else {
                        res.writeHead(404);
                    }
                    res.end();
                }
            }
        );
    }
});
module.exports = customerRouter;