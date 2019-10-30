var event = require('events');
var emitter = new event.EventEmitter();


var sampleListener = function (arg1) {
    console.log(arg1);
}

emitter.on('occurrence', sampleListener);
emitter.emit('occurrence', 'testmsg!!!');
