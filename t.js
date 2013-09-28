var multibuffer = require("./")

var input = [new Buffer("Hi there"), new Buffer("BYE NOW!!!!!!!!!")]

console.log(input)

var mb = multibuffer.pack(input)

console.log(mb)

var out = multibuffer.unpack(mb)

console.log(out)