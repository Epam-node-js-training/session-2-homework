var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('index', { title:'Express App', text: 'Hello, world! This is my first lab with Express!' });
});

module.exports = router;