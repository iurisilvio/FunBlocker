var default_config = {
    bad_profiles: [
        'PiadasFail', 'HumorNoFace', 'Jo Suado',
        'paniconainternet', 'OMelhorPanico', 'trustmestore',
        'Humormetal', 'Humordido', 'EngenhariaFacts',
        'O Melhor Do Mundo', 'RisosNoFace',
        '9gag.com' // sorry!
    ]
}
// Store a default value for bad_profiles.
if (localStorage.bad_profiles == undefined) {
    localStorage.bad_profiles = JSON.stringify(default_config.bad_profiles);
}

if (!localStorage._counter_bug) {
    if (parseInt(localStorage.plugin_counter) > parseInt(localStorage.fb_counter)) {
        localStorage.plugin_counter = parseInt(localStorage.fb_counter);
    }
    localStorage._counter_bug = "DONTPANIC!";
}

if (localStorage.since == undefined) {
    var d = new Date();
    localStorage.since = [d.getDate(), d.getMonth(), d.getFullYear()].join("/");
}

function executeScript(code) {
    chrome.tabs.getSelected(null, function(tab) {
        if (tab && tab.url && tab.url.indexOf("www.facebook.com") != -1) {
            chrome.tabs.executeScript(null, {code: code});
        }
    });
}

var _data;
setInterval(function() {
    if (_data != localStorage.bad_profiles) {
        _data = localStorage.bad_profiles;
        executeScript("update_data()");
    }
    executeScript("funblocker()");
}, 1000);
chrome.extension.onRequest.addListener(function(request, sender, callback) {
    if (request.command == "bad_profiles") {
        callback(localStorage.bad_profiles);
    }
    else if (request.command == "inc_plugin") {
        if (!localStorage.plugin_counter) {
            localStorage.plugin_counter = 0;
        }
        localStorage.plugin_counter++;
    }
    else if (request.command == "inc_fb") {
        if (!localStorage.fb_counter) {
            localStorage.fb_counter = 0;
        }
        localStorage.fb_counter++;
    }
    else if (request.command == "block") {
        block(request.text);
    }
});

function block(text) {
    if (text) {
        var bad_profiles = localStorage.bad_profiles ? JSON.parse(localStorage.bad_profiles) : [];
        bad_profiles.push(text);
        localStorage.bad_profiles = JSON.stringify(bad_profiles);
    }
}

chrome.contextMenus.create({
    "title": "FunBlocker this",
    "contexts": ["link", "selection"],
    "onclick": function(info, tabs) {
        var possible = (info.selectionText || info.linkUrl),
            data = possible.split("/"),
            tip = data[data.length - (possible[possible.length - 1] == "/" ? 2 : 1)],
            text = prompt("Adicione essa palavra no FunBlocker", tip);
        block(text);
    },
    "documentUrlPatterns": ["*://www.facebook.com/*"]
});
