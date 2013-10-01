multibuffer
=====

[![NPM](https://nodei.co/npm/multibuffer.png)](https://nodei.co/npm/multibuffer/)

[![david-dm](https://david-dm.org/brycebaril/multibuffer.png)](https://david-dm.org/brycebaril/multibuffer/)
[![david-dm](https://david-dm.org/brycebaril/multibuffer/dev-status.png)](https://david-dm.org/brycebaril/multibuffer#info=devDependencies/)

Package Arrays of Buffers into a single buffer that they can be later unpacked from.

One place this library can be useful is if you want to stream tuples of Buffer data without entering an objectMode stream.

The encoding it uses is very simple, it prepends each input Buffer with 4 bytes storing the length of the buffer, then concatenates all those together. The resulting buffer is thus the same length as all your buffers concatenated, plus 4 bytes per input buffer.

Because the encoding is a fixed-width prefix, this encoding is safe to nest upon itself.

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
<Buffer 00 00 00 08 48 69 20 74 68 65 72 65 00 00 00 10 42 59 45 20 4e 4f 57 21 21 21 21 21 21 21 21 21>
 */

var unpacked = multibuffer.unpack(packed)
/*
[ <Buffer 48 69 20 74 68 65 72 65>,
  <Buffer 42 59 45 20 4e 4f 57 21 21 21 21 21 21 21 21 21> ]
 */
```

API
===

`.pack(buffers)`
---

Pack the `Array[Buffer] buffers` into a single encoded Buffer.

`.unpack(multibuffer)`
---

Unpack the `Array[Buffer] buffers` that were encoded into the multibuffer.

`.encode(buffer)`
---

Encode a single buffer.

`.readPartial(multibuffer)`
---

Attempt to read the first encoded buffer from a multibuffer. Will return a two-element array of `[Buffer, Buffer]` which is `[firstBuffer, rest]`. If the multibuffer is incomplete, it will return `[null, multibuffer]` where the second element is the passed incomplete multibuffer.

NOTES
===

This library currently only supports packing buffers that are each a maximum of 4294967295 octets. My guess is you'll have memory issues before this is a bottleneck.

LICENSE
=======

MIT
