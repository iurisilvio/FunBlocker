function load_profiles() {
    var bad_profiles = localStorage.bad_profiles;
    return bad_profiles ? JSON.parse(bad_profiles) : [];
}

function save_profiles(profiles) {
    localStorage.bad_profiles = JSON.stringify(profiles);
}

function add_profile(value) {
    var profiles = load_profiles();
    // Check if profile is not already blocked.
    if (profiles.indexOf(value) != -1) {
        return;
    }
    profiles.push(value);
    save_profiles(profiles);
    $("#profiles").append(line_template(value));
    $("#new_profile").val("").focus();
}

function remove_profile(value) {
    var profiles = load_profiles();
    var index = profiles.indexOf(value);
    if (index != -1) {
        profiles.splice(index, 1);
        save_profiles(profiles);
        $("#profiles td").filter(function() {
            return $(this).text() == value;
        }).parent("tr").remove();
        $("#new_profile").val("").focus();
    }
}
