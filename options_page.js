function line_template(value) {
    return "<tr><td>" + value + "</td><td style='text-align:right;'><a data-text=\"" + encodeURIComponent(value) + "\" class='btn removebtn'>Remove</a></td></tr>"
}

function add_profile(value) {
    if (value == '' || value.lenght == 0) {
        $("#new_profile").focus();
        return false;
    }
    
    Profile.add(value);
    $("#profiles").append(line_template(value));
    $("#new_profile").val("").focus();
    chrome.extension.sendRequest({
        command: "_trackEvent",
        action: "block",
        text: value,
        origin: "options"
    });
}

function remove_profile(value) {
    Profile.remove(value);
    $("#profiles td").filter(function() {
        return $(this).text() == value;
    }).parent("tr").remove();
    chrome.extension.sendRequest({
        command: "_trackEvent",
        action: "unblock",
        text: value,
        origin: "options"
    });
}

$(document).ready(function() {
    $("#new_profile").keypress(function(e) {
        if ((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) {
            $("#add_new_profile").click();
            return false;
        }
        else {
            return true;
        }
    });
    $("#add_new_profile").click(function() {
        add_profile($("#new_profile").val());
    });
    $(".removebtn").live("click", function() {
        remove_profile(decodeURIComponent($(this).attr("data-text")));
    });
    var profiles = Profile.load_all();
    var result = "";
    for (var i = 0; i < profiles.length; i++) {
        result += line_template(profiles[i]);
    };
    $("#profiles").append(result);

    $("#plugin_removed").html(localStorage.plugin_counter || 0);
    $("#fb_removed").html(localStorage.fb_counter || 0);
    $("#words").html(JSON.parse(localStorage.bad_profiles).length);
    $("#since").html(localStorage.since);

    $("[data-message]").each(function() {
        var key = $(this).attr("data-message");
        var msg = chrome.i18n.getMessage(key);
        var attr = $(this).attr("data-attr");
        if (attr) {
            $(this).attr(attr, msg);
        }
        else {
            $(this).html(msg);
        }
    });
});

chrome.extension.sendRequest({
    command: "_trackPageview",
    url: "options.html"
});
