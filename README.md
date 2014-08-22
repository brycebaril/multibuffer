multibuffer
=====

[![NPM](https://nodei.co/npm/multibuffer.png)](https://nodei.co/npm/multibuffer/)

Package Arrays of Buffers into a single buffer that they can be later unpacked from.

One place this library can be useful is if you want to stream tuples of Buffer data without entering an objectMode stream.

Each input buffer is prefixed with a [varint](https://npmjs.org/package/varint) prefix encoding how long the buffer is. The resulting buffer is the same length as all the concatenated buffers, plus a few bytes per buffer for the encodings.

Because encoding is at the beginning and varints can be consumed without back-tracking, this encoding is safe to nest upon itself.

```javascript
var multibuffer = require("multibuffer")

var input = [
  new Buffer("Hi there"),
  new Buffer("BYE NOW!!!!!!!!!")
]

/*
[ <Buffer 48 69 20 74 68 65 72 65>,
  <Buffer 42 59 45 20 4e 4f 57 21 21 21 21 21 21 21 21 21> ]
 */

var packed = multibuffer.pack(input)

/*
<Buffer 08 48 69 20 74 68 65 72 65 10 42 59 45 20 4e 4f 57 21 21 21 21 21 21 21 21 21>
 */

var unpacked = multibuffer.unpack(packed)
/*
[ <Buffer 48 69 20 74 68 65 72 65>,
  <Buffer 42 59 45 20 4e 4f 57 21 21 21 21 21 21 21 21 21> ]
 */
```

API
===

`.pack(buffers, extra)`
---

Pack the `Array[Buffer] buffers` into a single encoded Buffer. `extra` is an optional integer specifying how many leading empty bytes to leave in the returned Buffer.

`.unpack(multibuffer)`
---

Unpack the `Array[Buffer] buffers` that were encoded into the multibuffer.

`.encode(buffer, extra)`
---

Encode a single buffer. `extra` is an optional integer specifying how many leading empty bytes to leave in the returned Buffer.

`.readPartial(multibuffer)`
---

Attempt to read the first encoded buffer from a multibuffer. Will return a two-element array of `[Buffer, Buffer]` which is `[firstBuffer, rest]`. If the multibuffer is incomplete, it will return `[null, multibuffer]` where the second element is the passed incomplete multibuffer.

NOTES
===

This library currently only supports packing buffers that are each a maximum of 4294967295 octets. My guess is you'll have memory issues before this is a bottleneck.

LICENSE
=======

MIT
