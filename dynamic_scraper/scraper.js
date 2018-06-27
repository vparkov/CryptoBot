var casper = require('casper').create();
var fs = require('fs');
var config = require('config')

var fileName = getHostName(config.domain) + '-' + config.currency + '.csv';

function getHostName(url) {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
    return match[2];
    }
    else {
        return null;
    }
}

var headers = [
    'timestamp',
    'price'
];

var OsNewLineSeparators = {
    'linux': '\n',
    'windows': '\r\n'
};


for (var os in OsNewLineSeparators) {
    var file = fs.workingDirectory + fs.separator + os + fs.separator + fileName;
    if (!fs.exists(file)) {
        fs.write(file, headers, 'a');
    }
}

casper.start(config.domain);


casper.then(function () {
    console.log('Page Loaded')
    this.waitForSelector(config.selector, function() {
        
        for(var i = 0; i < 1000; i++) {    //to do somehow make it infinate loop (this.step = 4 :DDD)          
            this.wait(config.scrapeIntervalMS, function() {
                price = this.evaluate(function (selector) {
                    var elements = document.querySelectorAll(selector);
                    return Array.prototype.map.call(elements, function (e) {
                        return e.innerHTML
                    });
                }, {selector: config.selector});

                var date = new Date();
                console.log(price, date.getTime())
                for (var os in OsNewLineSeparators) {
                    var file = fs.workingDirectory + fs.separator + os + fs.separator + fileName;
                    fs.write(file, OsNewLineSeparators[os] + [price, date.getTime()], 'a');            
                }
            });
        }
    })
});

casper.run();

