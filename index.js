module.exports.encode = encode
module.exports.pack = pack
module.exports.unpack = unpack
module.exports.readPartial = readPartial

var bops = require("bops")

/**
 * Encode a buffer witha 4-byte prefix containing the buffer's length.
 * @param  {Buffer} buffer The buffer to encode
 * @return {Buffer}        An encoded buffer exactly 4 bytes longer than before.
 */
function encode(buffer) {
  var blen = buffer.length
  var meta = _meta(blen)
  return bops.join([meta, buffer], 4 + blen)
}

function _meta(blen) {
  var meta = bops.create(4)
  bops.writeUInt32BE(meta, blen, 0)
  return meta
}

/**
 * Combine an array of buffers into a single buffer encoded such that they can all be extracted again.
 * @param  {Array[Buffer]} buffs An array of Buffers
 * @return {Buffer}       A single buffer that is an encoded concatentation of buffs
 */
function pack(buffs) {
  var lengths = [],
      blen,
      len = buffs.length,
      sum = 0,
      offset = 0,
      mb

  for (var i = 0; i < len; i++) {
    blen = buffs[i].length
    sum += blen + 4
    lengths.push(blen)
  }

  mb = bops.create(sum)
  for (var i = 0; i < len; i++) {
    blen = lengths[i]
    bops.writeUInt32BE(mb, blen, offset)
    offset += 4
    bops.copy(buffs[i], mb, offset, 0, blen)
    offset += blen
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
  while (offset < multibuffer.length) {
    var length = bops.readUInt32BE(multibuffer, offset)
    offset += 4
    buffs.push(bops.subarray(multibuffer, offset, offset + length))
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