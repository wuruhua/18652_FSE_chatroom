$(function () {
	var content = $('#contentDiv');
	var contentTable = $('#contentTable');
	var label = $('#label');
	var input = $('#input');
	var textarea = $('#textarea');
	var button = $('#button');
	
	//record the name of current user, default value is false
    var userName = false;

	//socket connection setup
	socket = io.connect('http://localhost:8080');

	//confirm connection success
	socket.on('connectionSuccess',function(){
	  label.text('Please enter your user name:');
	});

    //listen to system event
	socket.on('system',function(data){
		var element = "";
		if (data.type === 'newUser'){
			if(userName==data.user) {
                label.hide();
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
                	"width":"400px",
                	"background-color":"#ADD8E6" 
                })

                button.val("POST").css({
                	"display":"block",
                	"height":"40px",
                	"width":"80px",
                	"margin-top":"10px",
                	"margin-left":"160px",
                	"background-color":"#1E90FF" 
			    });

			    content.css({
			    	"overflow":"scroll",
			    	"height":"380px",
			    	"width":"420px",
			    	"margin-bottom":"10px",
			    });

            }	
            element = '<tr height="40px"><td>'+"Log in: "+data.user+' @'+data.time+'</td></tr>';
		} 
		else if (data.type == 'disconnect') {
			element = '<tr height="40px"><td>'+"Log Out: "+data.user+' @'+data.time+'</td></tr>';
		}

		$('#contentTable').append(element);
	});


	//listen to message event
	socket.on('message',function(data){
	  addContentMessage(data);
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


	function addContentMessage(data) {
	  var element = '<tr height="40px"><td align="left" style="font-weight:bold;font-size:140%">'+data.user+'</td><td align="right" style="font-size:70%">'+data.time+'</td></tr>'
	  +'<tr height="40px" style="word-wrap:break-word;word-break:break-all;"><td colspan="2" style="font-size:110%">'+data.message+'</td></tr>';
	  $('#contentTable').append(element);
	  $('#contentTable').scrollTop=$('#contentTable').scrollHeight;
	}
});