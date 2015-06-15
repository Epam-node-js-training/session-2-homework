var mysql = require('mysql');
var Sequelize = require('sequelize');
var sequelize = new Sequelize('test-2', 'root', 'admin', {
    host: "localhost",
    port: 3306
})
sequelize.sync({
    force: false
});

//Book entity
var Book = sequelize.define('Book', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        title: Sequelize.STRING,
        author: Sequelize.STRING
    },
    {
        timestamps: false,
        tableName: 'Book'
    })

var Customer = sequelize.define('Customer', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        name: Sequelize.STRING
    },
    {
        timestamps: false,
        tableName: 'Customer'
    })
Customer.hasMany(Book,{foreignKey : 'customer_id', onDelete: 'SET NULL'});
Book.belongsTo(Customer,{foreignKey : 'customer_id'});

module.exports.Book=Book;
module.exports.Customer=Customer;