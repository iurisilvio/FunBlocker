var bad_profiles =  ['PiadasFail', 'HumorNoFace', 'JoSuado',
                     'JoSuadoNoFace', 'paniconainternet', 'OMelhorPanico',
                     'trustmestore', 'Humormetal', 'Humordido',
                     'JoSuadoPanico'];

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
    for (var i = 0; i < bad_profiles.length; i++) {
        if (bad_profiles[i] == profile) {
            return true;
        }
    }
    return false;
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

function callback(stories) {
    for (var i = 0; i < stories.length; i++) {
        if (is_bad_story(stories[i])) {
            remove_story(stories[i]);
        }
    }
}

var counter = 0;

setInterval(function listener() {
    var stories = get_stories();
    if (stories && stories.length != counter) {
        counter = stories.length;
        callback(stories);
    }
}, 1000);
