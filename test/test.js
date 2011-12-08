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
        equals(db.get("a"), "s");
        equals(db.get("invalid_key"), undefined);
    });

    test("Database set item.", function() {
        db.set("dummy", 1);
        equals(db.get("dummy"), 1);
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
});
