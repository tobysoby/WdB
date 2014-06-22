// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
        helper: '../helper'
    },
    shim: {
        'rangy/rangy-core': {
        exports: "rangy",
            init: function() { return this.rangy; },
        },
        'rangy/rangy-selectionsaverestore': {
        deps: ["rangy/rangy-core"],
        exports: "rangy.modules.SaveRestore"
        },
        'rangy/rangy-cssclassapplier': {
        deps: ["rangy/rangy-core"],
        exports: "rangy.modules.CssClassApplier"
        },
        'rangy/rangy-highlighter': {
        deps: ["rangy/rangy-core"],
        exports: "rangy.modules.Highlighter"
        },
        'rangy/rangy-textrange': {
        deps: ["rangy/rangy-core"],
        exports: "rangy.modules.TextRange"
        },
        'jquery-ui': {
        deps: ['jquery'],
        exports: '$'
        },
        'jquery.ui.autocomplete': {
        deps: ['jquery'],
        exports: 'jquery-ui-autocomplete'
        }
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['jquery', 'jquery-ui', 'jquery.ui.autocomplete', 'rangy/rangy-core', 'rangy/rangy-cssclassapplier', 'rangy/rangy-highlighter', 'rangy/rangy-textrange', 'app/code']);