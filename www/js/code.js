/*jslint browser:true */
/*jslint node: true */
/*global $, jQuery, alert*/
"use strict";

//Artikel suchen
function artikelSuchen() {
    var parameter, eingabe = $("#search-input").val();
    if (eingabe !== "") {
        parameter = eingabe;
    }
    if (eingabe == "") {
        //schreibe: Unpassender Suchbegriff
    }
    getArticle(parameter);
}
$("#artikel_suchen").click(function () {
    artikelSuchen();
});
$("#search-input").keyup(function (event) {
    if (event.keyCode == 13) {
        artikelSuchen();
    }
});


//Artikel bookmarken
var bookmarkArticle = function (lemma) {
    window.localStorage.setItem(lemma, 'bookmarked');
};
var unbookmarkArticle = function (lemma) {
    window.localStorage.setItem(lemma, 'nix');
};

//Artikel anzeigen
var showArticle = function (id, lemma, l_zusatz, bedeutung, abbildung_src) {
    $('h1.lemma').html(lemma);
    addToHistory(lemma);
    $('#article .lemmazusatz').html(l_zusatz);
    $('#article .bedeutung').html(bedeutung);
    $('#article .id').html(id);
    if (abbildung_src != null) {
        $('#article .abbildung').html("<img src=img/" + abbildung_src + ">");
    } else {
        $('#article .abbildung').empty();
    }
    var bookmarked_bool = window.localStorage.getItem(lemma);
    if (bookmarked_bool === "bookmarked") {
        $("#bookmark").html("Bookmark");
    } else {
        $("#bookmark").html("Bookmarked");
    }
};

//Bookmark-Eventhandler
$("#bookmarked").click(function () {
    var bookmarked_bool, aktuelles_lemma;
    aktuelles_lemma = $('.lemma').html();
    bookmarked_bool = window.localStorage.getItem(aktuelles_lemma);
    if (bookmarked_bool === "bookmarked") {
        unbookmarkArticle(aktuelles_lemma);
        $("#bookmark").html("Bookmark");
    } else {
        bookmarkArticle(aktuelles_lemma);
        $("#bookmark").html("Bookmarked");
    }
});

var showMoreArticles = function (id, lemma, l_zusatz, bedeutung, abbildung_src) {
    $('<div></div>').html('Artikel-ID: ' + id + '<br/>' + 'Lemma: ' + lemma + '</br>' + 'l_zusatz: ' + l_zusatz + '</br>' + bedeutung + '</br>').appendTo('#weitere_Artikel');
    if (abbildung_src != null) {
        $('<div></div>').html("<img src=img/" + abbildung_src + "></br></br>").appendTo('#weitere_Artikel');
    }
};

var lemmata = new Array();
var para1 = "-2";

//Unterfunktion getArticle
function getArticle(parameter) {

//Lade das XML
    $(document).ready(function () {
        $.ajax({
            type: "GET",
            url: "src/data.xml",
            dataType: "xml",

//Wenn erfolgreich
            success: function (xml) {

//Für jeden Node 'Artikel', tue:
                var alle_artikel = $(xml).find('artikel');
                $(alle_artikel).each(function () {

//Hole die einzelnen Bestandteile pro Artikel:
                    var artikel, lemma, id, absatz, bedeutung, bedeutung_text, abbildung_src, l_zusatz, para2;
                    artikel = $(this);
                    lemma = $(artikel).find('lemma').text();
                    l_zusatz = $(artikel).find('l_zusatz').text();
                    id = $(artikel).attr('id');
                    absatz = $(artikel).find('absatz').text();
                    bedeutung = $(artikel).find('bedeutung');
                    
                    abbildung_src = $(artikel).find('abbildung').attr('src');

//Stimmt das aktuelle Lemma mit der Eingabe überein?
                    if (lemma === parameter || id === parameter) {
//hole die anderen Infos aus den einzelnen Nodes
                        showArticle(id, lemma, l_zusatz, bedeutung_text, abbildung_src);
                        
                        //Verweise:
                        $(bedeutung).find('verweis').each(function () {
                            var verweis, verweis_link;
                            verweis = $(this).text();
                            verweis_link = $(this).attr("idref");
                            $(this).replaceWith('<a href="" id="link" onclick="getArticle(\'' + verweis_link + '\'); return false;">' + verweis + '</a>');
                            //getVerweise(this);
                        });
                        //Ende Verweise.
                        bedeutung_text = $(bedeutung).html();
                        showArticle(id, lemma, l_zusatz, bedeutung_text, abbildung_src);
                    }

//Gibt es den Parameter in irgendeinem Text?
                    para2 = absatz.indexOf(parameter);
                    if (para2 != "-1") {
                        if (para1 != "-1") {
                            $('#weitere_Artikel_bool').html('weitere Artikel:<br>');
                            para1 = "-1";
                        }
                        showMoreArticles(id, lemma, l_zusatz, bedeutung_text, abbildung_src);
                    }

                    //funktioniert nicht: checkt bei jedem Artikel ob er den Text nicht beinhaltet und da dem so ist, wird er geleert -> Wird immer geleert...
//                    if (para2 = "-1") {
//                            $('#weitere_Artikel').empty();
//
                    
//                        var verweis = $(this).find('verweis').text();
//                        var verweis_link = $(this).find('verweis').attr('idref');
//                        if (verweis_link != '') {
//                        $('<div></div>').html("<input type='button' value='" + verweis + "' onclick='getArticle('" + verweis_link + "')'><br/><br/>").appendTo('#weitere_Artikel');
//                        }

                });
            }

        });
    }
                     );
}




// Bookmarks anzeigen lassen
function showBookmarks() {
    var i, para3, para3_wert, y, htmlstring;
    $('.popup_bookmarks').empty();
    $('.popup_bookmarks').css('display', 'block');
    for (i = 0; i < localStorage.length; i++) {
        para3 = localStorage.key(i);
        para3_wert = localStorage.getItem(para3);
        if (para3_wert === 'bookmarked') {
            htmlstring = $('.popup_bookmarks').html();
            $('.popup_bookmarks').html(htmlstring + "<br/><li><a href='#' id='link' onclick='getArticle(\"" + para3 + "\"); return false;'>" + para3 + "</a></li>");
        }
    }
}
$('.bookmarks').click(function () {
    var para1;
    para1 = $('.popup_bookmarks').css('display');
    if (para1 == 'none') {
        showBookmarks();
        return false;
    }
    if (para1 == 'block') {
        $('.popup_bookmarks').css('display', 'none');
    }
    
});

//Autosuggest
//Unterfunktion AlleArtikelinArrayladen
function articlesInArray() {
    $(document).ready(function () {
        $.ajax({
            type: "GET",
            url: "src/data.xml",
            dataType: "xml",
            success: function (xml) {
                $(xml).find('artikel').each(function () {
                    var lemma = $(this).find('lemma').text();
                    lemmata[lemmata.length] = lemma;
                });
            }
        });
    });
}
window.onload = articlesInArray();
/*$(document).ready(function () { //Random article bei Start: funkt net
    var lemmata_leng, random_num, random_article_title;
    articlesInArray();
    lemmata_leng = lemmata.length;
    random_num = Math.floor(Math.random() * lemmata_leng + 1);
    window.alert(random_num);
    random_article_title = lemmata[random_num];
    window.alert(random_article_title);
    getArticle(random_article_title);
});*/
/*$(document).ready(function() { //Letzter article bei Start: funkt
    var last_article, history;
    history = store.get('hist');
    last_article = history[1].hist_lemm;
    getArticle(last_article);
});*/

$('#search-input').autocomplete({
    source: lemmata,
    appendTo: '#search-result',
    select: function (event, ui) {
        getArticle(ui.label);
    }
});

//History
function addToHistory(lemma) {
    var i, history, hist_time;
    hist_time = new Date();
    history = store.get('hist');
    if (history.length == 999) { //Speicherlänge der History
        history.pop();
    }
    history.unshift({hist_lemm: lemma, hist_time: hist_time});
    store.set('hist', history);
}
function showHistory() {
    var history, htmlstring, i, hist_lemm, hist_time;
    $('.popup_history').css('display', 'block');
    history = store.get('hist');
    $('.popup_history').html('Die letzten 10 aufgerufenen Artikel');
    for (i = 0; i < 20; i = i + 2) {
        htmlstring = $('.popup_history').html();
        if (history[i] != 'nix') {
            $('.popup_history').html(htmlstring + "<br/><li><a href='#' id='link' onclick='getArticle(\"" + history[i].hist_lemm + "\"); return false;'>" + history[i].hist_lemm + "</a><br/>" + history[i].hist_time + "</li>");
        }
    }
}
$('.history').click(function () {
    var para1;
    para1 = $('.popup_history').css('display');
    if (para1 == 'none') {
        showHistory();
        return false;
    }
    if (para1 == 'block') {
        $('.popup_history').css('display', 'none');
    }
});
//checke if schon eine history besteht, und wie lange die ist
function historyCheck() {
    var history = new Array ();
    history = store.get('hist');
    if (history == null) {
        history = ['nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix',  'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix'];
        store.set('hist', history);
    }
}
window.onload = historyCheck;

//Comment
function showComment() {
    var id, comment, html;
    $('#popup_comment').css('display', 'block');
    id = $('.id').html();
    comment = store.get(id);
    //$('.comments_textarea').attr('placeholder').text(comment);
    html = $('#popup_comment').html();
    $('#popup_comment').html(html + '<br/><br/><a href="" id="button_save_comment" onclick="saveComment(); return false;">Kommentar speichern</a>');
}
$('#button_comment').click(function () {
    var para1;
    para1 = $('#popup_comment').css('display');
    if (para1 == 'none') {
        showComment();
        return false;
    }
    if (para1 == 'block') {
        $('#popup_comment').css('display', 'none');
    }
});
function saveComment() {
    var id, comment;
    id = $('.id').html();
    comment = $('.comments_textarea').attr('placeholder').text();
    store.set(id, comment);
};
function addComment() {
    $('#popup_comment').css('display', 'none');
    $('#popup_comment_new_note').css('display', 'block');
};
$('#add_comment_button').click(function () {
    addComment();
});

/*Todo
- Notizen
- History: Mit Hack erledigt. 
- weiterspringen (Artikel vor, Artikel zurück)
- Kategorien
- Fehlermeldungen
- Article of the day
- Markierungen
- Wenn man irgendwohin klickt sollten alle popupmenus geschlossen werden.
*/