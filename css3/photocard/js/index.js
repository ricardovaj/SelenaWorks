var last = null;
var timer = setTimeout(function(){
    $('.init').removeClass();
},100); 
$('#wrap ul').on('click','li',function(e){
    $('#wrap ul').attr('id','activeWrap');
    last && (last.removeClass());
    last = $(this);
    last.addClass('active');
    $(e.currentTarget).find('.close').on('click',function(e){
        $('#wrap ul').attr('id','');
        last.removeClass();
        e.stopPropagation();
    });
});