module.exports.encode = encode
module.exports.pack = pack
module.exports.unpack = unpack
module.exports.readPartial = readPartial

var bops = require("bops")
var encode = require('varint/encode')
var Decoder = require('varint/decode')

/**
 * Encode a buffer witha 4-byte prefix containing the buffer's length.
 * @param  {Buffer} buffer The buffer to encode
 * @return {Buffer}        An encoded buffer exactly 4 bytes longer than before.
 */
function encode(buffer) {
  var blen = buffer.length
  var lenbytes = encode(blen)
  var mb = bops.create(blen + lenbytes.length)
  for (var i = 0; i < lenbytes.length; i++) bops.writeUInt8(mb, lenbytes[i], i)
  bops.copy(buffer, mb, lenbytes.length, 0, blen)
  return mb
}

/**
 * Combine an array of buffers into a single buffer encoded such that they can all be extracted again.
 * @param  {Array[Buffer]} buffs An array of Buffers
 * @return {Buffer}       A single buffer that is an encoded concatentation of buffs
 */
function pack(buffs) {
  var lengths = [],
      lenbytes = [],
      len = buffs.length,
      sum = 0,
      offset = 0,
      mb,
      i

  for (i = 0; i < len; i++) {
    lengths.push(buffs[i].length)
    lenbytes.push(encode(lengths[i]))
    sum += lengths[i] + lenbytes[i].length
  }

  mb = bops.create(sum)
  for (i = 0; i < len; i++) {
    for (var j = 0; j < lenbytes[i].length; j++) {
      bops.writeUInt8(mb, lenbytes[i][j], offset)
      offset++
    }
    bops.copy(buffs[i], mb, offset, 0, lengths[i])
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
  var vi = new Decoder()
  var inLength = true
  var length
  vi.ondata = function(num) {
    length = num
    inLength = false
  }

  while (offset < multibuffer.length) {
    if (inLength) {
      var bit = bops.readUInt8(multibuffer, offset)
      vi.write(bit)
      offset++
    } else {
      buffs.push(bops.subarray(multibuffer, offset, offset + length))
      offset += length
      inLength = true
    }
  }
  
  return buffs
}

/**
 * Fetch the first encoded buffer from a multibuffer, and the rest of the multibuffer.
 * @param  {Buffer} multibuffer An encoded multibuffer.
 * @return {Array}            [Buffer, Buffer] where the first buffer is the first encoded buffer, and the second is the rest of the multibuffer.
 */
function readPartial(multibuffer) {
  var length = multibuffer.length
  if (length < 4)
    return [null, multibuffer]
  var encodedLength = bops.readUInt32BE(multibuffer, 0)
  if (length < 4 + encodedLength)
    return [null, multibuffer]

  var encoded = bops.subarray(multibuffer, 4, 4 + encodedLength)
  if (length == 4 + encodedLength)
    return [encoded, null]

  var rest = bops.subarray(multibuffer, 4 + encodedLength)
  return [encoded, rest]
}