var net = require('net');
var server = net.createServer();

server.maxConnections=3;


function Data(d) {
    this.data = d;
    this.responded = false;
}

function Client(socket) {
    this.counter = 0;
    this.socket = socket;
    this.t_queue = {};
    // this.w_queue = [];
    this.tmout = null;
}

function controlSocket(client, action, delay) {
    var socket = client.socket;
    var key = socket.remoteAddress + ':' + socket.remotePort;

    if (action === 'pause') {
        socket.pause();
        console.log(key + 'socket paused');
        client.tmout = setTimeout(function () {
            controlSocket(client, 'resume', Math.random() * 3 * 1000);
        }, delay);
    } else if (action === 'resume') {
        socket.resume();
        console.log(key + 'socket resumed');
        client.tmout = setTimeout(function () {
            controlSocket(client, 'pause', Math.random() * 3 * 1000);
        }, delay)
    }
}

Client.prototype.writeData = function (d, id) {
    var socket = this.socket;
    // var w_queue = this.w_queue;
    var t_queue = this.t_queue;

    if (socket.writable) {
        var key = socket.remoteAddress + ':' + socket.remotePort;
        socket.write('[R]' + d, function () {
            delete t_queue[id];
        });

        process.stdout.write(key + '' + socket.bytesWritten + 'bytes Written\n');
    }
};

var clients = {};

server.on('connection', function (socket) {
    var status = server.connections + '/' + server.maxConnections;
    var key = socket.remoteAddress + ':' + socket.remotePort;
    console.log('Connection Start(' + status + ') - ' + key);
    clients[key] = new Client(socket);

    controlSocket(clients[key], 'pause', 10);
});



server.on('connection', function (socket) {
    var data ='';
    var newline = /\r\n|\n/;

    socket.on('data', function (chunk) {
        data += chunk.toString();
        var key = socket.remoteAddress + ':' + socket.remotePort;

        if (newline.test(data)) {
            clients[key].writeData(data);
            process.stdout.write(key + '' + socket.bytesRead + 'bytes Read\n');
            data = '';
        }
/*        function writeDataDelayed(key, d) {
            var client = clients[key];
            var d_obj = new Data(d);
            client.w_queue.push(d_obj);
            var tmout = setTimeout(function () {
                d_obj.responded = true;
                client.writeData(d_obj.data, client.counter);

            }, Math.random() * 10 * 1000);
            client.t_queue[client.counter++] = tmout;
        }
        data += chunk.toString();
        var key = socket.remoteAddress + ':' + socket.remotePort;

        if (newline.test(data)) {
            writeDataDelayed(key, data);
            data = '';
        }*/
    });
});


server.on("connection", function (socket) {
    var key = socket.remoteAddress + ':' + socket.remotePort;

    socket.on('end', function () {
        var status = server.connections + '/' + server.maxConnections;
        console.log('Connection End(' + status + ') - ' + key);

        if (clients[key].tmout) {
            clearTimeout(clients[key].tmout);
        }

        delete clients[key];
    })
});


server.on("close", function () {
    console.log('Server Closed');
});

server.listen(9001, '127.0.0.1', function () {
    var addr = server.address();
    console.log('Listening Start on Server - ' + addr.address + ':' + addr.port);
});


var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);

rl.on("SIGINT", function () {

    for (var i in clients) {
        var socket = clients[i].socket;
        var t_queue = clients[i].t_queue;
        socket.end();

        for (var id in t_queue) {
            clearTimeout(t_queue[id]);
        }
    }

    server.close();
    rl.close();
});
