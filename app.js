var express = require('express');
var path = require('path');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

//express setup
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

//setup html for view
app.get('/', function(req, res){
  res.sendfile('views/index.html');
});

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});



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



// Socket.IO events
io.on('connection', function(socket) {
    //record current user name
  var userName = false;
  
  //1. notify connection success
  socket.emit('connectionSuccess');

  //2. listen to message event 
  socket.on('message', function(msg){

    // means this is the first time for user to login in
    if(!userName){
        userName = msg;
        
        //list all messages in database when new user login 
        var db = new sqlite3.Database(file);
        var stmt = "SELECT name, time, message FROM chatroom";
        db.all(stmt, function(err, rows) {
          if (err) throw err;
          if (rows.length == 0) {
            console.log("Hey, there is nothing in database!");
          } else {
            rows.forEach(function (row) {
              var data = {
                user: row.name,
                time: row.time,
                message: row.message
              };
              socket.emit('message', data);
              //record
              console.log("read from database: "+row.name+";"+row.time+";"+row.message);
            });
          }
          db.close();
        });

        //construct the data to be sent
        var data = {
          time: getTime(),
          user: userName,
          message: 'New User Join: ',
          type: 'newUser'
        };

        console.log(userName + ' login');

        //broadcast
        socket.emit('system',data);
        socket.broadcast.emit('system',data);
     }else{
        //means this is the user posting message
        var data = {
          time: getTime(),
          user: userName,
          message: msg,
          type: 'message'
        };
        console.log(userName + ' say: ' + msg);

        //record date into database
        recordMessage(userName, data.time, msg);

        //broadcast
        socket.emit('message',data);
        socket.broadcast.emit('message',data);
      }
    });

    //3. listen to disconnect event
    socket.on('disconnect', function () {  
      var data = {
        time: getTime(),
        user: userName,
        message: 'User Logged Out: ',
        type: 'disconnect'
      };

      //broadcast
      socket.broadcast.emit('system',data);
      console.log(userName + ' logout');
    });

});


var getTime=function(){
  var date = new Date();
  return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

// var getColor=function(){
//   var colors = ['aliceblue','antiquewhite','aqua','aquamarine','pink','red','green',
//                 'orange','blue','blueviolet','brown','burlywood','cadetblue'];
//   return colors[Math.round(Math.random() * 10000 % colors.length)];
// }



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
