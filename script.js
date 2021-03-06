var searchButton = document.getElementById("search");
var userImage = document.getElementById("user-image");

// create an XMLHttpRequest object and send HttpRequest
function sendAjaxMsg (url, message) {
    function asynCode (resolve, reject) {

        // create an XMLHttpRequest object
        let request = new XMLHttpRequest();

        // when state equal to 4 and status equal to 200 then do something
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                // return resolve promise
                resolve(request.responseText);
            }
        };

        request.onerror = function (error) {
            let errorMsg = "Error status: " + request.status;
            // return reject promise
            reject(errorMsg);
        };

        // Request url with user name by GET method
        request.open("GET", url + message, true);
        // Send HttpRequest
        request.send();
    }
    return new Promise(asynCode);
}

// User also can press Enter to search an images
document.getElementById("name").onkeydown = function (e) {
    if(e.keyCode == 13){ 
        searchButton.click();
    }
};

// Listener user click search button
searchButton.addEventListener("click", function () {
    var name = document.getElementById("name");

    // send url with user name to sendAjaxMsg function
    let ajax = sendAjaxMsg("https://www.instagram.com/", name.value);

    // if request success
    function handle (value) {
        document.getElementById("user-info").style.display = "block";
        userImage.innerHTML = "";

        // parse string text to dom
        const parser = new DOMParser();
        const dom = parser.parseFromString(value, "text/html");
        for (let meta of dom.getElementsByTagName("meta")) {
            og = meta.getAttribute("property");
            if (og == "og:title") {
                // user name
                var userName = meta.getAttribute("content").match(/(@)([A-Za-z]+[^)])/)[2];
                document.getElementById("profile-user-name").innerHTML = userName;
                document.getElementsByClassName("profile-real-name")[0].innerHTML = userName;
            }
            else if (og == "og:image") {
                // profile image
                document.getElementById("profile-image").innerHTML = `<img src=${meta.getAttribute("content")}>`;
            }
            else if (og == "og:description") {
                var description = meta.getAttribute("content");
                // if Web Browser in English mode
                if (/^[0-9]{1,5}/.test(description)) {
                    var followers = meta.getAttribute("content").match(/([0-9]{1,7}) (Followers)/)[1];
                    var following = meta.getAttribute("content").match(/([0-9]{1,7}) (Following)/)[1];
                    var posts = meta.getAttribute("content").match(/([0-9]{1,7}) (Posts)/)[1];
                } 
                // if Web Browser in Thai mode
                else {
                    var followers = meta.getAttribute("content").match(/(ผู้ติดตาม) ([0-9]{1,7})/)[2];
                    var following = meta.getAttribute("content").match(/(กำลังติดตาม) ([0-9]{1,7})/)[2];
                    var posts = meta.getAttribute("content").match(/(โพสต์) ([0-9]{1,7})/)[2];
                }
                document.getElementsByClassName("profile-stat-count")[0].innerHTML = posts;
                document.getElementsByClassName("profile-stat-count")[1].innerHTML = followers;
                document.getElementsByClassName("profile-stat-count")[2].innerHTML = following;
            }
        }

        // get object value in window._sharedData
        const jsonObject = value.match(/<script type="text\/javascript">window\._sharedData = (.*)<\/script>/)[1].slice(0, -1);

        // parse object value in type string to type object
        const data = JSON.parse(jsonObject);

        // get media data of user
        const mediaArray = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;

        for (let media of mediaArray) {
            const node = media.node
            
            // get images only
            if ((node.__typename && node.__typename !== 'GraphImage' && node.__typename !== 'GraphSidecar')) {
                continue
            }

            // display images
            userImage.innerHTML += `
                <div class="gallery-item" tabindex="0">
                    <img src=${node.thumbnail_src} class="gallery-image" alt="">
                </div>
            `;
        }
    }

    // if request failed
    function errorHandle(errMsg) {
        document.getElementById("user-info").innerHTML = `<h1>${errMsg}</h1>`;
    }

    // if success go to handle if failed go to errorHandle
    ajax.then(handle, errorHandle);
});