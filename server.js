var express = require('express');
var app = express();
var server = require('http').createServer(app); //creates server
var io = require('socket.io').listen(server);
const mysql = require('mysql');


users = {};
connections = [];
var ret = [];
app.use(express.static('public'));

<<<<<<< HEAD
var port = process.env.PORT || 5000

server.listen(port, function() {
    console.log("App is running on port " + port);
=======
const db = mysql.createConnection({
    host: 'us-cdbr-iron-east-05.cleardb.net',
    user: 'b2688ca46574e6',
    password: '5ac14581',
    database: 'heroku_48febb90a6d362c'
>>>>>>> d26ec13d63745ed5fe0f86c75e36e8a5f4b109f8
});

db.connect((err) => {
	if (err) throw err;
	console.log("SQL server connected...");
});

app.get('/',function(req,res){
	res.sendFile(__dirname + '/index.html');
	// let sql = 'SELECT * FROM messages';
	// let query = db.query(sql, (err, results) => {
	// 	if(err) throw err;
	// 	console.log(results);
	// 	res.send('Posts fetched...');
	// });

});

<<<<<<< HEAD
const db = mysql.createConnection({
    host	: process.env.DB_HOST,
    user	: process.env.DB_USER,  
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
=======
server.listen(process.env.PORT || 5000, '0.0.0.0', function(){
	console.log('Listening to port: ' + 5000)
>>>>>>> d26ec13d63745ed5fe0f86c75e36e8a5f4b109f8
});

console.log('Server is running...');

io.sockets.on('connection', function(socket){
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
	var sql = '(SELECT * FROM connectme.messages ORDER BY idmessages DESC LIMIT 6) ORDER BY idmessages ASC;'
=======
	var sql = 'SELECT * FROM heroku_48febb90a6d362c.messages LIMIT 10;'
>>>>>>> f0f7fd4b44ad92b340d43dd5577a24e71a10dcbe
=======
	var sql = 'SELECT * FROM heroku_48febb90a6d362c.messages LIMIT 10;'
>>>>>>> f0f7fd4b44ad92b340d43dd5577a24e71a10dcbe
=======
	var sql = '(SELECT * FROM heroku_48febb90a6d362c.messages ORDER BY idmessages DESC LIMIT 6) ORDER BY idmessages ASC;'
>>>>>>> d26ec13d63745ed5fe0f86c75e36e8a5f4b109f8
	db.query(sql, function(err, rows, fields) {
		if (err) throw err;
		else {
			// for (var i in rows) {
   //  			ret.push(rows[i]);;
			// }
			socket.emit('load messages', rows);
    		console.log('Old messages saved.');
		}
	});

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
			var date = formatAMPM(new Date());
			let post = {message:msg, from:socket.username, date:date};
			var sql = 'INSERT INTO messages SET ?';
			db.query(sql, post, function (err, result){
			if(err) throw err;
				console.log("1 record inserted!");
			});
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


	function formatAMPM(date) {
		var month = date.getUTCMonth() +1;
		var day = date.getUTCDate();
		var year = date.getUTCFullYear();
		var hours = date.getHours();
	    var minutes = date.getMinutes();
	    var ampm = hours >= 12 ? 'PM' : 'AM';
	    hours = hours % 12;
	    hours = hours ? hours : 12; // the hour '0' should be '12'
	    minutes = minutes < 10 ? '0'+minutes : minutes;
	    var strTime = month+"/"+day + "/" + year + ' ' + hours + ':' + minutes + ' ' + ampm;
	    return strTime;
	} 

// 404 handler
app.use(function(req,res) {
    res.status(404).send('Dunno');
})