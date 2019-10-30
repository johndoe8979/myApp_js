var event = require('events');
var util = require('util');

function AsyncEmitter() {
    var self = this;
    process.nextTick(function () {
    self.emit('bar');
    });
}


util.inherits(AsyncEmitter, event.EventEmitter);
var foo = new AsyncEmitter();

foo.on('bar', function () {
    console.log('testmessage!');
});