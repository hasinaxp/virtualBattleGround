
function postData(url, info, cb){
    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-type': 'application/json'
        },
        credentials: "same-origin",
        body: JSON.stringify(info),

    })
    .then(function (res) {
        if (res.status !== 200) {
            console.log('Looks like there was a problem. Status Code: ' +
                res.status);
            return;
        }
        // Examine the text in the response
        res.json().then(function (data) {
                cb(data);
        });
    });//fetch call ends here
};


function requestData(url, id, cb) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-type': 'application/json'
        },
        credentials: "same-origin",
        body: JSON.stringify({
            gameId: id
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
                if (data.status) {
                    cb(data)
                }

            });
        });//fetch call ends here
}

