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
		socket.room = data.room;
		socket.join(data.room);
		io.to(data.room).emit('userConnected', data);
		//io.sockets.emit('userConnected', data);
		updateUsersList();
		updateRoomsList();
	});
	
	function updateUsersList(room='home'){
		let u_list = users.filter(function(item){
			if(item.room === room)
				return true;
		});
		io.to(room).emit('usersList', u_list);
	};
	
	function updateRoomsList(){
		io.emit('roomsList', rooms);
	};
	
	socket.on('sendMessageToServer', function(data){
		io.to(data.room).emit('sendMessageToClient', data);
	});
	
	socket.on('changeRoom', function(data){
		let oldRoom = socket.room;
		socket.leave(socket.room);
		socket.room = data.room;
		socket.join(data.room);
		io.to(oldRoom).emit('userDisconnected', { username : socket.username, room : oldRoom});
		io.to(data.room).emit('userConnected', data);
		
		users.splice(users.findIndex(x => x.username === socket.username), 1);
		users.push(data);
		updateUsersList(oldRoom);
		updateUsersList(data.room);
		updateRoomsList();
	});
	
	socket.on('disconnect', function(){
		io.sockets.emit('userDisconnected', { username : socket.username });
		users.splice(users.indexOf(socket.username), 1);
		updateUsersList();
	});
	
});