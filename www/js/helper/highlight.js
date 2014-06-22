//Highlighting

define(['rangy/rangy-core', 'require', 'rangy/rangy-highlighter'], function (rangy, require) {
    var store = require('store');

function saveHighlight (textMitHighlights) {
    var high_id = $('#id').html(); // hole die aktuelle ID
    high_id = high_id + '_high'; // baue die high_id
    store.set(high_id, textMitHighlights);
};

var highlighter;

function rangy_init () {
            rangy.init();

            highlighter = rangy.createHighlighter();

            highlighter.addClassApplier(rangy.createCssClassApplier("highlight", {
                ignoreWhiteSpace: true,
                tagNames: ["span", "a"]
            }));

            highlighter.addClassApplier(rangy.createCssClassApplier("note", {
                ignoreWhiteSpace: true,
                elementTagName: "a",
                elementProperties: {
                    href: "#",
                    onclick: function() {
                        var highlight = highlighter.getHighlightForElement(this);
                        if (window.confirm("Delete this note (ID " + highlight.id + ")?")) {
                            highlighter.removeHighlights( [highlight] );
                        }
                        return false;
                    }
                }
            }));
}

window.onload = rangy_init();

function noteSelectedText() {
    highlighter.highlightSelection("highlight");
    var highlightedText = $('#bedeutung').html();
    highlightedText = highlightedText.toString();
    saveHighlight(highlightedText);
}

    return {note: function() {
        noteSelectedText();
    }
           }
    
});