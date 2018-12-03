
function join() {
    let tournamentId = document.getElementById('tournamentId').innerText;
    let url = `/tournament/join/${tournamentId}`;
    console.log(url);
    getData(url, (data) => {
        if (data.status == 1){
            alert('joined to the tournament successfully.');
            window.location = `/tournament/${tournamentId}`;
        }
        else
            window.location = "/dashboard/balanceError";
    });

}

function drawBrackets() {
    let tournamentId = document.getElementById('tournamentId').innerText;
    let url = `/tournament/bracket/${tournamentId}`;
    console.log(url);
    getData(url, (data) => {
        if (data.status == 1) {
            console.log(data);
            $("#tournamentBrackets").brackets({
                titles: data.data.rounds,
                rounds: data.data.tree,
                color_title: 'white',
                border_color: '#46CFB0',
                color_player: 'white',
                bg_player: '#46CFB0',
                color_player_hover: 'white',
                bg_player_hover: '#4655E9',
                border_radius_player: '3px',
                border_radius_lines: '5px',
            });
        }
    });
    

};

drawBrackets();