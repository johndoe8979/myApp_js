var http = require('http');

var server = http.createServer(function () {

});

server.listen(9000, function () {
    server.close();
});