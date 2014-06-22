define(function (require) {
    
    var history = require('helper/history');
    var store = require('store');

return {show : function (id, lemma, l_zusatz, bedeutung_text, abbildung_src) {
    var para;
    $('#lemma').text(lemma);
    $('#lemmazusatz').text(l_zusatz);
    $('#bedeutung').empty();
    $('#bedeutung').html(bedeutung_text);
    $('#id').text(id);
    history.add(lemma);
    var bookmarked_bool = store.get(lemma);
    if (bookmarked_bool === "bookmarked") {
        $("#bookmark").css('display', 'none');
        $("#bookmarked").css('display', 'block');
    } else {
        $("#bookmarked").css('display', 'none');
        $("#bookmark").css('display', 'block');
    }
    if (abbildung_src != null) {
        $('#abbildung').html("<img id='abbildung_div' src=img/" + abbildung_src + ">");
    } else {
        $('#abbildung').empty();
    }
}
       }
});