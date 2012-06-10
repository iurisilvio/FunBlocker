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

function _async_post(url, data) {
    function serialize(obj) {
        var str = [];
        for (var item in obj) {
            str.push(encodeURIComponent(item) + "=" + encodeURIComponent(obj[item]));
        }
        return str.join("&");
    }
    var params = serialize(data);

    var http = new XMLHttpRequest();
    http.open("POST", url, true);
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() {
        if(http.readyState == 4 && http.status == 200) {
            Story.remove_callback(data);
        }
    }
    http.send(params);
}

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

        var elements = story.getElementsByClassName("mainWrapper")[0].childNodes;
        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            if (element.tagName /* avoid Text elements */ &&
                element.tagName.toLowerCase() != "form" /* avoid comments */) {
                var links = element.getElementsByTagName('a');
                for (var j = 0; j < links.length; j++) {
                    if (is_bad_link(links[j])) {
                        return true;
                    }
                }
            }
        }
        return false;
    },

    remove: function(story) {
        if (story._funblocker_tried_hide) {
            return true;
        }
        story._funblocker_tried_hide = true;

        var wrapper = Story.get_story_wrapper(story);
        wrapper.style.display = "none";
        if (chrome.extension) {
            chrome.extension.sendRequest({command: "inc_plugin"});
        }
        Story.try_default_hide(story);
    },

    remove_all: function(stories) {
        for (var i = 0; i < stories.length; i++) {
            if (this.is_bad(stories[i])) {
                Story.remove(stories[i]);
            }
        }
    },

    remove_callback: function(data) {
        if (chrome.extension) {
            chrome.extension.sendRequest({command: "inc_fb"});
        }
    },

    handler: function() {
        var stories = this.get_all(true);
        if (stories) {
            this.remove_all(stories);
        }
        Story.add_plugin_buttons();
    },

    try_default_hide: function(story) {
        var dtsg,
            actor_id, story_fbid, content_timestamp,
            qid, mf_story_key,
            user_id;

        var inputs = story.getElementsByTagName("input");

        for (var i = 0; i < inputs.length; i++) {
            if (inputs[i].name == "fb_dtsg") {
                dtsg = inputs[i].value;
            }
            else if (inputs[i].name == "feedback_params") {
                var obj = JSON.parse(inputs[i].value);
                actor_id = obj.actor;
                story_fbid = obj.target_fbid;
                content_timestamp = obj.content_timestamp;
            }
            else if (inputs[i].name == "link_data") {
                var obj = JSON.parse(inputs[i].value);
                qid = obj.qid;
                mf_story_key = obj.mf_story_key;
            }
        }

        var c_user_start = document.cookie.indexOf("c_user=") + 7,
            c_user_end = document.cookie.indexOf(";", c_user_start);
        user_id = document.cookie.substring(c_user_start, c_user_end);

        // Reverse engineering FTW!
        // It works this way, commented values aparently are optional.
        var data = {
            "action": "uninteresting", // static
            "actor_id": actor_id,
            "story_fbids[0]": actor_id + ":" + story_fbid + "::" + content_timestamp + ":" + content_timestamp,
            "source": "home", // static
            //"report_link": "/ajax/report.php?content_type=5&cid=" + story_fbid + "&rid=" + actor_id + "&profile=" + actor_id + "&
            //    h=AfiHxGPZ1lA7BpB9&
            //    story_fbid=" + story_fbid + "&story_div_id=stream_story_4fa58337154213150640413",
            //"story_type": 263, // static?
            // "num_participants": 1, // static?
            "nctr[_mod]": "pagelet_home_stream", // static
            //ft[type]: 55, // static?
            // ft[tn]: "V", // static?
            "ft[qid]": qid,
            "ft[mf_story_key]": mf_story_key,
            "fb_dtsg": dtsg,
            "__user": user_id
            //phstamp:16581651108211052103557 // http://www.blackhatworld.com/blackhat-seo/facebook/411272-cracked-facebooks-phstamp.html

        };

        for (var key in data) {
            if (data[key] == undefined) {
                return false;
            }
        }
        _async_post("https://www.facebook.com/ajax/feed/filter_action/uninteresting/?__a=1", data)
        return true;
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
    },

    add_plugin_buttons: function() {
        var overlays = document.getElementsByClassName("uiOverlayContent");
        for (var i = 0; i < overlays.length; i++) {
            var hovercard_footer = overlays[i].getElementsByClassName("uiHovercardFooter");
            if (hovercard_footer.length == 1 && hovercard_footer[0].getElementsByClassName("funblocker_button").length == 0) {
                var buttons = hovercard_footer[0].getElementsByTagName("input"),
                    like_button = undefined;
                for (var j = 0; j < buttons.length; j++) {
                    if (buttons[j].value == "Like") {
                        like_button = buttons[j];
                        break;
                    }
                }
                if (like_button) {
                    var ellipsis = overlays[i].getElementsByClassName("ellipsis");
                    if (ellipsis.length > 0) { ellipsis = ellipsis[0].innerHTML; }

                    var newLabel = document.createElement("label"),
                        newInput = document.createElement("input");
                    newLabel.className = "uiButton";
                    newInput.className = "funblocker_button";
                    newInput.value = "FunBlocker";
                    newInput.type = "button";
                    newInput.setAttribute("data-page", ellipsis);
                    newLabel.appendChild(newInput);

                    like_button.parentNode.parentNode.insertBefore(newLabel, like_button.parentNode);
                }
            }
        }
    }
};

document.addEventListener("click", function(e) {
    if (chrome.extension && e.target.className == "funblocker_button") {
        chrome.extension.sendRequest({
            command: "block",
            text: e.target.getAttribute("data-page")
        });
    }
});

function funblocker() {
    Story.handler();
}