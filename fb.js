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
    if (chrome.extension) {
        chrome.extension.sendRequest({command: "bad_profiles"}, function(result) {
            bad_profiles = request_callback(result);
        });
    }
}

update_data();

var Story = {

    get_all: function(show_hidden) {
        var content = document.getElementById('contentArea');
        var all_stories = content ? content.getElementsByClassName('storyContent') : [];
        if (!show_hidden) {
            var visible_stories = [];
            for (var i = 0; i < all_stories.length; i++) {
                if (Story.get_story_wrapper(all_stories[i]).style.display != "none") {
                    visible_stories.push(all_stories[i]);
                }
            }
            return visible_stories;
        }
        return all_stories;
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
        var wrapper = Story.get_story_wrapper(story);
        wrapper.style.display = "none";
        Story.try_default_hide(story);
    },

    remove_all: function(stories) {
        for (var i = 0; i < stories.length; i++) {
            if (this.is_bad(stories[i])) {
                Story.remove(stories[i]);
            }
        }
    },

    handler: function() {
        var stories = this.get_all(true);
        if (stories) {
            this.remove_all(stories);
        }
    },

    try_default_hide: function(story) {
        if (story._funblocker_clicked) {
            return true;
        }
        var items = story.getElementsByTagName("li");
        for (var i = 0; i < items.length; i++) {
            var data_label = items[i].getAttribute("data-label");
            if (data_label && data_label.toLowerCase() == "hide story") {
                var event_ = document.createEvent("MouseEvents");
                event_.initEvent("click", true, true); // event type, bubbling, cancelable

                var element = items[i].getElementsByTagName("a")[0];
                if (element) {
                    element.dispatchEvent(event_);
                    story._funblocker_clicked = true;
                    return true;
                }
                else {
                    break;
                }
            }
        }
        return false;
    },

    get_story_wrapper: function(story) {
        var node = story;
        var parent = node.parentNode;
        while (parent && parent.tagName != 'UL') {
            var tmp = parent;
            parent = parent.parentNode;
            node = tmp;
        }
        return node;
    }
};

function funblocker() {
    Story.handler();
}