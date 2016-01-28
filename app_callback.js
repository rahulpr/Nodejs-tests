/**
 * Sample node.js website with chat
 * callback approach
 * 
 * @authror Rahul P R
 * @date 27/01/2016
 */

var http = require('http');
var fs = require('fs');
var url = require('url');
var PORT = 3001;

var renderPage = function (res, page) {
    var viewPage = page === '/' ? 'home' : page; // set default page
    var filePath = 'views/' + viewPage + '.html';

    fs.exists(filePath, function (exists) {
        if (exists) {
            fs.readFile(filePath, function (err, pageData) {
                if (err) {
                    console.log(err);
                    res.end('Error reading file.');
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    res.write(pageData);
                    res.end();
                }
            });
        } else {
            res.end('Page does not exist.');
        }
    });
};

var reqHandler = function (req, res) {
    //var query = url.parse(req.url, true).query;
    var pathname = url.parse(req.url).pathname;
    renderPage(res, pathname);
};

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





