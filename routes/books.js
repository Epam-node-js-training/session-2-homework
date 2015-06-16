var express = require('express');
var helper = require('./libraryHelper');
var redis = require('redis');

var router = express.Router();
var client = redis.createClient();
var bookSetName = "books";

router.get('/', function (req, res) {
    client.smembers(bookSetName, function (err, result){
        if (err)
            throw err;
        
        if (result.length > 0) {
            helper.getAllItems(result, function (err, result) {
                if (err)
                    throw err;
                
                res.send(helper.getResponse("OK", null, result));
            });
        } else {
            res.send(helper.getResponse("OK", null, []));
        }
    })
});

router.get('/:id/customers', function (req, res) {
    var id = req.params.id;
    var key = helper.getCustomersByBookKey(helper.getBookKey(id));
    client.smembers(key, function (err, result) {
        if (err)
            throw err;
        
        if (result.length > 0) {
            helper.getAllItems(result, function (err, result) {
                if (err)
                    throw err;
                
                res.send(helper.getResponse("OK", null, result));
            });
        } else {
            res.send(helper.getResponse("OK", null, []));
        }
    })
});

router.route('/:id')
    .get(function (req, res) {
        var id = req.params.id;
        var key = helper.getBookKey(id);
        client.hgetall(key, function (err, value) {
            if (err)
                throw err;
            if (value) {
                res.send(helper.getResponse("OK", null, value));
            } else {
                res.send(helper.getResponse("ERROR", "Book with id = " + id + " is not found"));
            }
        })
    })
    .post(function (req, res) {
        var id = req.params.id;
        var key = helper.getBookKey(req.params.id);
        var book = { id: id, title: req.body.title, author: req.body.author };
        client.hgetall(key, function (err, value) {
            if (err)
                throw err;
            if (value) {
                res.send(helper.getResponse("ERROR","Book with id: " + id + " already exists"));
            } else {
                client.multi()
                    .hmset(key, book)
                    .sadd(bookSetName, key)
                    .exec(function (err, value) {
                    if (err)
                        throw err;
                    res.send(helper.getResponse("OK", "Book has been created", book));
                })
            }
        })
    })
    .put(function (req, res) {
        var id = req.params.id;
        var key = helper.getBookKey(req.params.id);
        var book = { id: id, title: req.body.title, author: req.body.author };
        client.hgetall(key, function (err, value) {
            if (err)
                throw err;
            if (value) {
                //update
                client.hmset(key, book, function (err, value){
                    res.send(helper.getResponse("OK", "Book with id: " + id + " has been updated", book));
                })
            } else {
                //create book
                client.multi()
                    .hmset(key, book)
                    .sadd(bookSetName, key)
                    .exec(function (err, value) {
                        if (err)
                            throw err;
                        res.send(helper.getResponse("OK", "Book has been created", book));
                    })
            }
        })
    })
    .delete(function (req, res) {
        var id = req.params.id;
        var key = helper.getBookKey(id);
        client.multi()
            .srem(bookSetName, key)
            .del(key)
            .exec(function (err, result) {
                if (err)
                    throw err;
                if (result[0] && result[1]) {
                    res.send(helper.getResponse("OK", "Book with id: " + id + " has been deleted"));
                } else {
                    res.send(helper.getResponse("ERROR", "Book with id: " + id + " has not been deleted"));
                }
            });
    })

module.exports = router;
