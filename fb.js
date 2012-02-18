var bad_profiles = [];

function request_callback(json_result) {
    var result = JSON.parse(json_result);
    for (var i = 0; i < result.length; i++) {
        result[i] = result[i].toLowerCase();
    }
    return result;
}

// Request configuration data to background page.
function update_data() {
    chrome.extension && chrome.extension.sendRequest({command: "bad_profiles"}, function(result) {
        bad_profiles = request_callback(result);
    });
}

update_data();

var Story = {

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
        var get_links = function(element) {
            var links = element && element.getElementsByTagName('a') || [];
            var result = [];
            var len = links.length;
            for (var i = 0; i < len; i++) {
                result.push(links[i]);
            }
            return result;
        }
        var messageBody = get_links(story.getElementsByClassName("messageBody")[0]);
        var attachments = get_links(story.getElementsByClassName("uiStreamAttachments")[0]);
        var links = messageBody.concat(attachments);
        for (var i = 0; i < links.length; i++) {
            if (is_bad_link(links[i])) {
                return true;
            }
        }
        return false;
    },

    remove: function(story) {
        if (!Story.try_default_hide(story)) {
            var node = story;
            var parent = node.parentNode;
            while (parent.tagName != 'UL') {
                var tmp = parent;
                parent = parent.parentNode;
                node = tmp;
            }
            parent.removeChild(node);
        }
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
        }
    },

    try_default_hide: function (story) {
        var items = story.getElementsByTagName("li");
        for (var i = 0; i < items.length; i++) {
            var data_label = items[i].getAttribute("data-label");
            if (data_label && data_label.toLowerCase() == "hide story") {
                var event_ = document.createEvent("MouseEvents");
                event_.initEvent("click", true, true); // event type, bubbling, cancelable
                var element = items[i].getElementsByTagName("a")[0];
                if (element) {
                    element.dispatchEvent(event_);
                    return true;
                }
            }
        }
        return false;
    }
};

function funblocker() {
    Story.handler();
}