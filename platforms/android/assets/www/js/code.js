/*jslint browser:true */
/*jslint node: true */
/*global $, jQuery, alert*/
"use strict";

//checke if schon eine history besteht, und wie lange die ist
function historyCheck() {
    var history = new Array ();
    history = store.get('hist');
    if (history == null) {
        history = ['nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix',  'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix'];
        store.set('hist', history);
    }
}
window.onload = historyCheck();

//Unterfunktion getArticle
function bedeutungUmsetzung(bedeutung) {
    var verweis, verweis_link, bedeutung_text, para, span;
    $(bedeutung).find('verweis').each(function () {
        verweis = $(this).text();
        verweis_link = $(this).attr("idref");
        $(this).html("<a href='#' id='link' onclick='getArticle(\"" + verweis_link + "\"); return false;'>" + verweis + "</a>");
    });
    bedeutung = bedeutung.html();
    return bedeutung;
}
function bedeutungUmsetzungJavascript (bedeutung) { // Versuch alles ohne JQuery sondern mit quasi nativem Javascript zu lösen
    var verweis, verweis_link, para1, para2;
    var verweis_arr = new Array (); // neuer Array
    $(bedeutung).find('verweis').each(function () {
        verweis = $(this).text();
        verweis_link = $(this).attr("idref");
        para1 = "<a href='#' id='link' onclick='getArticle(\"" + verweis_link + "\"); return false;'>" + verweis + "</a>";
        para2 = $(this);
        //var htmlObject = document.createElement('div');
        //htmlObject.innerHTML = para1;
        $(para2).replaceWith(para1);
    });
    //bedeutung = bedeutung.html();
    return bedeutung;
}
function bedeutungUmsetzungDiv (bedeutung_text) { // Verweise werden nicht durch Links ersetzt, sondern durch spans mit ids, die können dann mit einer click-Funktion aktiviert werden.
    var verweis, verweis_link, para1, para2, para3, i;
    var verweis_arr = new Array ();
    $(bedeutung_text).find('verweis').each(function () {
        verweis = $(this).text();
        verweis_link = $(this).attr("idref");
        verweis_arr.push(verweis_link);
        para1 = "<span id='" + verweis_link + "' style='text-decoration: underline;'>" + verweis + "</span>";
        para2 = $(this);
        $(para2).replaceWith(para1);
    });
    //console.log(verweis_arr);
    for (i=0; i<verweis_arr.length; i++) {
        para3 = "<script>$('#" + verweis_arr[i] + "').click(function () {getArticle('" + verweis_arr[i] + "');});</script>";
        $(para3).appendTo(bedeutung_text);
        //bedeutung.write("<div><script>$('#" + verweis_arr[i] + "').click(function () {getArticle('" + verweis_arr[i] + "');});</script></div>");
    };
    //bedeutung = bedeutung.html();
    return bedeutung_text;
}
function bedeutungUmsetzungRegExp(bedeutung) {
    var eins, zwei, drei, eins_n, zwei_n, drei_n;
    eins = /<verweis idref="/g;
    zwei = /" typ="t01">/g;
    drei = /<.verweis>/g;
    eins_n = "<a href='#' id='link' onclick='getArticle(\"";
    zwei_n = "\"); return false;'>";
    drei_n = "</a>";
    /*$(bedeutung).html('<verweis idref="').replaceWith("<a href='#' id='link' onclick='getArticle(\"");
    $(bedeutung).html('" typ="t01">').replaceWith("\"); return false;'>");
    $(bedeutung).html('</verweis>').replaceWith("</a>");*/
    bedeutung = bedeutung.replace(/<verweis idref="/g, "<a href='#' id='link' onclick='getArticle(\"");
    bedeutung = bedeutung.replace(/" typ="t01">/g, zwei_n);
    bedeutung = bedeutung.replace(/<.verweis>/g, "</a>");
    return bedeutung;
}
function parseXML(xml, parameter) {
    var alle_artikel = $(xml).find('artikel');
    $(alle_artikel).each(function () {
        var artikel, lemma, id, absatz, bedeutung, bedeutung_text, bedeutung_text_2, abbildung_src, l_zusatz, para2, verweis, verweis_link, test;
        artikel = $(this);
        lemma = $(artikel).find('lemma').text();
        l_zusatz = $(artikel).find('l_zusatz').text();
        id = $(artikel).attr('id');
        absatz = $(artikel).find('absatz');
        //bedeutung = $(artikel).find('bedeutung');
        abbildung_src = $(artikel).find('abbildung').attr('src');
        //bedeutung_text = bedeutung.text(); //auffem Tablet funkts nur mit reinem Text -> bedeutungUmsetzung baut Links ein.
        if (lemma === parameter || id === parameter) {
            bedeutung_text = bedeutungUmsetzungDiv(absatz);
            //console.log(absatz);
            console.log(bedeutung_text);
            //bedeutung_text_2 = bedeutung_text;
            //bedeutung_text = bedeutung_text[0].innerHTML;
            bedeutung_text = bedeutung_text[0].outerHTML;
            console.log(bedeutung_text);
            showArticle(id, lemma, l_zusatz, bedeutung_text, abbildung_src);
        }
    });
}
function getArticle(parameter) {
    $(document).ready(function () {
        $.ajax({
            type: "GET",
            url: "src/data.xml",
            dataType: "xml",
            success: function (xml) {
                parseXML(xml, parameter);
            }
        });
    });
}

//Artikel suchen
function artikelSuchen() {
    var parameter, eingabe = $("#search-input").val();
    if (eingabe !== "") {
        parameter = eingabe;
    }
    /*
    if (eingabe == "") {
        //schreibe: Unpassender Suchbegriff
    }*/
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
var showArticle = function (id, lemma, l_zusatz, bedeutung_text, abbildung_src) {
    $('#lemma').text(lemma);
    $('#lemmazusatz').text(l_zusatz);
    $('#bedeutung').html(bedeutung_text);
    $('#id').text(id);
    addToHistory(lemma);
    if (abbildung_src != null) {
        $('#abbildung').html("<img id='abbildung_div' src=img/" + abbildung_src + ">");
    } else {
        $('#abbildung').empty();
    }
    var bookmarked_bool = window.localStorage.getItem(lemma);
    if (bookmarked_bool === "bookmarked") {
        $("#bookmark").css('display', 'none');
        $("#bookmarked").css('display', 'block');
    } else {
        $("#bookmarked").css('display', 'none');
        $("#bookmark").css('display', 'block');
    }
};

//Bookmark-Eventhandler
function bookmarkEvent() {
    var bookmarked_bool, aktuelles_lemma;
    aktuelles_lemma = $('#lemma').html();
    bookmarked_bool = window.localStorage.getItem(aktuelles_lemma);
    if (bookmarked_bool === "bookmarked") {
        unbookmarkArticle(aktuelles_lemma);
        $("#bookmarked").css('display', 'none');
        $("#bookmark").css('display', 'block');
    } else {
        bookmarkArticle(aktuelles_lemma);
        $("#bookmark").css('display', 'none');
        $("#bookmarked").css('display', 'block');
    }
}
$("#bookmarked").click(function () {
    bookmarkEvent();
});
$("#bookmark").click(function () {
    bookmarkEvent();
});

var lemmata = new Array();
var para1 = "-2";

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
    //closeAllPopups ('.popup_bookmarks');
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
                randomArticle();
            }
        });
    });
    
}
window.onload = articlesInArray();
function randomArticle() { //Random article bei Start: funkt nur wenn es in articleInArray aufgerufen wird... muss wohl erst geladen sein...
    $(document).ready(function () {
        var lemmata_leng, random_num, random_article_title;
        lemmata_leng = lemmata.length;
        random_num = Math.floor(Math.random() * lemmata_leng + 1);
        random_article_title = lemmata[random_num];
        getArticle(random_article_title);
    });
}
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
        getArticle(ui.item.label);
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
    //closeAllPopups ('.popup_history');
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

//Comments
function showComment() {
    var id, comments_array, html, i;
    id = $('#id').html();                                   //was ist die ID des aktuellen Artikels?
    comments_array = store.get(id);                               //gibt es hierzu schon Kommentare im local stprage?
    if (comments_array == null) {                                 //wenn nicht...
        comments_array = new Array();                             //... leg einen neuen Array an
        comments_array[0] = 'Bisher wurde kein Kommentar angelegt.';
        $('#comment_list').html('<li>' + comments_array[0] + '</li>');  //...schreib das hin
        store.set(id, comments_array);                            //Und speicher den neuen Comment-Array (wichtig für saveComment).
    } else {                                                //gibts einen ...
        $('#comment_list').html(html + '<li>' + comments_array[0] + '</li><br/>');
        for (i = 1; i < comments_array.length; i++) {             //... geh den durch und addiere alle htmls
            $('<li></li>').html(comments_array[i]).appendTo('#comment_list');
        }
    }
}
$('#button_comment').click(function () {
    var para1, para2;
    para1 = $('#popup_comment').css('display');
    para2 = $('#popup_comment_new_note').css('display');
    if (para1 == 'none' && para2 == 'none') {
        $('#popup_comment').css('display', 'block');
        showComment();
        return false;
    }
    if (para1 == 'block') {
        $('#popup_comment').css('display', 'none');
    }
    if (para2 == 'block') {
        $('#popup_comment_new_note').css('display', 'none');
    }
    //closeAllPopups();
});
function saveComment() {
    var id, comment_new, comments_array;
    id = $('#id').html();
    comments_array = store.get(id);
    comment_new = $('#comments_textarea').val();
    if (comments_array[0] == 'Bisher wurde kein Kommentar angelegt.') {
        comments_array[0] = comment_new;
    } else {
        comments_array.push(comment_new);
    }
    store.set(id, comments_array);
    $('#popup_comment_new_note').css('display', 'none');
    $('#popup_comment').css('display', 'block');
    showComment();                                          //geh zurück zu den Comments. (Aufruf von showComment, weil hierdurch alles neu geladen wird.)
}
$('#add_comment_button').click(function () {
    $('#popup_comment').css('display', 'none');
    $('#popup_comment_new_note').css('display', 'block');
});
$('#save_comment_button').click(function () {
    saveComment();
});

//Wenn man irgendwo hinklickt
$('#article').click(function () {
    closeAllPopups();
});
function closeAllPopups(aktuell) {
    $('.popup_categories').css('display', 'none');
    $('.popup_bookmarks').css('display', 'none');
    $('.popup_history').css('display', 'none');
    $('#popup_comment').css('display', 'none');
    $('#popup_comment_new_note').css('display', 'none');
    $(aktuell).css('display', 'block');
}

//Kategorien
var categories_Array = new Array();
//var categories_Id_Array = new Array();
function categoriesInArray() {
    $(document).ready(function () {
        $.ajax({
            type: "GET",
            url: "src/data.xml",
            dataType: "xml",
            success: function (xml) {
                var id, category;
                $(xml).find('kategorien').each(function () {
                    $(this).find('kategorie').each(function () {
                        id = $(this).attr("id");
                        category = $(this).text();
                        categories_Array[categories_Array.length] = {Id: id, name: category}
                    });
                });
            }
        });
    });
}
window.onload = categoriesInArray();
function showCategories() {
    var i;
    $('.popup_categories').empty();
    $('.popup_categories').css('display', 'block');
    for (i = 0; i < categories_Array.length; i++) {
        $('<li></li>').html("<a href='#' onclick='getCategories(\"" + categories_Array[i].Id + "\"); return false;'>" + categories_Array[i].name + "</a>").appendTo('.popup_categories');
    }
}
$('#button_categories').click(function () {
    var para1;
    para1 = $('.popup_categories').css('display');
    if (para1 == 'none') {
        showCategories();
        return false;
    }
    if (para1 == 'block') {
        $('.popup_categories').css('display', 'none');
    }
});
function getCategories(Id) {
    var para, cat_id, cat, art_id, art_lemm, html;
    $('#search-result').empty();
    $.ajax({
        type: "GET",
        url: "src/data.xml",
        dataType: "xml",
        success: function (xml) {
            var id, category;
            $(xml).find('artikel').each(function () {
                art_id = $(this).attr('id');
                art_lemm = $(this).find('lemma').text();
                cat_id = $(this).find('kat').attr('id');
                if (cat_id == Id) {
                    $('<li></li>').html("<a href='#' onclick='getArticle(\"" + art_id + "\"); return false;'>" + art_lemm + "</a>").appendTo('#search-result');
                }
            });
            html = $('#search-result').html();
            $('#search-result').html('<ul>' + html + '</ul>');
        }
    });
}

//weiterspringen
function jumpBack() {
    var id, new_id, para;
    id = $('#id').html();
    para = id.slice('1', '6');
    para = parseInt(para);
    para = para - 1;
    para = para.toString();
    new_id = 'a' + para;
    getArticle(new_id);
}
$('.back').click(function () {
    jumpBack();
});
function jumpForward() {
    var id, new_id, para;
    id = $('#id').html();
    para = id.slice('1', '6');
    para = parseInt(para);
    para = para + 1;
    para = para.toString();
    new_id = 'a' + para;
    getArticle(new_id);
}
$('.forward').click(function () {
    jumpForward();
});

/*Todo
- Notizen: einzelne bearbeiten
- History: Mit Hack erledigt. 
- Kategorien: funkt, bis auf Anzeige der Ergebnisse
- Fehlermeldungen
- Article of the day: Random article funkt.
- Markierungen
- Wenn man irgendwohin klickt sollten alle popupmenus geschlossen werden: klappt, aber: wenn ein menü auf ist, sollte dies beim öffnen eines anderen geschlossen werden.
- Abbildungen zoomen.
*/