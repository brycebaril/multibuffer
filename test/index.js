var test = require("tape").test

var multibuffer = require("../")

test("init", function (t) {
  t.ok(multibuffer.pack, "has pack()")
  t.ok(multibuffer.unpack, "has unpack()")
  t.ok(multibuffer.encode, "has encode()")
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

test("encode", function (t) {
  var input = new Buffer("Hi there")
  var inputMeta = new Buffer(1)
  inputMeta[0] = 8
  var expected = Buffer.concat([inputMeta, input])

  t.ok(bufEquals(multibuffer.encode(input), expected))
  t.end()
})

test("simple", function (t) {

  var b1 = new Buffer("Hi there")

  var b1l = new Buffer(1)
  b1l[0] = 8

  var b2 = new Buffer("BYE NOW!!!!!!!!!")

  var b2l = new Buffer(1)
  b2l[0] = 16

  var input = [b1, b2]

  var expected = Buffer.concat([
    b1l,
    b1,
    b2l,
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

test("nested multibuffer", function (t) {
  var input = new Buffer("Nested")

  var layerOne = multibuffer.encode(input)
  var layerTwo = multibuffer.encode(layerOne)

  t.equals(layerOne.length, 7)
  t.equals(layerTwo.length, 8)
  t.ok(bufEquals(multibuffer.unpack(multibuffer.unpack(layerTwo)[0])[0], input), "Got nested buffer out")

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

  var lengths = [
    new Buffer(1),
    new Buffer(1),
    new Buffer(1),
    new Buffer(1),
    new Buffer(1)
  ]
  lengths[0][0] = 3
  lengths[1][0] = 3
  lengths[2][0] = 5
  lengths[3][0] = 4
  lengths[4][0] = 4

  var expected = Buffer.concat([
    lengths[0],
    input[0],
    lengths[1],
    input[1],
    lengths[2],
    input[2],
    lengths[3],
    input[3],
    lengths[4],
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

  var lengths = [
    new Buffer(1),
    new Buffer(1),
    new Buffer(1),
    new Buffer(1),
    new Buffer(1)
  ]
  lengths[0][0] = 3
  lengths[1][0] = 3
  lengths[2][0] = 0
  lengths[3][0] = 4
  lengths[4][0] = 4

  var expected = Buffer.concat([
    lengths[0],
    input[0],
    lengths[1],
    input[1],
    lengths[2],
    input[2],
    lengths[3],
    input[3],
    lengths[4],
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

test("readPartial", function (t) {
  var input = [
    new Buffer("one"),
    new Buffer("two"),
    new Buffer(0),
    new Buffer("four"),
    new Buffer("five"),
  ]

  var mb = multibuffer.pack(input)
  var partial = multibuffer.readPartial(mb)

  t.ok(bufEquals(partial[0], input[0]))
  partial = multibuffer.readPartial(partial[1])

  t.ok(bufEquals(partial[0], input[1]))
  partial = multibuffer.readPartial(partial[1])

  t.ok(bufEquals(partial[0], input[2]))
  partial = multibuffer.readPartial(partial[1])

  t.ok(bufEquals(partial[0], input[3]))
  partial = multibuffer.readPartial(partial[1])

  t.ok(bufEquals(partial[0], input[4]))
  t.equals(partial[1], null)
  t.end()
})

test("readPartial incomplete", function (t) {
  var fakeMultibuffer = new Buffer(3)
  fakeMultibuffer[0] = 10
  var partial = multibuffer.readPartial(fakeMultibuffer)
  t.notOk(partial[0])
  t.equals(fakeMultibuffer, partial[1])
  t.end()
})

test('encode w/ 10 extra leading bytes', function(t) {
  var input = new Buffer("hello")
  var extra = 10
  var encoded = multibuffer.encode(input, extra)
  t.equals(encoded.length, 6 + extra, 'length is +' + extra)
  t.equals(encoded[extra + 1], 104, 'h exists in correct place')
  t.end()
})

test('pack w/ 10 extra leading bytes', function(t) {
  var buffs = [new Buffer('hello'), new Buffer('world')]
  var extra = 10
  var encoded = multibuffer.pack(buffs, extra)
  t.equals(encoded.length, (6 + extra) * 2, 'length is correct')
  t.equals(encoded[extra + 1], 104, 'h exists in correct place')
  t.equals(encoded[extra + 1 + 5 + extra + 1], 119, 'w exists in correct place')
  t.end()
})
