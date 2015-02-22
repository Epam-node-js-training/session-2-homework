var Schema = require('mongoose').Schema;
var book = Schema(
{
    id: Number, 
    title: String, 
    author: String
});
module.exports = db.model('Book', book);