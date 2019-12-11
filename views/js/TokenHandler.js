function TH_TokenCheckFromQueryAndCookie() {
    function getCookie(cname) {
        var name = cname + "=";
        //var decodedCookie = decodeURIComponent(document.cookie);
        //var ca = decodedCookie.split(';');
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
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

    try {
        const urlParams = new URLSearchParams(window.location.search);
        queryUserToken = urlParams.get("userToken");
        if (queryUserToken) {
            document.cookie = "userToken=" + queryUserToken + ";path=/";
        }
    }
    catch (e) {
        console.log(e);
    }

    var userToken = getCookie("userToken");


    if (userToken) {
        console.log("token found with " + userToken);
    }
    else {
        console.log("fail to get the token")
        redirect("http://localhost:3050/login");
    }

    return userToken;
}