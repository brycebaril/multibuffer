var test = require("./test")

var through2 = require("through2")

var file = process.argv[2] || "50k.csv"

var raw = through2(function (chunk, encoding, callback) {
  return callback(null, chunk)
})

test(file, raw)