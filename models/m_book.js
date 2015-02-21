var mongoose = require('mongoose');
var BookRecord = require('./m_bookrecord.js');

var bookSchema = new mongoose.Schema({    
    name: { type: String, trim: true, required: true },
    author: { type: String, trim: true }
});

bookSchema.methods.customers = function(next) {
    
    var ObjectId = mongoose.Types.ObjectId;
    var query = { _book: new ObjectId(this.id) };
    
    BookRecord.find(query)
    .populate({ path: '_customer', select: 'name' })
    .exec(function (err, customers) {
        if (err)
            return next(err);
        
        var values = [];
        customers.forEach(function (entry) {
            values.push({ 'name': entry._customer.name })          
        });
        
        return next(null, values);       
    })
}

bookSchema.post('remove', function (book) {
    console.log('Book with id %s has been removed from the db.', book.id);
    
    var ObjectId = mongoose.Types.ObjectId;
    var query = { _book: new ObjectId(book.id) };
    
    BookRecord.find(query)
    .exec(function (err, records) {
        if (err)
            return console.error(err);
        
        records.forEach(function (record) {
            
            record.remove(function (err, value) {
                if (err)
                    return console.error(err);
                
                console.log("Book record for customer with id %s has successfully been deleted.", record._customer);
            });
        });
    });
})

module.exports = mongoose.model('Book', bookSchema);


