var mongoose = require('mongoose')
var BookRecord = require('./m_bookrecord.js');

var customerSchema = new mongoose.Schema({    
    name: { type: String, trim: true, required: true }
});

customerSchema.methods.order = function(bookId, next) {
    
    var newBookRecord = new BookRecord({
        _book: bookId,
        _customer: this.id
    });
    
    newBookRecord.save(function (err, value) {
        if (err)
            return next(err);
        
        console.log("Book with id %s has successfully been ordered.", bookId);

        return next(null, newBookRecord);
    });
};

customerSchema.methods.return = function (bookId, next) {
    
    var query = BookRecord.findOne({
        '_bookId': mongoose.Schema.Types.ObjectId(bookId), 
        '_customerId': mongoose.Schema.Types.ObjectId(this._id)
    });
    query.exec(function (err, record) {
        if (err)
            return next(err);
    
        record.remove(function (err, value) {
            if (err)
                return next(err);

            console.log("Record with book id %s has successfully been deleted.", bookId);

            next(null, value);
        });
    });
};

customerSchema.methods.books = function (next) {
    
    var ObjectId = mongoose.Types.ObjectId;
    var query = { _customer: new ObjectId(this.id) };
    
    BookRecord.find(query)
    .populate({ path: '_book', select: 'name author' })
    .exec(function (err, books) {
        if (err)
            return next(err);
        
        var values = [];
        books.forEach(function (entry) {
            values.push({ 'name': entry._book.name, 'author': entry._book.author })
        }
        );
        
        return next(null, values);
    })
};

customerSchema.post('remove', function (customer) {
    console.log('Customer with id %s has been removed from the db.', customer.id);
    
    var ObjectId = mongoose.Types.ObjectId;
    var query = { _customer: new ObjectId(customer.id) };
    
    BookRecord.find(query)
    .exec(function (err, records) {
        if (err)
            return console.error(err);
        
        records.forEach(function (record) {
            record.remove(function (err, value) {
                if (err)
                    return console.error(err);
                
                console.log("Record for book with id %s has successfully been deleted", record._book);
            });
        });
    });
})

module.exports = mongoose.model('Customer', customerSchema);



