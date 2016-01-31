/**
 * Sample node.js website with chat
 * promise approach
 * 
 * @author Rahul P R
 * @date 27/01/2016
 */

var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var formidable = require('formidable');
var request = require('request');
var PORT = 3035;

var server = http.createServer(reqHandler);

server.listen(PORT, function () {
    console.log('Server running at ' + PORT);
}).on('error', function (err) {
    console.log(err);
});


// chat part

var io = require('socket.io')(server);

io.on("connection", function (socket) {
    console.log("Client socket: " + socket.client.id + " connected");
    socket.on('chat client', function (msgClient) {
        // got message from browser
        // send msg back to all browser clients
        io.emit('chat server', msgClient);
    });
});



// catch all uncaught exceptions
process.on('uncaughtException', function (err) {
    console.log(err);
});



// function part

function fileExist(filePath) {
    // promise
    return new Promise(function (resolve, reject) {
        fs.exists(filePath, function (exists) {
            return exists ? resolve('got file') : reject('Page not exists');
        });
    });
}

function readFile(filePath) {
    // promise
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, function (err, pageData) {
            if (err) {
                return reject(err);
            } else {
                return resolve(pageData);
            }
        });
    });
}

function renderPage(res, page) {
    var viewPage = page === '/' ? 'home' : page; // set default page
    var filePath = 'views/' + viewPage + '.html';

    fileExist(filePath).then(function () {
        return readFile(filePath); // used return to pass data to next promise
    }).then(function (pageData) { //  pageData = output from readFile
        res.writeHead(200, {'Content-Type': 'text/html'}); // 200 show page
        res.write(pageData);
        res.end();
    }).catch(function (err) {
        res.end(err);
    });
}


function reqHandler(req, res) {
    var query = url.parse(req.url, true).query;
    var pathname = url.parse(req.url).pathname;

    if (req.method === 'GET') {

        renderPage(res, pathname);

    } else if (req.method === 'POST') {

        downloadContent(req, res);
    }
}

function downloadContent(req, res) {
    var form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {

        var date = new Date();
        var time = date.getTime();
        var dir = 'uploads';
        var url = fields.url;
        var lastpart = url.split('/')[url.split('/').length - 1];
        var extension = lastpart.split('.')[1];

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        if (extension === 'jpg' || extension === 'mp3' || extension === 'mp4') {

            var stream = request(fields.url)
                    .on('error', function (err) {
                        console.log(err);
                    })
                    .pipe(fs.createWriteStream(dir + '/' + time + '.' + extension));


            // pipe finish
            stream.on('finish', function () {
                // redirect to root path
                res.writeHead(302, {Location: '/'});
                res.end();
            });

        } else {
            res.end('Not supported for downloading.');
        }
    });
}









