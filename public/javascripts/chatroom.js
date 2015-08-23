$(function () {
	var content = $('#content');
	var status = $('#status');
	var input = $('#input');
	var textarea = $('#textarea');
	var button = $('#button');
	// var currentUser = false;      //record the name of current user, default value is false
    var myName = false;

	//建立websocket连接
	socket = io.connect('http://localhost:8080');

	// //收到server的连接确认
	socket.on('open',function(){
	  status.text('Please enter your user name:');
	});

	socket.on('system',function(json){
		var p = '';
		if (json.type === 'welcome'){
			if(myName==json.text) {
				// status.text(myName + ': ').css('color', json.color);
                status.hide();
                input.hide();
                // input.css('');
                $('#messageDiv').css({
                	"height":"250px",
                	"display":"block",
                	"position":"fixed",
                	"bottom":"20px"
                });

                textarea.css({
                	"display":"block",
                	"height":"150px",
                	"width":"300px",
                	"background-color":"#CAE1FF" 
                })

                button.val("POST").css({
                	"display":"block",
                	"height":"40px",
                	"width":"80px",
                	"margin-top": "10px",
                	"background-color":"#7B68EE" 
			    });

			    content.css({
			    	"overflow":"scroll",
			    	"height":"300px",
			    	"margin-bottom":"10px",
			    	"background-color":"#CCCCCC"
			    });
			    //scroll to the bottom by default
			    // $('#content').scrollTop($('#content')[0].height);

            }	
			p = '<p style="background:'+json.color+'">system @ '+ json.time+ ' : Welcome ' + json.text +'</p>';

		} else if (json.type == 'disconnect') {
			p = '<p style="background:'+json.color+'">system @ '+ json.time+ ' : Bye ' + json.text +'</p>';
		}
		content.append(p);
	});

	//监听system事件，判断welcome或者disconnect，打印系统消息信息
	// socket.on('newUser',function(json){
 //      if (json.type === 'welcome'){
	//     if(myName==json.text) status.text(myName + ': ').css('color', json.color);
	// 	var p = '<p style="background:'+json.color+'">system @ '+ json.time+ ' : Welcome ' + json.text +'</p>';
	//     content.append(p);
	//   }
	// });


	// socket.on('invalidUser',function(){
	//   var userName = window.prompt("duplicate user name!");
	//   while(!userName) {
	//   	userName = window.prompt("user name cannot be empty!");
	//   }
	//   socket.emit("message", userName);
	// });

 //    socket.on('connect', function(){
 //      var userName = window.prompt("please enter your user name!");
	//   while(!userName) {
	//   	userName = window.prompt("user name cannot be empty!");
	//   }
	//   socket.emit("message", userName);
	// });


	// socket.on('disconnection', function(json)) {
	// 	if(json.type == 'disconnect'){
	// 	  var p = '<p style="background:'+json.color+'">system @ '+ json.time+ ' : Bye ' + json.text +'</p>';
	// 	  content.append(p);
	// 	}
	// }

	//监听message事件，打印消息信息
	socket.on('message',function(json){
	  // var p = '<p><span>' + obj.user+'</span> @ '+ obj.time+ ' : '+obj.message+'</p>';
	  // content.append(p);
	  var p = '<p><span style="color:'+json.color+';">' + json.author+'</span> @ '+ json.time+ ' : '+json.text+'</p>';
      content.append(p);
	});


	//通过“回车”提交聊天信息
	button.click(function(e) {
		var msg;
		if (input.is(":hidden")) {
			msg = $(textarea).val();
		} else {
			msg = $(input).val();
		}

	    if (!msg) return;

	    socket.send(msg);

	    //clear the text in the input
	    $(input).val('');
	    $(textarea).val('');
	    if (myName === false) {
	      myName = msg;
	    }
	  
	});
});