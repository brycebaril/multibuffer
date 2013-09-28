module.exports.pack = pack
module.exports.unpack = unpack

var bops = require("bops")

function encode(buffer) {
  var meta = bops.create(4)
  bops.writeUInt32BE(meta, buffer.length, 0)
  return Buffer.concat([meta, buffer])
}

/**
 * Combine an array of buffers into a single buffer encoded such that they can all be extracted again.
 * @param  {Array[Buffer]} buffs An array of Buffers
 * @return {Buffer}       A single buffer that is an encoded concatentation of buffs
 */
function pack(buffs) {
  return bops.join(buffs.map(encode))
}

/**
 * Split an encoded multibuffer into the original buffers
 * @param  {Buffer} multibuffer An encoded multibuffer
 * @return {Array[Buffer]}             The encoded Buffers
 */
function unpack(multibuffer) {
  var buffs = []
  var offset = 0
  while (offset < multibuffer.length) {
    var length = bops.readUInt32BE(multibuffer, offset)
    offset += 4
    buffs.push(bops.subarray(multibuffer, offset, offset + length))
    offset += length
  }
  return buffs
}