var http = require('http');
var express = require('express');
var app = express();
var cors = require('cors');
var path = require('path');
var static = require('serve-static');
var socketio = require('socket.io');

app.use(cors());

app.use("/public", static(path.join(__dirname,'public')));


app.get("/", function(req, resp) {
    resp.end('Hello Node JS socket server!');
});

var server = http.createServer(app).listen(3000, function()  {
    console.log('서버 실행중 - http://localhost:3000');
});

var sendResponse = function(socket, command, code, message) {
    socket.emit('response', {command:command, code:code, message:message});
}

// 접속자의 socket 정보를 저장한다.
var login_ids = {};

//평소엔 대기상태 - 소켓 요청이 오면 작동한다.
var io = socketio.listen(server);
io.sockets.on('connection', function(socket) {
    console.log('서버의 소켓 접속 정보 ---> ', socket.request.connection._peername);
    
    socket.remoteAddress = socket.request.connection._peername.address;
    socket.remotePort = socket.request.connection._peername.port;
    
    
    socket.on('message', function(message) {
        console.log('Server side >>> ', message);
        
        if(message.recepient == 'All') {
           socket.emit('message', message);
        } else if(login_ids[message.recepient]) {
            var socket_id = login_ids[message.recepient];
            io.sockets.connected[socket_id].emit('message', message);
            sendResponse(socket,'message','200','메세지가 전송 되었습니다.');
        } else {
            sendResponse(socket,'message','404','상대방 socket이 로구아웃 되었습니다.');
        }
        
    });
    
    //{key:value, key:value} (맵구조이다)
        
    socket.on('login', function(user) {
        console.log('로그인 이벤트를 받았다.');
        console.log('접속한 로그인 id: ' + user.id);
        console.dir(user);
    
        // user.id와 socket.id를 맵핑 시킨다. 해당 user의 socket이 없다면 등록.
        login_ids[user.id] = socket.id;
        socket.user_id = user.id;
    
        console.log("현재 접속 id 는 %d개이다.", Object.keys(login_ids).length);
    
        sendResponse(socket,'loin','200','로그인 되었습니다.');
    });
    
}); //connection




    
    
    
    