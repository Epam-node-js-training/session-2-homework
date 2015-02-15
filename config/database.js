var Sequelize = require('sequelize'), 
    sequelize = new Sequelize('nodejs_training', 'nodejs', 'nodejs', {
      dialect: "postgres", // or 'sqlite', 'postgres', 'mariadb'
      port:    5432, // or 5432 (for postgres)
    })
 
sequelize
  .authenticate()
  .complete(function(err) {
    if (!!err) {
      console.log('Unable to connect to the database:', err)
    } else {
      console.log('Connection has been established successfully.')
    }
  })

var Book = sequelize.define('Book', {
    author: Sequelize.STRING,
    title: Sequelize.STRING
  }, {
    timestamps: false
  })

var Customer = sequelize.define('Customer', {
    name: Sequelize.STRING
  }, {
    timestamps: false
  })

Book.hasMany(Customer)
Customer.hasMany(Book)

// Book.create({author: 'Author 1', title: 'Book #1'})
// Book.create({author: 'Author 2', title: 'Book #2'})
// Book.create({author: 'Author 3', title: 'Book #3'})
// Customer.create({name: 'Customer #1'})
// Customer.create({name: 'Customer #2'})
// Customer.create({name: 'Customer #3'})

// Creates representation of the model in DB
sequelize
  // Please note, that { force: true } will remove all existing tables and re-create them afterwards
  .sync({ force: false /*true|false*/ })
  .complete(function(err) {
     if (!!err) {
       console.log('An error occurred while creating the table:', err)
     } else {
       console.log('It worked!')
     }
  })

module.exports.sequelize = sequelize
module.exports.Book = Book
module.exports.Customer = Customer
