var express = require('express');
var app = express();
var server = require('http').createServer(app); //creates server
var io = require('socket.io').listen(server);
const mysql = require('mysql');


users = {};
connections = [];
var ret = [];
app.use(express.static('public'));

console.log('Server is running...');

app.get('/',function(req,res){
	res.sendFile(__dirname + '/index.html');
	// let sql = 'SELECT * FROM messages';
	// let query = db.query(sql, (err, results) => {
	// 	if(err) throw err;
	// 	console.log(results);
	// 	res.send('Posts fetched...');
	// });

});

var db_config = {
    host: 'us-cdbr-iron-east-05.cleardb.net',
    user: 'b2688ca46574e6',
    password: '5ac14581',
    database: 'heroku_48febb90a6d362c'
};

var connection;

function handleDisconnect() {
    console.log('1. connecting to db:');
    connection = mysql.createConnection(db_config); // Recreate the connection, since
													// the old one cannot be reused.

    connection.connect(function(err) {              	// The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('2. error when connecting to db:', err);
            setTimeout(handleDisconnect, 1000); // We introduce a delay before attempting to reconnect,
        }                                     	// to avoid a hot loop, and to allow our node script to
    });                                     	// process asynchronous requests in the meantime.
    											// If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('3. db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { 	// Connection to the MySQL server is usually
            handleDisconnect();                      	// lost due to either server restart, or a
        } else {                                      	// connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

app.get('/', function(request, response) {
    connection.query('SELECT * FROM heroku_48febb90a6d362c.messages', function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['Hello World!!!!', rows]);
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});

io.sockets.on('connection', function(socket){
	var sql = '(SELECT * FROM heroku_48febb90a6d362c.messages ORDER BY idmessages DESC LIMIT 6) ORDER BY idmessages ASC;'
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