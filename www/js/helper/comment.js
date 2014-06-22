//Comments

define (function() {
    var store = require('store');

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
            
            comment_html = '<span id="comm' + i + '">' + comments_array[i] + '</span><script>$("#comm' + i + '").click(function () {var comment = require("helper/comment"); comment.change("' + comments_array[i] + '","' + i + '") });</script>'; // macht die einzelnen Kommentare klickbar.
            
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

    return {show: function() {
        showComment();
    },
            change: function(comment, comment_id) {
        changeComment(comment, comment_id);
    },
            save: function() {
        saveComment();
    },
            del: function() {
        deleteComment();
    },
           }
});
      
      