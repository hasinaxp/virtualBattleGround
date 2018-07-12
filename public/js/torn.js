$(document).ready( function() {
    $('.modal').modal();
    $('.fixed-action-btn').floatingActionButton();


    $('select').formSelect();
    var snav = document.querySelector('.sidenav');
    var i_snav = M.Sidenav.init(snav);
    var colaps = document.querySelector('.collapsible');
    var i_colaps = M.Collapsible.init(colaps, {
        accordion: false
    });
    var colaps1 = document.querySelector('.collapsible.popout');
    var i_colaps1 = M.Collapsible.init(colaps1, {
        accordion: false
    });

});