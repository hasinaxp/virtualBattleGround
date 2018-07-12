$(document).ready(function () {
    $('.parallax').parallax();
    $('.modal').modal();
    $('.fixed-action-btn').floatingActionButton();
    //$('select').material_select();
    var snav = document.querySelector('.sidenav');
    var i_snav = M.Sidenav.init(snav);
    var colaps = document.querySelector('.collapsible');
    var i_colaps = M.Collapsible.init(colaps, {
        accordion: false
      });
    var colaps1 = document.querySelector('.collapsible.popout');
    var i_colaps1 = M.Collapsible.init(colaps1, {
        accordion: false
      });

    //Rrgister query
    $('#registerBtn').on('click', function (e) {
        postData('/func/sign/register', {
            full_name : $('#r_name').val(),
            email : $('#r_email').val(),
            password : $('#r_password').val(),
            confirm : $('#r_confirm').val(),
        },(data)=> {
            console.log(data);
            if(data.hasOwnProperty('errors')){
                let errorLog = '';
                data.errors.forEach(error => {
                    errorLog +=  error.msg + '<br />';
                    console.log(error.msg);
                });
                $('#register-msg').html(errorLog);
            }
            if(data.hasOwnProperty('success')){
                alert('successfully registered \n You are now registered to Virtual Battle Ground');
                $('#modalRegister').modal('close');
                
            }
          }
        ); 
    });

});