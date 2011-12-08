var db = {
    get: function(key) {
        var value = localStorage[key];
        return value != undefined ? JSON.parse(value) : undefined;
    },
    set: function(key, value) {
        localStorage[key] = JSON.stringify(value);
    }
};

var Profile = {
    load_all: function() {
        return db.get("bad_profiles") || [];
    },

    save_all: function(profiles) {
        db.set("bad_profiles", profiles);
    },

    add: function(profile) {
        var profiles = this.load_all();
        // Check if profile is not already blocked.
        if (profiles.indexOf(profile) != -1) {
            return;
        }
        profiles.push(profile);
        this.save_all(profiles);
    },

    remove: function(profile) {
        var profiles = this.load_all();
        var index = profiles.indexOf(profile);
        if (index != -1) {
            profiles.splice(index, 1);
            this.save_all(profiles);
        }
    }
}
