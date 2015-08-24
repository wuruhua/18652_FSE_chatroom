$(function () {
	var content = $('#content');
	var status = $('#status');
	var input = $('#input');
	var textarea = $('#textarea');
	var button = $('#button');
	
	//record the name of current user, default value is false
    var userName = false;

	//socket connection setup
	socket = io.connect('http://localhost:8080');

	//confirm connection success
	socket.on('connectionSuccess',function(){
	  status.text('Please enter your user name:');
	});

    //listen to system event
	socket.on('system',function(data){
		var p = '';
		if (data.type === 'newUser'){
			if(userName==data.user) {
                status.hide();
                input.hide();

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
			p = '<p>system @ '+ data.time+ ' : ' + data.message + data.user +'</p>';

		} else if (data.type == 'disconnect') {
			p = '<p>system @ '+ data.time+ ' : ' + data.message + data.user +'</p>';
		}
		content.append(p);
	});


	//listen to message event
	socket.on('message',function(data){
	  // var p = '<p><span>' + obj.user+'</span> @ '+ obj.time+ ' : '+obj.message+'</p>';
	  // content.append(p);
	  var p = '<p><span>' + data.user+'</span> @ '+ data.time+ ' : '+data.message+'</p>';
      content.append(p);
	});


	//set up button click event
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
	    if (userName === false) {
	      userName = msg;
	    }
	  
	});
});