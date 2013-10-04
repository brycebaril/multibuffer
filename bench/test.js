module.exports = test

var fs = require("fs")
var through2 = require("through2")
var devnull = require("terminus").devnull

function test(file, transform) {
  var chunks = 0
  var bytes = 0
  var start = Date.now()

  var fileStream = fs.createReadStream(file)

  var spy = through2(function (chunk, encoding, callback) {
    chunks++
    bytes += chunk.length
    return callback(null, chunk)
  }, function (callback) {
    var elapsed = Date.now() - start
    console.log("%s bytes in %s chunks in %s ms", bytes, chunks, elapsed)
  })

  fileStream
    .pipe(transform)
    .pipe(spy)
    .pipe(devnull())
}