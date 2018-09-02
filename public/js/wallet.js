$(document).ready(function () {
    $('.modal').modal();

    $('select').formSelect();
    var snav = document.querySelector('.sidenav');
    var i_snav = M.Sidenav.init(snav);
    var colaps = document.querySelector('.collapsible');
    var i_colaps = M.Collapsible.init(colaps, {
        accordion: false
    });
    $('#paging').paging({ limit: 10 });
    //events---------------------------------------------


});