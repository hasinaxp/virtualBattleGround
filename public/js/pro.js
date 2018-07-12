$(document).ready(function(){
    $('.parallax').parallax();
    $('.modal').modal();
    $('.fixed-action-btn').floatingActionButton();

    
    $('select').formSelect();
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



    //events---------------------------------------------
    $('.matchInfoShow').on('click', function() {
        const id = $(this).data('id');
        fetch(`/log/match/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-type': 'application/json'
            },
            credentials: "same-origin",
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
                        $('#mi_game').text(data.match.game.name);
                        $('#mi_challenger').text(data.match.challenger.full_name);
                        $('#mi_challenged').text(data.match.challenged.full_name);
                        $('#mi_date').text(Date(data.match.date));
                        $('#mi_bet').text(data.match.balance + " BP");
                        $('#modalMatchinfo').modal('open');
                    }
                });
            });//fetch call ends here
    });



    
});