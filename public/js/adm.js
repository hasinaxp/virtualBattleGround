$(document).ready(function () {

    $('.modal').modal();
    $('select').formSelect();
    $('.tabs').tabs();
    let popCollapsible = document.querySelector('.collapsible.popout');
    let i_popCollapsible = M.Collapsible.init(popCollapsible, {
        accordion: false
    });

    //------------------------global----------------------------------
    let matchID = '';

    //------------------------methods------------------------------------
    //add game
    $('#addGameBtn').on('click', function (e) {
        let addForm = document.getElementById('GameAddForm');
        var addFormData = new FormData(addForm);
        fetch('/admin/game/add', {
            method: 'POST',
            body: addFormData
        })
            .then(function (res) {
                if (res.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        res.status);
                    return;
                }
                // Examine the text in the response
                res.json().then(function (data) {
                    let successReport = `${data.info.name} is added to games!`;
                    alert(successReport);
                });
                $('#GameAddForm').reset();
                $('#modalAddGame').modal('close');
            });
        $(location).attr('href', '/admin')
        e.preventDefault();
    });

    //remove game
    $('#removeGameBtn').on('click', function (e) {
        let removeForm = document.getElementById('removeGameForm');
        var removeFormData = new FormData(removeForm);
        fetch('/admin/game/remove', {
            method: 'POST',
            body: removeFormData
        })
            .then(function (res) {
                if (res.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        res.status);
                    return;
                }
                // Examine the text in the response
                res.json().then(function (data) {
                    let successReport = `remove process successful`;

                    alert(successReport);
                });
                $('#removeGameForm').reset();
                $('#modalRemoveGame').modal('close');
            });
        $(location).attr('href', '/admin')
        e.preventDefault();
    });

    //add game
    $('#createTurnamentBtn').on('click', function (e) {
        let gameId = $('#a_t_game').val();
        let playerCount = $('#a_t_player_count').val();
        let balance = $('#a_t_balance').val();
        let dataStruct = {
            game_id: gameId,
            player_count: playerCount,
            balance: balance
        };
        postData('tournament/create',dataStruct, (data) => {
            if (data.error) {
                console.log(err);
            }
            if (data.status) {
                alert('tournament created successfully');
                $(location).attr('href', '/admin')
            }
        });
        e.preventDefault();
    });

    $('#takeDecisionBtn').on('click', function () {
        matchID = $(this).data('id');
        fetch('/admin/decision/' + matchID, {
            method: 'GET',
        })
            .then(function (res) {
                if (res.status !== 200) {
                    console.log('Looks like there was a problem. Status Code: ' +
                        res.status);
                    return;
                }
                // Examine the text in the response
                res.json().then(function (data) {
                    console.log(data);
                    let img1 = data.challenger.image;
                    let img2 = data.challenged.image;
                    $('#d-matchId').text(data._id)
                    $('#d-bet').text(data.balance);
                    $('#d-date').text(data.date);
                    $('#d-game').text(data.gameName);
                    $('#d-c1-email').text(data.challenger.email);
                    $('#d-c2-email').text(data.challenged.email);
                    $('#d-c1-img').attr('src', img1);
                    $('#d-c2-img').attr('src', img2);

                    if (img1 == 'no')
                        $('#d-proofs-1').hide();
                    if (img2 == 'no')
                        $('#d-proofs-2').hide();
                });
            });
        $('#modalDecision').modal('open');
    })

    //-discicion on match winning
    $('#d-win1').on('click', function () {
        let dataStruct = {
            m_id: matchID,
            vic: 'p1'
        }
        postData('/admin/makeVictor', dataStruct, (data) => {
            let successReport = `challenger victory successful`;
            console.log(data);
            alert(successReport);
        });
        $('.modal').modal('close');
        $(location).attr('href', '/admin');
    });

    $('#d-win2').on('click', function () {
        let dataStruct = {
            m_id: matchID,
            vic: 'p2'
        }
        postData('/admin/makeVictor', dataStruct, (data) => {
            let successReport = `challenger victory successful`;
            console.log(data);
            alert(successReport);
        });
        $('.modal').modal('close');
        $(location).attr('href', '/admin');
    });

    loadFeeds();

});
function deleteFeed(id) {
    getData('admin/feed/delete/'+ id, (data) => {
        loadFeeds();
    });
}
//feed collection
function loadFeeds(){
    let template ='';
    getData('/admin/feed', (data) => {
        console.log(data);
        data.feeds.forEach( f => {
            template += `<li class="collection-item c2">
        <div>${f.title}<a href="#!" data-id='${f._id}' onclick="deleteFeed('${f._id}');" id="deleteFeedBtn" class="red-text secondary-content"><i class="material-icons">close</i></a></div>
          </li>`;
        });
        $('#feedCollection').html(template);
    })
}