/**
 * Sample node.js website with chat
 * promise approach
 * 
 * @authror Rahul P R
 * @date 27/01/2016
 */

var http = require('http');
var fs = require('fs');
var url = require('url');
var PORT = 3001;

function fileExist(filePath) {
    // promise
    return new Promise(function (resolve, reject) {
        fs.exists(filePath, function (exists) {
            return exists ? resolve('got file') : reject('file not exists');
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
        // render page
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(pageData);
        res.end();
    }).catch(function (err) {
        console.log(err);
        res.end(err);
    });
}

function reqHandler(req, res) {
    //var query = url.parse(req.url, true).query;
    var pathname = url.parse(req.url).pathname;
    renderPage(res, pathname);
}

var server = http.createServer(reqHandler);
server
        .once('error', function (err) {
            console.log(err);
        })
        .once('listening', function () {
            //console.log('Server listening');
        })
        .listen(PORT, function () {
            console.log('Server running at ' + PORT);
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





