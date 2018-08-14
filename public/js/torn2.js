
function join()
{
    let tournamentId = document.getElementById('tournamentId').innerText;
    let playerId = getCookie('logauti');
    let url = `tournament/join/${tournamentId}/${playerId}`;
    getData(url, (data) => {

    });

}