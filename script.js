var chatBody = document.querySelector('#chat');
$(function(){
	var socket = io.connect();
	var $messageForm = $('#messageForm');
	var $message = $('#message');
	var $chat = $('#chat');
	var $messageArea = $('#messageArea');
	var $userFormArea = $('#userFormArea');
	var $userForm = $('#userForm');
	var $users = $('#users');
	var $username = $('#username');
	var $password = $('#password');
	var $userError = $('#userError');

<<<<<<< HEAD
$messageForm.submit(function(e){
=======
	$messageForm.submit(function(e){
>>>>>>> d26ec13d63745ed5fe0f86c75e36e8a5f4b109f8
		e.preventDefault(); 
		socket.emit('send message', $message.val(), function(data){
			var date = formatAMPM(new Date());
			$chat.append('<div class="alert alert-success"><strong>'+"[" + date + "]</strong>" + data + '</div>');
			chatBody.scrollTop = chatBody.scrollHeight - chatBody.clientHeight;	
		});
		$message.val('');
	});

	socket.on('new message', function(data){
		var date = formatAMPM(new Date());
		$chat.append('<div class="alert alert-info"><strong>'+"[" + date + "] " +data.user+'</strong>: '+data.msg+'</div>');
		chatBody.scrollTop = chatBody.scrollHeight - chatBody.clientHeight;
	});

	socket.on('whisper', function(data){
		var date = formatAMPM(new Date());
		$chat.append('<div class="alert alert-success"><strong>'+"[" + date + "] From " +data.user+'</strong>: '+data.msg+'</div>');	
		chatBody.scrollTop = chatBody.scrollHeight - chatBody.clientHeight;				
	});

	$userForm.submit(function(e){
		e.preventDefault(); 
		socket.emit('new user', $username.val(), function(data){
			if(data){
				$userFormArea.hide();
				$messageArea.show();
			}
			else{
				$userError.show();
			}
		});
		$username.val('');
	});

	socket.on('get users', function(data){
		var html = '';
		for(i = 0; i < data.length; i++){
			html += '<li class="list-group-item">' + data[i] + '</li>';
		}
		$users.html(html);
	});

	socket.on('load messages', function(data){
		for(i=0; i < data.length; i++){
			$chat.append('<div class="alert alert-danger"><strong>'+"[" + data[i].date + "] " + data[i].from + "</strong>: " + data[i].message + ' </div>');	
		}
			console.log("Finished loading old messages.");
	});

	$('#message').keypress(function (e) {
			if (e.which == 13) {
			$('#submit').submit();
			return false;    //<---- Add this line
			}
	});

});


// socket.on('display message', function(data){
// 	displayMessages(data);
// });


function formatAMPM(date) {
	var month = date.getMonth() +1;
	var day = date.getDate();
	var year = date.getFullYear();
	var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = month+"/"+day + "/" + year + ' ' + hours + ':' + minutes + ' ' + ampm;
    return strTime;
} 
