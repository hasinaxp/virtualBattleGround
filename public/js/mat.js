document.getElementById("mx_message")
  .addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      document.getElementById("mx_send").click();
    }
  });
document.getElementById("mx_adm")
  .addEventListener("keyup", function (event) {
    event.preventDefault();
    if (event.keyCode === 13) {
      document.getElementById("mx_send_adm").click();
    }
  });
$(document).ready(function () {
  $('input#mx_message').characterCounter();
  $('input#mx_adm').characterCounter();
  $('.modal').modal();

  // load list funciton
  function loadList(data) {
    let template = "";
    let cls = 'v1';
    data.chat.log.forEach(s_msg => {
      if (s_msg.color == 0) cls = 'v2';
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
      chatId: $('#mx_id').val()
    })

    socket.on(responseUrl, function (data) {
      if (data) {
        loadList(data);
      }
    });

  });


  $('#mx_send').on('click', function () {
    let c_id = $('#mx_con').val();
    let c1_id = $('#mx_con1').val();
    let x_id = $('#mx_id').val();
    let x_sender = $('#mx_sender').val();
    let x_msg = $('#mx_message').val();
    let color = (c_id == c1_id) ? 0 : 1;
    $('#mx_message').val("");
    console.log('event triggered!');
    if (x_msg != '') {
      socket.emit('chatRequest', {
        chatId: x_id,
        col: color,
        sender: x_sender,
        text: x_msg
      })
    }
  });

  $('#mx_send_adm').on('click', function () {
    let mid = $('#matchidxz').val();
    let msg = $('#mx_adm').val();
    postData('requestAdmin', {
      m_id: mid,
      msg: msg
    }, (data) => {
      $('#mx_adm').val('');
      alert('admin is notified!');
    })
  })

});

$('#admitDefeatBtn').on('click', function () {
  let isc = $('#matchischallenger').val();
  let mid = $('#matchidxz').val();
  postData('admitDefeate', {
    m_id: mid,
    is_c: isc
  },(data) => {
    $(location).attr('href', '/dashboard');
  });
})

$('#closeModal').on('click', function () {
  $('.modal').modal('close');
})