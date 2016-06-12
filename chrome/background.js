function get_alert(argument) {
    try{
	var force_business = '';
    var force_alert = [];
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://ubackup.xxx.com:5000/api/get_force_business", false);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            force_business = JSON.parse(xhr.responseText);
        }
    }
    xhr.send();

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://ubackup.uuzu.com:5000/api/alert", false);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            var resp = JSON.parse(xhr.responseText);
            for (i of resp) {
                if (force_business.indexOf(i.game_id) != -1) {
                    force_alert.push(i);
                }
            }
            chrome.browserAction.setBadgeText({text: force_alert.length.toString()});
        }
    }
    xhr.send();
}catch(e){
    console.log(e);
}
}

try{
get_alert();
}catch(e){
    console.log(e);
}
setInterval(function () {
    try{get_alert()}catch(e){
        console.log(e);
    }
    
}, 5 * 60 * 1000);

chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({
        url: "http://ubackup.uuzu.com:5000/#/alert"
    });
});
