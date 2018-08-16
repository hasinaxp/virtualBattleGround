
function join()
{
    let tournamentId = document.getElementById('tournamentId').innerText;
    let url = `/tournament/join/${tournamentId}`;
    console.log(url);
    getData(url, (data) => {
        if(data.status == 1)
            alert('joined to the tournament successfully.');
        else
            window.location = "dashboard/balanceError";
    });

}