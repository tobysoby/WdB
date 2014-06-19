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

function bedeutungUmsetzungDiv (bedeutung) { // Verweise werden nicht durch Links ersetzt, sondern durch spans mit ids, die können dann mit einer click-Funktion aktiviert werden.
    var verweis, verweis_link, para1, para2, para3, i, text, bedeutung_text, absatz;
    var skript_arr = new Array ();
    var bedeutung_text_arr = new Array ();
    
    $(bedeutung).find('absatz').each(function () { // für jeden Absatz in der Bedeutung
        var verweis_link_arr = new Array (); // die Arrays müssen für jeden Absatz neu gesetzt werden, sonst sind noch Reste drin die später wieder mit ausgegeben werden
        var verweis_arr = new Array ();
        var text_arr = new Array ();
        absatz = $(this);
        bedeutung_text = '';
        $(absatz).find('text').each(function () { // hole die Text-Nodes
            text = $(this).text(); // Text aus Text-Nodes
            text_arr.push(text); // packs in das Text_Array
        });
        $(absatz).find('verweis').each(function () { // hole Verweis-Nodes
            verweis = $(this).text(); // hole Verweis
            verweis_link = $(this).attr("idref"); // hole Verweis-Link aus dem Attribut
            verweis_arr.push(verweis); // packs in den den Verweis_Array
            verweis_link_arr.push(verweis_link); // dito
        });
        for (i=0; i<verweis_arr.length; i++) { // Handler: schreiben und in einen Array pushen
            para3 = "<script>$('#" + verweis_link_arr[i] + "').click(function () {getArticle('" + verweis_link_arr[i] + "');});</script>";
            skript_arr[i] = para3;
        };
        for (i=0; i<verweis_arr.length; i++) { // Verweise umbauen
            verweis_arr[i] = "<span id='" + verweis_link_arr[i] + "' style='text-decoration: underline;'>" + verweis_arr[i] + "</span>";
        }
        bedeutung_text = '' // alles neu zusammenbauen
        for (i=0; i<text_arr.length; i++) {
            if (verweis_arr[i] == null) {
                verweis_arr[i] = '';
            }
            bedeutung_text = bedeutung_text + text_arr[i] + verweis_arr[i];
        }
        for (i=0; i<skript_arr.length; i++) {
            bedeutung_text = bedeutung_text + '<div>' + skript_arr[i] + '</div>';
        }
        bedeutung_text = bedeutung_text + '<br/>';
        //console.log(bedeutung_text);
        bedeutung_text_arr.push(bedeutung_text); // pushe sie in eine Array der alle einzelnen Absätze enthält
    });
    
    bedeutung_text = '';
    for (i=0; i<bedeutung_text_arr.length; i++) { // baue alle einzelnen Absätze zusammen
        bedeutung_text = bedeutung_text + bedeutung_text_arr[i];
    }
    return bedeutung_text; // returne die zusammengesetzte Bedeutung
}
function parseXML(xml, parameter) {
    var alle_artikel = $(xml).find('artikel');
    $(alle_artikel).each(function () {
        var artikel, lemma, id, absatz, bedeutung, bedeutung_text, bedeutung_text_2, abbildung_src, l_zusatz, para2, verweis, verweis_link, test, para3;
        artikel = $(this);
        lemma = $(artikel).find('lemma').text();
        id = $(artikel).attr('id');
        //absatz = $(artikel).find('absatz');
        if (lemma === parameter || id === parameter) {
            bedeutung = $(artikel).find('bedeutung');
            abbildung_src = $(artikel).find('abbildung').attr('src');
            l_zusatz = $(artikel).find('l_zusatz').text();
            bedeutung_text = bedeutungUmsetzungDiv(bedeutung);
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

//Highlighting
function highlightText (zuHighlighten, parameter) {
    $(document).ready(function () {
        $.ajax({
            type: "GET",
            url: "src/data.xml",
            dataType: "xml",
            success: function (xml) {
                var alle_artikel = $(xml).find('artikel');
                $(alle_artikel).each(function () {
                    var artikel, lemma, id, absatz, bedeutung, bedeutung_text, bedeutung_text_2, abbildung_src, l_zusatz, para2, verweis, verweis_link, test, para3;
                    var high_id;
                    var high_array;
                    artikel = $(this);
                    lemma = $(artikel).find('lemma').text();
                    id = $(artikel).attr('id');
                    if (lemma === parameter || id === parameter) {
                        bedeutung = $(artikel).find('bedeutung');
                        abbildung_src = $(artikel).find('abbildung').attr('src');
                        l_zusatz = $(artikel).find('l_zusatz').text();
                        bedeutung_text = bedeutungUmsetzungDiv(bedeutung);
                        //Highlighten
                        bedeutung_text = bedeutung_text.replace(zuHighlighten, '<span class="high">' + zuHighlighten + '</span>');
                        var high_id = id + '_high';
                        //console.log(high_id);
                        //high_array = window.localStorage.getItem(high_id);
                        high_array = store.get(high_id);
                        high_array.push(zuHighlighten);
                        store.set(high_id, high_array);
                        //
                        showArticle(id, lemma, l_zusatz, bedeutung_text, abbildung_src);
                    }
                });
            }
        });
    });
}
$('.highlight').click(function () {
    var id = $('#id').html();
    var zuHighlighten = document.getSelection();
    highlightText(zuHighlighten, id);
});

function checkHighlighting (id, bedeutung_text) {
    var high_id, high_array, i;
    high_id = id + '_high';
    high_array = store.get(high_id);
    if (high_array == null) {
        high_array = new Array ();
        high_array[0] = 'bisher nix.';
        store.set(high_id, high_array);
    } else {
        for (i=0; i<high_array-length; i++) {
            bedeutung_text = bedeutung_text.replace(high_array[i], '<span class="high">' + high_array[i] + '</span>');
        }
    }
    return bedeutung_text;
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
    var para;
    $('#lemma').text(lemma);
    $('#lemmazusatz').text(l_zusatz);
    $('#bedeutung').empty();
    bedeutung_text = checkHighlighting (id, bedeutung_text);
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
    var id, comments_array, html, i, comment_html;
    id = $('#id').html();                                   //was ist die ID des aktuellen Artikels?
    comments_array = store.get(id);                               //gibt es hierzu schon Kommentare im local storage?
    if (comments_array == null) {                                 //wenn nicht...
        comments_array = new Array();                             //... leg einen neuen Array an
        comments_array[0] = 'Bisher wurde kein Kommentar angelegt.';
        $('#comment_list').html('<li>' + comments_array[0] + '</li>');  //...schreib das hin
        store.set(id, comments_array);                            //Und speicher den neuen Comment-Array (wichtig für saveComment).
    } else {                                                //gibts einen ...
        //$('#comment_list').html(html + '<li>' + comments_array[0] + '</li><br/>');
        $('#comment_list').empty();
        for (i = 0; i < comments_array.length; i++) {             //... geh den durch und addiere alle htmls
            
            comment_html = '<span id="comm' + i + '">' + comments_array[i] + '</span><script>$("#comm' + i + '").click(function () {changeComment("' + comments_array[i] + '","' + i + '") });</script>'; // macht die einzelnen Kommentare klickbar.
            
            $('<li></li>').html(comment_html).appendTo('#comment_list');
        }
    }
}

function changeComment (comment, comment_id) { // ist eigentlich ganz einfach: übernimm den Inhalt des Kommentars und setze ihne als neuen Wert des Input-Feldes.
    $('#popup_comment').css('display', 'none');
    $('#popup_comment_new_note').css('display', 'block');
    $('#comments_textarea').val(comment);
    $('#comment_id').text(comment_id);
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
    var id, comment_new, comments_array, comment_id;
    id = $('#id').html(); // hol die ID
    comments_array = store.get(id); // hol die bisherigen Kommentare
    comment_new = $('#comments_textarea').val();  // das ist der Inhalt, der jetzt als comment angelegt werden soll
    comment_id = $('#comment_id').html(); // soll ein Comment geändert werden, dann ist das die Stell im Array
    $('#comment_id').html(''); // und sicherheitshalber wieder leer machen.
    if (comment_id == '') {
        if (comments_array[0] == 'Bisher wurde kein Kommentar angelegt.') { // falls bisher keiner da ist...
            comments_array[0] = comment_new; // ... setze den Inhalt
        } else {
            comments_array.push(comment_new); // ansonsten pack den Inhalt hinten ran
        }                                        
    } else {
        comments_array[comment_id] = comment_new;
    }
    store.set(id, comments_array); // speicher alles
    $('#popup_comment_new_note').css('display', 'none');
    $('#popup_comment').css('display', 'block');
    showComment();  //geh zurück zu den Comments. (Aufruf von showComment, weil hierdurch alles neu geladen wird.)
}
function deleteComment() {
    var id, comment_id, comments_array;
    id = $('#id').html();
    comment_id = $('#comment_id').html();
    comments_array = store.get(id);
    comments_array.splice(comment_id, 1);
    store.set(id, comments_array); // speicher alles
    $('#popup_comment_new_note').css('display', 'none');
    $('#popup_comment').css('display', 'block');
    showComment();  //geh zurück zu den Comments. (Aufruf von showComment, weil hierdurch alles neu geladen wird.)
}
$('#add_comment_button').click(function () {
    $('#comments_textarea').val('')
    $('#popup_comment').css('display', 'none');
    $('#popup_comment_new_note').css('display', 'block');
});
$('#save_comment_button').click(function () {
    saveComment();
});
$('#delete_comment_button').click(function () {
    deleteComment();
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