var express = require('express');
var app = express();
var server = require('http').createServer(app); //creates server
var io = require('socket.io').listen(server);
const mysql = require('mysql');

const db = mysql.createConnection({
		host     : 'us-cdbr-iron-east-05.cleardb.net',
		user     : 'b2688ca46574e6',
		password : '5ac14581'
		//database : 'movies'
});

db.connect((err) => {
	if(err){
		throw err;
	}
	console.log('mysql connected...');
});

users = {};
connections = [];
app.use(express.static('public'));

server.listen(process.env.PORT || 5000, '0.0.0.0', function(){
	console.log('Listening to port: ' + 5000)
});

console.log('Server is running...');

app.get('/',function(req,res){
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log('Users online: '+ connections.length);

	//disconnect
	socket.on('disconnect', function(data){
		delete users[socket.username];
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1);
		console.log('Users online: ' +  connections.length);
	});
	
	//send messages
	socket.on('send message', function(data, callback){
		var msg = data.trim();
		//console.log(data);
		if(msg.substr(0,3) === '/w '){
			msg = msg.substr(3);
			var index = msg.indexOf(' ');
			if(index !== -1){
				var name = msg.substr(0,index);
				var msg = msg.substr(index + 1);
				if(name in users){
					users[name].emit('whisper', {msg: msg, user: socket.username});
					callback("<strong> To " + name + ": </strong>" + msg);
					console.log("Whispering continues...");
				}else{
					callback(" Enter a valid username! (CASE SENSITIVE)");
				}
			}else{
				callback(' Please enter a message for your whisper!');
			}

		}else{
			io.sockets.emit('new message', {msg: msg, user: socket.username});
		}
	});

	//New User
	socket.on('new user', function(data, callback){
		if(data in users || data.indexOf(" ") != -1){
			callback(false);
		}else{
			callback(true);
			socket.username = data;
			users[socket.username] = socket;
			//users.push(socket.username);
			updateUsernames();
		}
	});

	//Update Usernames
	function updateUsernames(){
		io.sockets.emit('get users', Object.keys(users));
	}
});


// 404 handler
app.use(function(req,res) {
    res.status(404).send('Dunno');
})