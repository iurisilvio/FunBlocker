var profiles = ['PiadasFail', 'HumorNoFace', 'JoSuado', 'paniconainternet',
                'OMelhorPanico']
var context = jQuery('#contentArea');

function callback() {
    jQuery.each(profiles, function(index, element) {
        var posts = jQuery('a[data-hovercardx][href$=' + element + ']', context).parents('li');
        posts.hide();
    });
}

callback();
context.change(callback);
