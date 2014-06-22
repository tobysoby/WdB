/*jslint browser:true */
/*jslint node: true */
/*global $, jQuery, alert*/
"use strict";

define(function (require) {
    
    var getArticle = require('helper/getArticle');
    var history = require('helper/history');
    var store = require('store');
    var highlight = require('helper/highlight');
    var bookmark = require('helper/bookmark');
    var comment = require('helper/comment');

    window.onload = history.check();

    $('.print').click(function () {
        highlight.note();
    });


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


$("#bookmarked").click(function () {
    bookmark.event();
});
$("#bookmark").click(function () {
    bookmark.event();
});

var lemmata = new Array();
var para1 = "-2";

$('.bookmarks').click(function () {
    var para1;
    para1 = $('.popup_bookmarks').css('display');
    if (para1 == 'none') {
        bookmark.show();
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
        getArticle.g(random_article_title);
    });
}
/*$(document).ready(function() { //Letzter article bei Start: funkt
    var last_article, history;
    history = store.get('hist');
    last_article = history[1].hist_lemm;
    getArticle.g(last_article);
});*/

$('#search-input').autocomplete({
    source: lemmata,
    appendTo: '#search-result',
    select: function (event, ui) {
        getArticle.g(ui.item.label);
    }
});

$('.history').click(function () {
    //closeAllPopups ('.popup_history');
    var para1;
    para1 = $('.popup_history').css('display');
    if (para1 == 'none') {
        history.show();
        return false;
    }
    if (para1 == 'block') {
        $('.popup_history').css('display', 'none');
    }
});

//Comments
$('#button_comment').click(function () {
    var para1, para2;
    para1 = $('#popup_comment').css('display');
    para2 = $('#popup_comment_new_note').css('display');
    if (para1 == 'none' && para2 == 'none') {
        $('#popup_comment').css('display', 'block');
        comment.show();
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
$('#add_comment_button').click(function () {
    $('#comments_textarea').val('')
    $('#popup_comment').css('display', 'none');
    $('#popup_comment_new_note').css('display', 'block');
});
$('#save_comment_button').click(function () {
    comment.save();
});
$('#delete_comment_button').click(function () {
    comment.del();
});

//Wenn man irgendwo hinklickt
$('#article').click(function () {
    closeAllPopups();
});
function closeAllPopups(aktuellesPopup) {
    
    $('.popup_categories').css('display', 'none');
    $('.popup_bookmarks').css('display', 'none');
    $('.popup_history').css('display', 'none');
    $('.popup_highlighting').css('display', 'none');
    $('#popup_comment').css('display', 'none');
    $('#popup_comment_new_note').css('display', 'none');
    $(aktuellesPopup).css('display', 'block');
}
    /*
    var popupArray = new Array ();
    var para;
    popupArray = [".popup_categories", "popup_bookmarks", "popup_history", "popup_highlighting", "popup_comment", "popup_comment_new_note"];
    for (var i = 0; i<popupArray.length; i++) {
        if (popupArray[i] != aktuellesPopup) {
            para = popupArray[i];
            $(para).css("display", "none");
        }
    }
}*/

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
                    $('<li></li>').html("<a href='#' onclick='var getArticle = require(\"helper/getArticle\"); getArticle.g(\"" + art_id + "\"); return false;'>" + art_lemm + "</a>").appendTo('#search-result');
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
    getArticle.g(new_id);
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
    getArticle.g(new_id);
}
$('.forward').click(function () {
    jumpForward();
});
    
});