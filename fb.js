var bad_profiles = [];

function request_callback(result) {
    bad_profiles = JSON.parse(result);
    for (var i = 0; i < bad_profiles.length; i++) {
        bad_profiles[i] = bad_profiles[i].toLowerCase();
    }
}
// Request bad profiles to background page.
if (chrome.extension) {
    chrome.extension.sendRequest({command: "bad_profiles"}, request_callback);
}

var Story = {

    counter: 0,

    get_all: function() {
        var content = document.getElementById('contentArea');
        return content ? content.getElementsByClassName('storyContent') : [];
    },

    is_bad: function(story) {
        var is_bad_profile = function(profile) {
            return bad_profiles.indexOf(profile.toLowerCase()) != -1;
        };
        var links = story.getElementsByTagName('a');
        for (var i = 0; i < links.length; i++) {
            var v = links[i].href.split('/');
            var profile = v[v.length - 1];
            var name = links[i].innerHTML;
            if (is_bad_profile(profile) || is_bad_profile(name)) {
                return true;
            }
        }
        return false;
    },

    remove: function(story) {
        var node = story;
        var parent = node.parentNode;
        while (parent.tagName != 'UL') {
            var tmp = parent;
            parent = parent.parentNode;
            node = tmp;
        }
        parent.removeChild(node);
    },

    remove_all: function(stories) {
        for (var i = 0; i < stories.length; i++) {
            if (this.is_bad(stories[i])) {
                Story.remove(stories[i]);
            }
        }
    },

    handler: function() {
        var stories = this.get_all();
        if (stories && stories.length != this.counter) {
            this.remove_all(stories);
            this.counter = this.get_all().length;
        }
    }
};

function funblocker() {
    Story.handler();
}