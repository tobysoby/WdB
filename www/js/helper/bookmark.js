//Artikel bookmarken

define (function() {
    var store = require('store');
    
    
    var bookmarkArticle = function (lemma) {
        store.set(lemma, 'bookmarked');
    };
    var unbookmarkArticle = function (lemma) {
        store.set(lemma, 'nix');
    };
    
    // Bookmarks anzeigen lassen
    function showBookmarks() {
        var i, para, para_wert, htmlstring;
        $('.popup_bookmarks').empty();
        $('.popup_bookmarks').css('display', 'block');
        for (i = 0; i < localStorage.length; i++) {
            para = localStorage.key(i);
            para_wert = store.get(para);
            if (para_wert === 'bookmarked') {
                htmlstring = $('.popup_bookmarks').html();
                $('.popup_bookmarks').html(htmlstring + "<br/><li><a href='#' id='link' onclick='var getArticle = require(\"helper/getArticle\"); getArticle.g(\"" + para + "\"); return false;'>" + para + "</a></li>");
            }
        }
    }

    //Bookmark-Eventhandler
    function bookmarkEvent() {
        var bookmarked_bool, aktuelles_lemma;
        aktuelles_lemma = $('#lemma').html();
        bookmarked_bool = store.get(aktuelles_lemma);
        if (bookmarked_bool === "bookmarked") {
            unbookmarkArticle(aktuelles_lemma);
            $("#bookmarked").css('display', 'none');
            $("#bookmark").css('display', 'block');
        } else {
            bookmarkArticle(aktuelles_lemma);
            $("#bookmark").css('display', 'none');
            $("#bookmarked").css('display', 'block');
        }
    };
    
    return {event: function() {
        bookmarkEvent();
    },
            show: function() {
                showBookmarks();
            }
           }
});