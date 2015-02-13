var express = require('express')
var app = express()
var db = require('./config/database')

// db.sequelize
//   .authenticate()
//   .complete(function(err) {
//     if (!!err) {
//       console.log('err:', err)
//     } else {
//       console.log('OK!!!')
//     }
//   })

app.get('/', function (req, res) {
  res.send('Hello World!')
})

var server = app.listen(8080, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})

app.get('/books', function(req, resp) {
  db.Book.findAndCountAll().then(function(books) {
    if (books.count) {
      // books.rows - read each row in Array
      resp.send(books)
    }
    else {
      resp.send('There are no books in library.')
    }
  })
})