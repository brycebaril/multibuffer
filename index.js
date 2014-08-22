module.exports.encode = encode
module.exports.pack = pack
module.exports.unpack = unpack
module.exports.readPartial = readPartial

var varint = require("varint")
var vencode = varint.encode
var vdecode = varint.decode

/**
 * Encode a buffer with a varint prefix containing the buffer's length.
 * @param  {Buffer} buffer The buffer to encode
 * @param  {int} extra How many extra empty leading bytes to put in the buffer
 * @return {Buffer}        An encoded buffer longer than before.
 */
function encode(buffer, extra) {
  if (!extra) extra = 0
  var blen = buffer.length
  var lenbytes = vencode(blen)
  var mb = new Buffer(extra + blen + lenbytes.length)
  for (var i = 0; i < lenbytes.length; i++) {
    mb.writeUInt8(lenbytes[i], extra + i)
  }
  buffer.copy(mb, lenbytes.length + extra, 0, blen)
  return mb
}

/**
 * Combine an array of buffers into a single buffer encoded such that they can all be extracted again.
 * @param  {Array[Buffer]} buffs An array of Buffers
 * @param  {int} extra How many extra empty leading bytes to put in each buffer
 * @return {Buffer}       A single buffer that is an encoded concatentation of buffs
 */
function pack(buffs, extra) {
  var lengths = [],
      lenbytes = [],
      len = buffs.length,
      extra = extra || 0,
      sum = 0,
      offset = 0,
      mb,
      i

  for (i = 0; i < len; i++) {
    lengths.push(buffs[i].length)
    lenbytes.push(vencode(lengths[i]))
    sum += lengths[i] + lenbytes[i].length + extra
  }

  mb = new Buffer(sum)
  for (i = 0; i < len; i++) {
    for (var j = 0; j < lenbytes[i].length; j++) {
      mb.writeUInt8(lenbytes[i][j], offset + extra)
      offset = offset + 1 + extra
    }
    buffs[i].copy(mb, offset, 0, lengths[i])
    offset += lengths[i]
  }
  return mb
}

/**
 * Split an encoded multibuffer into the original buffers
 * @param  {Buffer} multibuffer An encoded multibuffer
 * @return {Array[Buffer]}             The encoded Buffers
 */
function unpack(multibuffer) {
  var buffs = []
  var offset = 0
  var length

  while (offset < multibuffer.length) {
    length = vdecode(multibuffer.slice(offset))
    offset += vdecode.bytes
    buffs.push(multibuffer.slice(offset, offset + length))
    offset += length
  }

  return buffs
}

/**
 * Fetch the first encoded buffer from a multibuffer, and the rest of the multibuffer.
 * @param  {Buffer} multibuffer An encoded multibuffer.
 * @return {Array}            [Buffer, Buffer] where the first buffer is the first encoded buffer, and the second is the rest of the multibuffer.
 */
function readPartial(multibuffer) {
  var dataLength = vdecode(multibuffer)
  var read = vdecode.bytes
  if (multibuffer.length < read + dataLength) return [null, multibuffer]
  var first = multibuffer.slice(read, read + dataLength)
  var rest = multibuffer.slice(read + dataLength)
  if (rest.length === 0) rest = null
  return [first, rest]
}
