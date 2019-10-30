var http = require('http');
http.createServer(function (req, res) {
    var num = parseInt(req.url.slice(1));
    if (isNaN(num)){
        res.end();
        return;
    }
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('fib(' + num + ')=' + fib(num));
}).listen(9000, );
console.log('Server running');

function fib(n) {
    if (n === 0 || n === 1) return n;
    return fib(n - 1) + fib(n - 2);
}