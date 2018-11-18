document.getElementById("mx_message")
    .addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode === 13) {
        document.getElementById("mx_send").click();
    }
});
$(document).ready(function() {
  $('input#mx_message').characterCounter();
  $('.modal').modal();
  
  // load list funciton
  function loadList(data) {
    let template = "";
      let cls = 'v1';
      data.chat.log.forEach(s_msg => {
        if(s_msg.color == 0) cls = 'v2';
        else cls = 'v1';
        template += `<div class='bubble'>
          <div class='s_name'><span class='${cls}'>${s_msg.name}</span> | <span class='v'>${s_msg.date}</span></div>
          <div class='s_message'>${s_msg.text} </div>
        </div>`
      });
      $('#chat-list-container').html(template);
      let objDiv = document.getElementById("chat-list-container");
      objDiv.scrollTop = objDiv.scrollHeight;
  }


//connection url
//let url = 'http://159.89.163.24:80';
let url = 'http://localhost:3000'
  //sockets magic
  const socket = io.connect(url);
  const responseUrl = "msgcame" + $('#mx_id').val();

  socket.on('connect', (data) => {

    socket.emit('chatResponse', {
      chatId : $('#mx_id').val()
    })

    socket.on(responseUrl, function(data) {
      if(data)
      {
        loadList(data);
      }
    });

  });
  

  $('#mx_send').on('click', function() {
    let c_id = $('#mx_con').val();
    let c1_id = $('#mx_con1').val();
    let x_id = $('#mx_id').val();
    let x_sender = $('#mx_sender').val();
    let x_msg = $('#mx_message').val();
    let color = (c_id == c1_id)? 0 : 1;
    $('#mx_message').val("");
    console.log('event triggered!');
    if(x_msg != '')
    {
      socket.emit('chatRequest', {
        chatId : x_id,
        col : color,
        sender : x_sender,
        text : x_msg
      })
    }
  });



  });

  $('#admitDefeatBtn').on('click', function() {
    let isc = $('#matchischallenger').val();
    let mid = $('#matchidxz').val();
     fetch('/match/admitDefeate', {
         method: 'POST',
         headers: {
             'Accept': 'application/json, text/plain, */*',
             'Content-type': 'application/json'
         },
         credentials: "same-origin",
         body: JSON.stringify({
             m_id: mid,
             is_c: isc
         }),
     })
         .then(function (res) {
             if (res.status !== 200) {
                 console.log('Looks like there was a problem. Status Code: ' +
                     res.status);
                 return;
             }
             // Examine the text in the response
             res.json().then(function (data) {
                 if (data.error) {
                     console.log(err);
                 }
                 if (data.status) {
                   console.log(data);
                 }
             });
         });//fetch call ends here
         $(location).attr('href', '/dashboard');
  })

$('#closeModal').on('click', function() {
  $('.modal').modal('close');
})