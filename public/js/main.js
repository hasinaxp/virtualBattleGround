
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

function getData(url, cb) {
    fetch(url, {
        method: 'get',
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
                if (data.status) {
                    cb(data)
                }

            });
        });//fetch call ends here
}

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
function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

