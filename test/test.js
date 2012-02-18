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

    module("FunBlocker", {
        setup: function() {
            Story.counter = 0;
            bad_profiles = ["bad name", "bad_link"]
        },
    });
    test("Call request callback", function() {
        var result = request_callback(JSON.stringify(["a", "b", "C"]));
        deepEqual(result, ["a", "b", "c"]);
    });

    test("Get stories", function() {
        equal(Story.get_all().length, 5);
    });

    test("Is bad story", function() {
        var stories = $(".storyContent");
        for (var i = 0; i < stories.length; i++) {
            equal(Story.is_bad(stories[i]), stories.eq(i).hasClass('bad'));
        }
    });

    test("Remove a story", function() {
        var story = $(".storyContent.bad")[0];
        Story.remove(story);
        equal(Story.get_all().length, 4);
    });

    test("Remove bad stories", function() {
        Story.remove_all(Story.get_all());
        equal(Story.get_all().length, 3);
    });

    test("Main handler", function() {
        Story.handler();
        equal(Story.counter, 3);
    });

    test("Main FunBlocker function", function() {
        funblocker();
        equal(Story.counter, 3);
    });
});
