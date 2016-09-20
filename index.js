'use strict'
const Stream = require('stream');

function sliceLeft(chunk, test) {
  let chunkLength = chunk.length,
      testLength = test.length,
      sliced;
  
  if (chunkLength < testLength) return;
  sliced = chunk.slice(0, testLength);
  if (Buffer.compare(sliced, test)) return false;
  return chunk.slice(testLength, chunkLength);
}

function sliceRight(chunk, test) {
  let chunkLength = chunk.length,
      testLength = test.length,
      sliced;
  
  if (chunkLength < testLength) return;
  sliced = chunk.slice(chunkLength - testLength, chunkLength);
  if (Buffer.compare(sliced, test)) return false;
  return chunk.slice(0, chunkLength - testLength);
}

function splitBuffer(buff, separator) {
  if (!Buffer.isBuffer(separator)) separator = Buffer.from(separator);
  let sl = separator.length, idx, arr = [];
  while (~(idx = buff.indexOf(separator))) {
    arr.push(buff.slice(0, idx));
    buff = buff.slice(idx + sl, buff.length);
  }
  arr.push(buff);
  return arr;
}

module.exports = function createStream(eob, handshake) {
  let start, splitted, cleanCut,
      buff = new Buffer(0),
      stream = new Stream(),
      needsHandshake = !!handshake;
  
  eob = eob || new Buffer('\n');
  if (!Buffer.isBuffer(handshake)) handshake = Buffer.from(handshake);
  if (!Buffer.isBuffer(eob)) eob = Buffer.from(eob);

  stream.readable = true;
  stream.writable = true;
  stream.end = stream.emit.bind(stream, 'end');
  stream.write = function(raw) {
    if (!Buffer.isBuffer(raw)) raw = Buffer.from(raw);
    buff = Buffer.concat([buff, raw]);
    if (needsHandshake) {
      start = sliceLeft(buff, handshake);
      if (!start) return this.emit('finish');
      needsHandshake = false;
      buff = start;
    }
    if (!~buff.indexOf(eob)) return;
    cleanCut = sliceRight(buff, eob);
    splitted = splitBuffer(cleanCut || buff, eob)
    splitted.forEach(this.emit.bind(this, 'data'));
    buff = cleanCut || new Buffer(0);
  }
  return stream;
}
