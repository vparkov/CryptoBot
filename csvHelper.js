var fs = require('fs');

var newLine = '';
switch(process.platform) {
    case 'linux':
        newLine = '\n';
    case 'win32': 
        newline = '\r\n';
}

function writeToCsv(headers, data, file) {

    var csv = [];
    for(var element in data) {
        csv += newLine + data[element];
    }
    

    fs.stat(file, function (err, stat) {
        if (err == null) {
            fs.appendFileSync(file, csv, function (err) {
                if (err) throw err;
            });
        }
        else {
            fs.writeFileSync(file, headers + newLine, function (err, stat) {
                if (err) throw err;
                console.log('file saved');
            });

            fs.appendFile(file, csv, function (err) {
                if (err) throw err;
            });
        }
    });
    console.log('The "data to append" was appended to file!');
}

module.exports.writeToCsv = writeToCsv;


