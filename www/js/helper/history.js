define(function (require) {
    
    var store = require('store');
 
return {
    //checke if schon eine history besteht, und wie lange die ist
check: function() {
    var history = new Array ();
    history = store.get('hist');
    if (history == null) {
        history = ['nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix',  'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix', 'nix'];
        store.set('hist', history);
    }
},
    
add: function(lemma) {
    var i, hist_time;
    var history_arr;
    hist_time = new Date();
    history_arr = store.get('hist')
    var test = history_arr.typeof;
    if (history_arr.length == 999) { //Speicherlänge der History
        history_arr.pop();
    }
    history_arr.unshift({hist_lemm: lemma, hist_time: hist_time});
    store.set('hist', history_arr);
},
    
show: function() {
    var hist_arr, htmlstring, i, hist_lemm, hist_time;
    $('.popup_history').css('display', 'block');
    hist_arr = store.get('hist');
    $('.popup_history').html('Die letzten 10 aufgerufenen Artikel');
    for (i = 0; i < 20; i = i + 2) {
        htmlstring = $('.popup_history').html();
        if (hist_arr[i] != 'nix') {
            $('.popup_history').html(htmlstring + "<br/><li><a href='#' id='link' onclick='var getArticle = require(\"helper/getArticle\"); getArticle.g(\"" + hist_arr[i].hist_lemm + "\"); return false;'>" + hist_arr[i].hist_lemm + "</a><br/>" + hist_arr[i].hist_time + "</li>");
        }
    }
}
} 
});