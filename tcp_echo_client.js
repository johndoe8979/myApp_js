//モジュール読込
var net = require('net');
var readline = require('readline');
require('date-utils');

var dt = new Date();
var formatted = dt.toFormat("YYYY-MM-DD HH24:MM:SS");

//変数設定
var rl = readline.createInterface(process.stdin, process.stdout);
var opitions = {};
opitions.host = process.argv[2];
opitions.port = process.argv[3];

var client = net.connect(opitions);


//イベント定義
client.on('error', function (e) {
    console.error('Connection Failed - ' + opitions.host + ':' + opitions.port);
    console.error(e.message);
});

client.on('connect', function () {
    console.log('Connected - ' + opitions.host + ':' + opitions.port);
});

rl.on('SIGINT', function () {
    console.log('Connection Closed - ' + opitions.host + ':' + opitions.port);
    client.end();
    rl.close();
});

//メイン処理
var count = 0;
client.setTimeout(1000);

client.on('timeout', function () {
    var str = count + ' : '  + formatted + ' : TEST MESSAGES \n';;
    process.stdout.write('[S]' + str);
    client.write(str);
    count = count + 1;
});

client.on('data', function (chunk) {
    process.stdout.write(chunk.toString());
});

client.on("end", function (had_error) {
    client.setTimeout(0);
    console.log('Connection End -' + opitions.host + ':' + opitions.port);
});

client.on('close', function () {
    console.log('Client Close');
    rl.close();
});