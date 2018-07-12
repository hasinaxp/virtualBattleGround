$(document).ready(function () {
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

    initiateHideSection(1);

    //------------------------globals--------------------------------------------------------------
    let GAME_ID = '';
    let CHALLANGER_LIST = '';
    let CHALLANGER = '';
    let CHALLANGED = '';
    let CHALLANGEGAME = '';

    let CHALLENGE_SELECTED = '';

    let MATCH_ID = '';
    let MATCH_SELECTED = '';


    //---------------------helper functions-------------------------------------------
    function initiateHideSection(id) {
        switch (id) {
            case 1:
                $('#vers-1').show();
                $('#vers-2').hide();
                $('#vers-3').hide();
                break;
            case 2:
                $('#vers-1').hide();
                $('#vers-2').show();
                $('#vers-3').hide();
                break;
            case 3:
                $('#vers-1').hide();
                $('#vers-2').hide();
                $('#vers-3').show();
                break;

        }

    }


    function getGameInfo(id, cb) {
        requestData('/func/info/getRequirement', id, cb);
    }

    function getChallangerList(id, hint, cb) {
        let uid = $.cookie("logauti");
        CHALLANGER = uid;
        fetch('/func/info/getChallangerList', {
            method: 'POST',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-type': 'application/json'
            },
            credentials: "same-origin",
            body: JSON.stringify({
                gameId: id,
                name: hint,
                u_id: uid
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
                        cb(data)
                    }
                });
            });//fetch call ends here
    }

    function getProfileInfo(id, cb) {
        requestData('/func/info/getProfile', id, cb);
    }

    function getMatchInfo(id, cb) {
        requestData('/func/info/getMatchInfo', id, cb);
    }
    function searchPlayers() {
        let hint = $('#c-search').val();
        getChallangerList(GAME_ID, hint, (data) => {
            console.log(data.list)
            let prep = '';
            data.list.forEach(i => {
                prep += `<li class='collection-item'>
            <a data-id='${i._id}' href='#' class='bc challange-player-tile'>
                <img src='${i.image}' class='img-pin'>
                <span class='fix-1 sp1'>${i.full_name}</span>
            </a>
            </li>`
            });
            $('#c-result-container').html(prep);
        });
    }

    //----------------------event handeler----------------------------------------------
    $('#linkEditGames').on('click', () => {
        $('#egu1').show();
        $('#egu2').hide();
        $('#a_gameReqInp').val('');
    });
    //635978

    $('.gameAddBtn1').on('click', function (e) {

        const id = $(this).data('id');
        getGameInfo(id, (data) => {
            $('#egu1').hide();
            $('#egu2').fadeIn();
            $('#a_gameReqName').text(data.name);
            $('#a_gameReqLab').text(data.reqr);
            $('#a_gameReqId').val(data.id);
        });


    });

    $('#trigger-search').on('click', function (e) {
        initiateHideSection(1);
        $('#modalChallange').modal('open');
    }
    );

    $('.challange-tile').on('click', function (e) {
        GAME_ID = $(this).data('id');
        getGameInfo(GAME_ID, (data) => {
            $('#gameChallangeResultName').text(' ' + data.name);
            $('#c-search').val('');
            initiateHideSection(2);
            searchPlayers()
        });

    });
    $('#c-search').on('input', function (e) {
        searchPlayers();
    })

    $('#c-result-container').on('click', 'a', function (e) {
        CHALLANGED = $(this).data('id');
        $('#c_gameReqId').val(GAME_ID);
        $('#c_gameReqChallenger').val(CHALLANGER);
        $('#c_gameReqChallenged').val(CHALLANGED);
        getProfileInfo(CHALLANGED, (data) => {
            $('#c_oppn').text(data.name);
            $('#c_oppi').attr("src", data.image);
        });
        initiateHideSection(3);
    })

    $('.challengeActionView').on('click', function (e) {
        let matchId = $(this).data('id');
        getMatchInfo(matchId, (data) => {
            CHALLENGE_SELECTED = data.info._id;
            $('#ca_challenger').text(data.info.challenger.full_name);
            $('#ca_challenged').text(data.info.challenged.full_name);
            $('#ca_bet').text(data.info.balance + 'BP');
            $('#ca_decline').attr('href', '/dashboard/challenge/decline/' + CHALLENGE_SELECTED);
            if (data.info.fly == 1) {
                $('#ca_accept').hide();
                $('#ca_decline').text('cancel ')
            }
            else {
                $('#ca_accept').attr('href', '/dashboard/challenge/accept/' + CHALLENGE_SELECTED);
                $('#ca_accept').show();

                $('#ca_decline').text('decline')
            }
            $('#modalChallangeAction').modal('open');
        })
    })























});