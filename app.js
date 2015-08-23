var express = require('express');
var path = require('path');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


// database setup
var fs = require("fs");
var file = "./chatroom.db";

var exists = fs.existsSync(file);
if (!exists) {
  console.log("Creating DB file.");
  fs.openSync(file, "w");
}


var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database(file);

db.serialize(function() {
  //create table
  db.run("CREATE TABLE IF NOT EXISTS chatroom (name TEXT,time TEXT,message TEXT)");
});

db.close();



function recordMessage(user, date, msg) {
  var db = new sqlite3.Database(file);

  var stmt = db.prepare("INSERT INTO chatroom(name, time, message) VALUES (?,?,?)");
  stmt.run(user, date, msg);
  stmt.finalize();
  
  //record 
  console.log("already record user:"+user+";date:"+date+";msg:"+msg); 

  db.close();
}



//express基本配置
app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// 指定webscoket的客户端的html文件
app.get('/', function(req, res){
  res.sendfile('views/index.html');
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});




// Socket.IO events
io.on('connection', function(socket) {
  
  //1. notify connection success
  socket.emit('open');

  
  // 构造客户端对象
  var client = {
    socket:socket,
    name:false,
    color:getColor()
  }


  // 对message事件的监听
  socket.on('message', function(msg){
    var obj = {time:getTime(),color:client.color};

    // 判断是不是第一次连接，以第一条消息作为用户名
    if(!client.name){
        client.name = msg;
        obj['text']=client.name;
        obj['author']='System';
        obj['type']='welcome';
        console.log(client.name + ' login');

        
        //list all messages in database when new user login 
        var db = new sqlite3.Database(file);
        var stmt = "SELECT name, time, message FROM chatroom";
        db.all(stmt, function(err, rows) {
          if (err) throw err;
          if (rows.length == 0) {
            console.log("Hey, there is nothing in database!");
          } else {
            rows.forEach(function (row) {
              var obj = {
                author: row.name,
                time: row.time,
                text: row.message
              };
              socket.emit('message', obj);
              //record
              console.log("read from database: "+row.name+";"+row.time+";"+row.message);
            });
          }
          db.close();
        });


        //返回欢迎语
        socket.emit('system',obj);
        //广播新用户已登陆
        socket.broadcast.emit('system',obj);
     }else{

        //如果不是第一次的连接，正常的聊天消息
        obj['text']=msg;
        obj['author']=client.name;      
        obj['type']='message';
        console.log(client.name + ' say: ' + msg);


        //record date into database
        recordMessage(client.name, obj.time, msg);

        // 返回消息（可以省略）
        socket.emit('message',obj);
        // 广播向其他用户发消息
        socket.broadcast.emit('message',obj);
      }
    });

    //监听出退事件
    socket.on('disconnect', function () {  
      var obj = {
        time:getTime(),
        color:client.color,
        author:'System',
        text:client.name,
        type:'disconnect'
      };

      // 广播用户已退出
      socket.broadcast.emit('system',obj);
      console.log(client.name + 'Disconnect');
    });

});


var getTime=function(){
  var date = new Date();
  return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

var getColor=function(){
  var colors = ['aliceblue','antiquewhite','aqua','aquamarine','pink','red','green',
                'orange','blue','blueviolet','brown','burlywood','cadetblue'];
  return colors[Math.round(Math.random() * 10000 % colors.length)];
}



// //check whether the input user name is duplicated
// function isValidUserName(user){
//   for(var i in io.sockets.sockets){
//     if(io.sockets.sockets.hasOwnProperty(i)){
//       if(io.sockets.sockets[i] && io.sockets.sockets[i].userName == user){
//           return false;
//       }
//     }
//   }
//   console.log("valid user name : "+user);
//   return true;
// }
