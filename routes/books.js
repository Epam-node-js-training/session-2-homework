var express = require('express');
var Models = require('../models');
var Book = Models.Book;

var bookRouter = express.Router();

var isValidBook = function (req) {
    return (req.body.author && req.body.title);

}

bookRouter.get('/', function (req, res) {
    Book.findAll().then(function (books) {
        res.json(books);
    });
});
bookRouter.get('/:id', function (req, res) {
    Book.find({where: {id: req.params.id}}).then(function (book) {
        res.json(book);
    });
});
bookRouter.get('/:id/customers', function (req, res) {
    Book.find({where: {id: req.params.id}}).then(function (book) {
        book.getCustomer().then(function (customer) {
            res.json(customer);
        });
    });
});
bookRouter.delete('/:id', function (req, res) {
    Book.destroy({where: {id: req.params.id}}).then(function (book) {
        if (book) {
            res.writeHead(200);
        } else {
            res.writeHead(404);
        }
        res.end();
    });
});
bookRouter.put('/:id', function (req, res) {
    if (!req.body.author || !req.body.title) {
        res.writeHead(400);
        res.end();
    } else {
        Book.update({ author: req.body.author, title: req.body.title}, {where: {id: req.params.id}}).then(function (book) {
                if (book && book.length > 0) {
                    if (book[0] > 0) {
                        res.writeHead(200);
                    }
                    else {
                        res.writeHead(404);
                    }
                    res.end();
                }
            }
        )
        ;
    }
});
bookRouter.put('/:id', function (req, res) {
    if (!isValidBook(req)) {
        res.writeHead(400);
        res.end();
    } else {
        Book.update({ author: req.body.author, title: req.body.title}, {where: {id: req.params.id}}).then(function (book) {
                if (book && book.length > 0) {
                    if (book[0] > 0) {
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
bookRouter.post('/', function (req, res) {
    if (!isValidBook(req)) {
        res.writeHead(400);
        res.end();
    } else {
        Book.create({author: req.body.author, title: req.body.title}).then(function () {
            res.writeHead(201);
            res.end();
        });
    }
});
module.exports = bookRouter;