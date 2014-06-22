define(function (require) {

    var showArticle = require('helper/showArticle');
    var store = require('store');
    
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
            para3 = "<script>$('#" + verweis_link_arr[i] + "').click(function () {var getArticle = require('helper/getArticle'); getArticle.g('" + verweis_link_arr[i] + "');});</script>";
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
            var high_id = id + '_high'; // baue die high_id
            var high = store.get(high_id); // hole den eventuell gehilightete Text
            if (high) bedeutung_text = high; // ist er gehighlightet (ist etwas im local storage), dann nimm ihn
            else {bedeutung_text = bedeutungUmsetzungDiv(bedeutung)}; // wenn nicht, mach die Umsetzung
            showArticle.show(id, lemma, l_zusatz, bedeutung_text, abbildung_src);
        }
    });
}

return {g: function(parameter) {
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
       }
    
});