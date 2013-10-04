var test = require("./test")

var csv = require("binary-csv")()
var through2 = require("through2")
var splice = require("stream-splice")
var multibuffer = require("../")

var file = process.argv[2] || "50k.csv"

var rowToMultibuffer = through2(function (row, encoding, callback) {
  var cells = csv.line(row)
  this.push(multibuffer.pack(cells))
  return callback()
})

test(file, splice(csv, rowToMultibuffer))