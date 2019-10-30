var path = require('path'),
    fs = require('fs')

var inputPath = path.join(__dirname, 'test.txt');
var outputPath = path.join(__dirname, 'output.txt');

function inputStream(inputPath) {

    var readStream = fs.createReadStream(inputPath);

    readStream.setEncoding('utf8');
    readStream.on('data', function (date) {
        console.log(date);
    });
    readStream.on('end', function () {
        console.log('end');
    });
    readStream.on('error', function (err) {
        /*console.log(err);*/
        console.log('An error occured');
    });
}

function writeStream(outputPath) {

    var writeStream = fs.createWriteStream(outputPath);

    writeStream.write('hello');
    writeStream.end();

    writeStream.on('error', function () {
        console.log('An error occured!!!');
    });

    writeStream.on('close', function () {
        console.log('write stream closed');
    });
}

inputStream(inputPath);
writeStream(outputPath);
