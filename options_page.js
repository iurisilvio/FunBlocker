function line_template(value) {
    return "<tr><td>" + value + "</td><td style='text-align:right;'><a data-text=\"" + value.replace("\\", "\\\\") + "\" class='btn removebtn'>Remove</a></td></tr>"
}

function add_profile(value) {
    Profile.add(value);
    $("#profiles").append(line_template(value));
    $("#new_profile").val("").focus();
}

function remove_profile(value) {
    Profile.remove(value);
    $("#profiles td").filter(function() {
        return $(this).text() == value;
    }).parent("tr").remove();
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
        remove_profile($(this).attr("data-text"));
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
});
