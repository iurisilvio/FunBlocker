var bad_profiles = [];

// Request bad profiles to background page.
chrome.extension.sendRequest({
    command: "bad_profiles"
}, function(result) {
    bad_profiles = JSON.parse(result);
});

function get_stories() {
    var content = document.getElementById('contentArea');
    var stories;
    if (content) {
         stories = content.getElementsByClassName('storyContent');
    }
    return stories;
}

function remove_story(story) {
    var node = story;
    var parent = node.parentNode;
    while (parent.tagName != 'UL') {
        var tmp = parent;
        parent = parent.parentNode;
        node = tmp;
    }
    parent.removeChild(node);
}

function is_bad_profile(profile) {
    return bad_profiles.indexOf(profile) != -1;
}

function is_bad_story(story) {
    var links = story.getElementsByTagName('a');
    for (var i = 0; i < links.length; i++) {
        var v = links[i].href.split('/');
        var profile = v[v.length - 1];
        if (is_bad_profile(profile)) {
            return true;
        }
    }
    return false;
}

function remove_bad_stories(stories) {
    for (var i = 0; i < stories.length; i++) {
        if (is_bad_story(stories[i])) {
            remove_story(stories[i]);
        }
    }
}

var counter = 0;
function main() {
    var stories = get_stories();
    if (stories && stories.length != counter) {
        counter = stories.length;
        remove_bad_stories(stories);
    }
}