var bad_profiles = [];

function request_callback(json_result) {
    var result = JSON.parse(json_result);
    for (var i = 0; i < result.length; i++) {
        result[i] = result[i].toLowerCase();
    }
    return result;
}

// Request configuration data to background page.
if (chrome.extension) {
    chrome.extension.sendRequest({command: "bad_profiles"}, function(result) {
        bad_profiles = request_callback(result);
    });
}

var Story = {

    counter: 0,

    get_all: function() {
        var content = document.getElementById('contentArea');
        return content ? content.getElementsByClassName('storyContent') : [];
    },

    is_bad: function(story) {
        var is_bad_link = function(link) {
            var name = link.innerHTML.toLowerCase();
            var url = link.href.toLowerCase();

            for (var i = 0; i < bad_profiles.length; i++) {
                var profile = bad_profiles[i];
                if (name == profile || url.indexOf(profile) != -1) {
                    return true;
                }
            }
            return false;
        };
        var links = story.getElementsByTagName('a');
        for (var i = 0; i < links.length; i++) {
            if (is_bad_link(links[i])) {
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
        if (stories) {
            this.remove_all(stories);
            this.counter = this.get_all().length;
        }
    }
};

function funblocker() {
    Story.handler();
}