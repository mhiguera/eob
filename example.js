const Stream = require('stream');
const eobFactory = require('./index');
 
let stream, pipe;
 
stream = new Stream();
stream.readable = true;
stream.writable = true;
stream.end   = stream.emit.bind(stream, 'end'); 
stream.read  = stream.emit.bind(stream, 'read'); 
stream.write = stream.emit.bind(stream, 'data'); 
 
pipe = stream.pipe(eobFactory('\n', 'GabbaGabbaHey:'));
pipe.on('data', function(d) { console.log(d.toString())  })
 
stream.write('GabbaGabbaHey:Hey\nHo\nLet\'s go!\n');
