var test = require("tape").test

var multibuffer = require("../")

test("init", function (t) {
  t.ok(multibuffer.pack, "has pack()")
  t.ok(multibuffer.unpack, "has unpack()")
  t.end()
})

function bufEquals(b1, b2) {
  if (b1.length != b2.length) return false
  var len = b1.length
  for (var i = 0; i < len; i++) {
    if (b1[i] != b2[i]) return false
  }
  return true
}

test("simple", function (t) {

  var b1 = new Buffer("Hi there")
  var b2 = new Buffer("BYE NOW!!!!!!!!!")

  var input = [b1, b2]

  var expected = Buffer.concat([
    new Buffer([0, 0, 0, 8]),
    b1,
    new Buffer([0, 0, 0, 16]),
    b2
  ])

  var mb = multibuffer.pack(input)
  t.ok(bufEquals(mb, expected), "encoded as expected")

  var unpacked = multibuffer.unpack(mb)
  t.equals(unpacked.length, 2, "got right number of buffers back out")

  t.ok(bufEquals(unpacked[0], b1), "unpacked correctly")
  t.ok(bufEquals(unpacked[1], b2), "unpacked correctly")
  t.end()
})

test("five", function (t) {

  var input = [
    new Buffer("one"),
    new Buffer("two"),
    new Buffer("three"),
    new Buffer("four"),
    new Buffer("five"),
  ]

  var expected = Buffer.concat([
    new Buffer([0, 0, 0, 3]),
    input[0],
    new Buffer([0, 0, 0, 3]),
    input[1],
    new Buffer([0, 0, 0, 5]),
    input[2],
    new Buffer([0, 0, 0, 4]),
    input[3],
    new Buffer([0, 0, 0, 4]),
    input[4],
  ])

  var mb = multibuffer.pack(input)
  t.ok(bufEquals(mb, expected), "encoded as expected")

  var unpacked = multibuffer.unpack(mb)
  t.equals(unpacked.length, 5, "got right number of buffers back out")

  t.ok(bufEquals(unpacked[0], input[0]), "unpacked correctly")
  t.ok(bufEquals(unpacked[1], input[1]), "unpacked correctly")
  t.ok(bufEquals(unpacked[2], input[2]), "unpacked correctly")
  t.ok(bufEquals(unpacked[3], input[3]), "unpacked correctly")
  t.ok(bufEquals(unpacked[4], input[4]), "unpacked correctly")
  t.end()
})

test("empty buffer", function (t) {

  var input = [
    new Buffer("one"),
    new Buffer("two"),
    new Buffer(0),
    new Buffer("four"),
    new Buffer("five"),
  ]

  var expected = Buffer.concat([
    new Buffer([0, 0, 0, 3]),
    input[0],
    new Buffer([0, 0, 0, 3]),
    input[1],
    new Buffer([0, 0, 0, 0]),
    input[2],
    new Buffer([0, 0, 0, 4]),
    input[3],
    new Buffer([0, 0, 0, 4]),
    input[4],
  ])

  var mb = multibuffer.pack(input)
  t.ok(bufEquals(mb, expected), "encoded as expected")

  var unpacked = multibuffer.unpack(mb)
  t.equals(unpacked.length, 5, "got right number of buffers back out")

  t.ok(bufEquals(unpacked[0], input[0]), "unpacked correctly")
  t.ok(bufEquals(unpacked[1], input[1]), "unpacked correctly")
  t.ok(bufEquals(unpacked[2], input[2]), "unpacked correctly")
  t.ok(bufEquals(unpacked[3], input[3]), "unpacked correctly")
  t.ok(bufEquals(unpacked[4], input[4]), "unpacked correctly")
  t.end()
})
