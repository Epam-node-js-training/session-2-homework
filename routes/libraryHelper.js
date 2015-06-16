var redis = require('redis');
var client = redis.createClient();

function getBookKey(id) {
    return "book:" + id;
}

function getCustomerKey(id) {
    return "customer:" + id;
}

function getBooksByCustomerKey(key) {
    return "booksByCustomer:" + key;
}

function getCustomersByBookKey(key) {
    return "customersByBook:" + key;
}

function getAllItems(ids, callback) {
    if (ids.length > 0) {
        var queue = client.multi();
        
        for (var i = 0; i < ids.length; i++) {
            queue.hgetall(ids[i]);
        }
        
        queue.exec(function (err, result) {
            callback(err, result);
        })
    }
}

function getResponse(status, msg, resp) {
    var result = { "status": status };
    if (msg) result.message = msg;
    if (resp) result.result = resp;
    return result;
}

function isSuccess(arr) {
    var result = true;
    for (var i = 0; i < arr.length; i++) {
        if (!arr[i]) {
            result = false;
            break;
        }
    }
    return result;
}

exports.getBookKey = getBookKey;
exports.getCustomerKey = getCustomerKey;
exports.getBooksByCustomerKey = getBooksByCustomerKey;
exports.getCustomersByBookKey = getCustomersByBookKey;
exports.getAllItems = getAllItems;
exports.getResponse = getResponse;
exports.isSuccess = isSuccess;
