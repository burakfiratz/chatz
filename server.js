var express = require('express'),
		app = express(),
		http = require('http').Server(app),
		io = require('socket.io')(http)
		port = process.env.port || 3000;

http.listen(port, function(){
	console.log('Listening port:'+ port);
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('Socket open');
	socket.emit('hello message', 'Hello socket');
});