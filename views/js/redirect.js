var queries = {};

function updateQueries() {
    const urlParams = new URLSearchParams(window.location.search);

    for(var key of urlParams.keys()) {
        queries[key] = urlParams.get(key);
    }
}

function getQuery(keyName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(keyName);
}

function addQuery(qs) {
    Object.keys(qs).forEach(function(key) {
        queries[key] = qs[key];
    });
}

function removeQuery(keyName) {
    queries[keyName] = undefined;
}

function redirect(href) {
    var qs = "?";
    Object.keys(queries).forEach(function (key) {
        if (queries[key] || queries[key] === 0) {
            if (qs[qs.length - 1] !== "?" && qs[qs.length - 1] !== "&") {
                qs += "&";
            }
            qs += `${key}=${queries[key]}`;
        }
    });
    if (qs === "?") {
        qs = "";
    }
    window.location.href = href + qs;
}