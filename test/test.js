$(document).ready(function(){
    var data = localStorage;

    module("Options", {
        setup: function() {
            localStorage.clear();
            localStorage.a = JSON.stringify("s");
            localStorage.bad_profiles = JSON.stringify(["a", "b"]);
        },
        teardown: function() {
            localStorage = data;
        }
    });

    test("Database get item.", function() {
        equal(db.get("a"), "s");
        equal(db.get("invalid_key"), undefined);
    });

    test("Database set item.", function() {
        db.set("dummy", 1);
        equal(db.get("dummy"), 1);
    });

    test("Load all profiles.", function() {
        equal(Profile.load_all().length, 2);
    });

    test("Save all profiles.", function() {
        var profiles = Profile.load_all();
        profiles.push("c");
        Profile.save_all(profiles);
        equal(Profile.load_all().length, 3);
    });

    test("Add new profile.", function() {
        Profile.add("c");
        equal(Profile.load_all().length, 3);
    });

    test("Remove profile.", function() {
        Profile.remove("b");
        Profile.remove("invalid");
        equal(Profile.load_all().length, 1);
    });

    var XMLHttpRequest_original = XMLHttpRequest.prototype.send;

    module("FunBlocker", {
        setup: function() {
            bad_profiles = ["bad name", "bad_link"];
        },
        teardown: function() {
            XMLHttpRequest.prototype.send = XMLHttpRequest_original;
            chrome.extension = undefined;
        }
    });
    test("Call request callback", function() {
        var result = request_callback(JSON.stringify(["a", "b", "C"]));
        deepEqual(result, ["a", "b", "c"]);
    });

    test("Update data function", 2, function() {
        chrome.extension = {
            sendRequest: function(data, callback) {
                equal(data.command, "bad_profiles");
                callback(JSON.stringify(["a"]));
            }
        };
        update_data();
        deepEqual(bad_profiles, ["a"])
    });

    test("Get stories", function() {
        equal(Story.get_all().length, 5);
        equal(Story.get_all(true).length, 5);
        $(".bad").parent().hide();
        equal(Story.get_all().length, 2);
        equal(Story.get_all(true).length, 5);
    });

    test("Is bad story", function() {
        var stories = $(".storyContent");
        for (var i = 0; i < stories.length; i++) {
            equal(Story.is_bad(stories[i]), stories.eq(i).hasClass('bad'));
        }
    });

    test("Remove a story", 3, function() {
        chrome.extension = {
            sendRequest: function(data, callback) {
                equal(data.command, "inc_plugin");
                ok(callback === undefined);
            }
        };
        var story = $(".storyContent.bad")[0];
        Story.remove(story);
        equal(Story.get_all().length, 4);
    });

    test("Remove bad stories", function() {
        Story.remove_all(Story.get_all());
        equal(Story.get_all().length, 2);
    });

    test("Remove story callback", 2, function() {
        chrome.extension = {
            sendRequest: function(data, callback) {
                equal(data.command, "inc_fb");
                ok(callback === undefined);
            }
        };
        Story.remove_callback();
    });

    test("Main handler", 0, function() {
        Story.handler();
    });

    test("Main FunBlocker function", 0, function() {
        funblocker();
    });

    test("Try hide story link", function() {
        var stories = $(".storyContent");
        ok(Story.try_default_hide(stories[1]));
        ok(!Story.try_default_hide(stories[2]));
    });

    test("Get story wrapper", function() {
        var stories = $(".storyContent");
        stories.each(function(index, element) {
            equal(Story.get_story_wrapper(this).tagName, "LI");
        });
    });

    test("Try default hide only one time", 1, function() {
        XMLHttpRequest.prototype.send = function(params) {
            ok(true);
        };
        var stories = $(".storyContent");
        var story = stories[1];
        Story.remove(story);
        Story.remove(story);
    });
});
