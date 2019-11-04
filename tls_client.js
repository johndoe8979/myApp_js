var tls = require('tls');
var fs = require('fs');


var option = {};
option.host = process.argv[2];
option.port = process.argv[3];


function connectWithoutCA() {
    var cleartext1 = tls.connect(option);
    cleartext1.on('error', function (e) {
        console.log('Failed to connect in cleartext1 - ' +
            option.host +
            ':' +
            option.port);
        console.log(e.message);
    });

    cleartext1.on("secureConnect", function () {
        var cipher = cleartext1.getCipher();
        var cipher_info = cipher.name + '' + cipher.version;
        console.log('cleartext1 Connect - ' + option.host + ':' + option.port + '' + cipher_info);
        console.log('cleartext1 Authorization Result = ' + cleartext1.authorized);
        console.log('cleartext1 Authorization Error = ' + cleartext1.authorizationError);
        cleartext1.write('cleartetx1 : Hello');
        cleartext1.on('data', function (chunk) {
            console.log(chunk.toString());
            cleartext1.end();
        });
    });
}

function connectWithCA() {
    option.ca = fs.readFileSync('server-cert.pem');
    var cleartext2 = tls.connect(option);

    cleartext2.on('error', function (e) {
        console.log('cleartext2 Connection Start - ' + option.host + ':' + option.port);
        console.log(e.message);
    });


    cleartext2.on("secureConnect", function () {
        var cipher = cleartext2.getCipher();
        var cipher_info = cipher.name + '' + cipher.version;

        console.log('cleartext2 Connect - ' + option.host + '' + option.port + cipher_info);
        console.log('cleartext2 Authorization Result = ' + cleartext2.authorized);
        console.log('cleartext2 Authorization Error = ' + cleartext2.authorizationError);
        cleartext2.write('cleartext2 Hello');
        cleartext2.on('data', function (chunk) {
            console.log(chunk.toString());
            cleartext2.end();
        });

        cleartext2.on('end', function (had_error) {
            console.log('cleartext2 Connect End - ' + option.host + '' + option.port);
        });
    });
}

connectWithoutCA();
connectWithCA();


