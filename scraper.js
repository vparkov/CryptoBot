const request = require('request');
const fs = require('fs');
const readLastLines = require('read-last-lines');

var newLine = '';
switch(process.platform) {
    case 'linux':
        newLine = '\n';
    case 'win32': 
        newline = '\r\n';
}

var headers = [
    'openTime', 
    'closeTime',
    'open',
    'high',
    'low',
    'close',
    'volume',
    'quoteAssetVolume',
    'numberOfTrades',
    'takerBuyBaseAssetVolume',
    'takerBuyQuoteAssetVolume',
    'ignore'
];
const BINANCE_MAXIMUM_RETURNED_ENTRIES = 500;
const MAX_NUMBER_REQUESTS = 1200; 

var currency = 'ETHUSDT';
var defaultOpenTime = '1501942400'; // 05/08/2017, 17:13:20

var file = __dirname + '/' + currency  + '.csv';

function scrape(outputFile, lastOpenTime = null, numberOfRequests = 0, resultsOfLastRequest = 500) {
    console.log('===length====')
    console.log(resultsOfLastRequest);
    if (numberOfRequests > MAX_NUMBER_REQUESTS || resultsOfLastRequest < BINANCE_MAXIMUM_RETURNED_ENTRIES) {
        //stop the loop
        console.log('Number of requests: ' + (numberOfRequests - 1) );
        console.log('Last request had: ' + resultsOfLastRequest + ' results')
        console.log(
            'Less than 500(the maximum results of the API) new results OR maximum number of requests reached. Aborting'
        );
        return;
    }

    var api_endpoint = 'https://api.binance.com/api/v1/klines';
    var params = '?symbol=' + currency + '&interval=1m&limit=500&startTime=';
    lastOpenTime = parseInt(lastOpenTime);
    params += lastOpenTime ? (lastOpenTime + 1) : defaultOpenTime; 

    request(api_endpoint + params, function (error, response, body) {
        console.log('request ', numberOfRequests);
        
        var parsed = JSON.parse(body);
        var lastOpenTime;
        // console.log('===length====')
        // console.log(parsed.length);
        for(var element in parsed) {
            lastOpenTime = parsed[element][0];
            fs.appendFile(outputFile, newLine + parsed[element], function (err) {
                if (err) throw err;
            });
        }
        scrape(file, lastOpenTime, ++numberOfRequests, parsed.length)
    });
}

// //for csv
fs.stat(file, function (err, stat) {
    if (err == null) {
        //file exists, get last open time and scrape at will
        readLastLines.read(file, 1)
            .then((lines) => {
                var firstElement = lines.substr(0, lines.indexOf(',')); 
                lastOpenTime = (firstElement !== 'openTime') ? firstElement : null;
                console.log('Last Open Time: ' +  lastOpenTime);
                scrape(file, lastOpenTime);
            })
            .catch((err) => {
                console.log(err);
            });
    }
    else {
        //create file and start scraping without initial open time
        console.log('Creating CSV And Setting Headers');
        fs.writeFileSync(file, headers, function (err, stat) {
            if (err) throw err;
        });
        scrape(file);
    }
});
