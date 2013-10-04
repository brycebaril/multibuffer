var test = require("./test")

var csv = require("binary-csv")()
var through2 = require("through2")
var splice = require("stream-splice")

var rowToMultibuffer = through2(function (row, encoding, callback) {
  var cells = csv.line(row)
  this.push(row)
  return callback()
})

test("50k.csv", splice(csv, rowToMultibuffer))