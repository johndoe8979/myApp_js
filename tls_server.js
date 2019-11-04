var tls = require('tls');
var fs = require('fs');
var readline = require('readline');

var server = tls.createServer({
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-cert.pem')
});

server.maxConnections = 3;

function Client(cleartextStream) {
    this.cleartextStream = cleartextStream;
}

Client.prototype.WriteData = function (d) {
    var cleartextStream = this.cleartextStream;
    if (cleartextStream.writable) {
        var key = cleartextStream.remoteAddress + ':' + cleartextStream.remotePort;
        console.log('[' + key + ']' + '-' + d.toString());
        cleartextStream.write(d);
    }
};

var clients = {};

server.on("secureConnection", function (cleartextStream) {
    var status = server.connections + '/' + server.maxConnections;
    var key = cleartextStream.remoteAddress + ':' + cleartextStream.remotePort;
    var cipher = cleartextStream.getCipher();
    var cipher_info = cipher.name + '' + cipher.version;
    console.log('Start TLS connection(' + status + ')-' + key + '' + cipher_info);
    clients[key] = new Client(cleartextStream);
    cleartextStream.on('error', function (e) {
        console.log(e.message);
    })
});


server.on("secureConnection", function (cleartextStream) {
    cleartextStream.on('data', function (chunk) {
        var key = cleartextStream.remoteAddress + ':' + cleartextStream.remotePort;
        clients[key].WriteData(chunk);
    })
});


server.on("secureConnection", function (cleartextStream) {
    var key = cleartextStream.remoteAddress + ':' + cleartextStream.remotePort;

    cleartextStream.on('end', function () {
        var status = server.connections + '/' + server.maxConnections;
        console.log('TLS connection End(' + status + ')-' + key);
        delete clients[key];
    })
});

server.listen(9001, function () {
    var addr = server.address();
    console.log('Listening Start on TLS Server-' + addr.address + ':' + addr.port);
});

server.on('close', function () {
    console.log('TLS Server End');
});

var rl = readline.createInterface(process.stdin, process.stdout);
rl.on("SIGINT", function () {
    for (var i in clients) {
        var cleartextStream = clients[i].cleartextStream;
        cleartextStream.end();
    }
    server.close();
    rl.close();
});





