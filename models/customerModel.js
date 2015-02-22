var Schema = require('mongoose').Schema;
var customer = Schema(
    {
    id: Number, 
    name: String, 
    books: [{ type: Schema.Types.ObjectId, ref: 'Book' }]
});
module.exports = db.model('Customer', customer);