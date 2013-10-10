var mb = require('../')

x = [new Buffer('hello this is really long'), new Buffer('bar')]
console.log(x)
var packed = mb.pack(x)
var unpacked = mb.unpack(packed)
console.log(unpacked)