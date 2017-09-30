var express = require('express'),
		app = express(),
		http = require('http').Server(app),
		io = require('socket.io')(http),
		port = process.env.port || 3000,
		users = [],
		rooms = ['home', 'private', 'game', 'conference'];

http.listen(port, function(){
	console.log('Listening port:'+ port);
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	console.log('Socket open');
	socket.emit('hello message', 'Hello socket');
	
	socket.on('login', function(data){
		users.push(data);
		socket.username = data.username;
		io.sockets.emit('userConnected', data);
		updateUsersList();
		updateRoomsList();
	});
	
	function updateUsersList(){
		io.sockets.emit('usersList', users);
	};
	
	function updateRoomsList(){
		io.emit('roomsList', rooms);
	};
	
	socket.on('sendMessageToServer', function(data){
		io.sockets.emit('sendMessageToClient', data);
	});
	
	socket.on('disconnect', function(){
		io.sockets.emit('userDisconnected', { username : socket.username });
		users.splice(users.indexOf(socket.username), 1);
		updateUsersList();
	});
	
});