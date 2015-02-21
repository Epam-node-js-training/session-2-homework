var mongoose = require('mongoose');

var bookRecordSchema = new mongoose.Schema({
    _book : { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
    _customer : { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }
});

module.exports = mongoose.model('BookRecord', bookRecordSchema);



