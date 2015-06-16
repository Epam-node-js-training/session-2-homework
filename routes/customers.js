var express = require('express');
var redis = require('redis');
var helper = require('./libraryHelper');

var router = express.Router();
var client = redis.createClient();
var customerSetName = "customers";

router.get('/', function (req, res) {
    client.smembers(customerSetName, function (err, result) {
        if (err)
            throw err;
        
        if (result.length > 0) {
           helper.getAllItems(result, function (err, result) {
                if (err)
                    throw err;
                
                res.send(helper.getResponse("OK", null, result));
            })
        } else {
            res.send(helper.getResponse("OK", null, []));
        }
    })
});

router.post('/:customerId/books/:bookId', function (req, res) {
    var customerKey = helper.getCustomerKey(req.params.customerId);
    var bookKey = helper.getBookKey(req.params.bookId);
    var booksByCustomerKey = helper.getBooksByCustomerKey(customerKey);
    var customersByBookKey = helper.getCustomersByBookKey(bookKey);
    
    
    client.hgetall(customerKey, function (err, value) {
        if (err)
            throw err;
        if (value) {
            client.multi()
                .sadd(booksByCustomerKey, bookKey)
                .sadd(customersByBookKey, customerKey)
                .exec(function (err, result) {
                        if (err)
                            throw err;
                        if (helper.isSuccess(result)) {
                            res.send(helper.getResponse("OK", "Customer:" + req.params.customerId + " took a book:" + req.params.bookId));
                        } else {
                            res.send(helper.getResponse("ERROR", "Error has occured"));
                        }
                    })
        } else {
            res.send(helper.getResponse("ERROR", "Customer with id: " + req.params.customerId + " is not found"));
        }
    })
});

router.get('/:id/books', function (req, res) {
    var id = req.params.id;
    var key = helper.getBooksByCustomerKey(helper.getCustomerKey(id));
    client.smembers(key, function (err, result) {
        if (err)
            throw err;
        
        if (result.length > 0) {
            helper.getAllItems(result, function (err, result) {
                if (err)
                    throw err;
                
                res.send(helper.getResponse("OK", null, result));
            })
        } else {
            res.send(helper.getResponse("OK", null, []));
        }
    })
});

router.delete('/:customerId/books/:bookId', function (req, res) {
    var customerKey = helper.getCustomerKey(req.params.customerId);
    var bookKey = helper.getBookKey(req.params.bookId);
    var booksByCustomerKey = helper.getBooksByCustomerKey(customerKey);
    var customersByBookKey = helper.getCustomersByBookKey(bookKey);
    client.multi()
    .srem(booksByCustomerKey, bookKey)
    .srem(customersByBookKey, customerKey)
    .exec(function (err, result) {
        if (err)
            throw err;
        if (helper.isSuccess(result)) {
            res.send(helper.getResponse("OK", "Customer:" + req.params.customerId + " returned a book:" + req.params.bookId));
        } else {
            res.send(helper.getResponse("ERROR", "Error has occured"));
        }
    })
});

router.route('/:id')
    .get(function (req, res) {
        var id = req.params.id;
        var key = helper.getCustomerKey(id);
        client.hgetall(key, function (err, value) {
            if (err)
                throw err;
            if (value) {
                res.send(helper.getResponse("OK", null, value));
            } else {
                res.send(helper.getResponse("ERROR", "Customer with id: " + id + " is not found"));
            }
        })
    })
    .post(function (req, res) {
        var id = req.params.id;
        var key = helper.getCustomerKey(req.params.id);
        var book = { id: id, name: req.body.name};
        client.hgetall(key, function (err, value) {
            if (err)
                throw err;
            if (value) {
                res.send(helper.getResponse("ERROR", "Customer with id: " + id + " already exists"));
            } else {
                client.multi()
                    .hmset(key, book)
                    .sadd(customerSetName, key)
                    .exec(function (err, value) {
                        if (err)
                            throw err;
                        res.send(helper.getResponse("OK", "Customer created", book));
                })
            }
        })
    })
    .put(function (req, res) {
        var id = req.params.id;
        var key = helper.getCustomerKey(req.params.id);
        var book = { id: id, name: req.body.name };
        client.hgetall(key, function (err, value) {
            if (err)
                throw err;
            if (value) {
                //update
                client.hmset(key, book, function (err, value) {
                    res.send(helper.getResponse("OK", "Customer with id: " + id + " has been updated", book));
                })
            } else {
                //create book
                client.multi()
                    .hmset(key, book)
                    .sadd(customerSetName, key)
                    .exec(function (err, value) {
                        if (err)
                            throw err;
                        res.send(helper.getResponse("OK", "Customer has been created", book));
                    })
            }
        })
    })
    .delete(function (req, res) {
        var id = req.params.id;
        var key = helper.getCustomerKey(id);
        var booksByCustomerKey = helper.getBooksByCustomerKey(helper.getCustomerKey(id));
    
        client.smembers(booksByCustomerKey, function (err, result){
            if (err)
                throw err;
            var queue = client.multi();
            for (var i = 0; i < result.length; i++) {
                var bookKey = result[i];
                var customersByBookKey = helper.getCustomersByBookKey(bookKey);
                queue.srem(customersByBookKey, key);
            }
            queue.del(booksByCustomerKey)
                .srem(customerSetName, key)
                .del(key)
                .exec(function (err, result) {
                if (err)
                    throw err;
                if (result[0] && result[1]) {
                    res.send(helper.getResponse("OK", "Customer with id: " + id + " has been deleted"));
                } else {
                    res.send(helper.getResponse("ERROR", "Customer with id: " + id + " has not been deleted"));
                }
            });
        })
    })

module.exports = router;
