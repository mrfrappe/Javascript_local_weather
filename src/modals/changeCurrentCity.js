import $ from 'jquery';
// import 'bootstrap-popover-x';
var changeCurrentCity = {};


$.fn.changeCurrentCity = function (options) {
    var changeCurrentCity = {};
    changeCurrentCity.$modal = $("#change-city-popover");

    changeCurrentCity.init = function () {
        if (changeCurrentCity.settings) {
           (defaults.$initButton).off('click').on('click', function(e) {
               
            $('#change-city-popover').remove();

            var $popover = $(changeCurrentCity.popoverTpl);
            
            $popover.css('transform', 'translate3d(270px,160px, 0px)')
            $('body').append($popover)
           })
        }

    };

    var instance = $.data(this, changeCurrentCity);
    if (instance) {
        changeCurrentCity = instance;
        $.extend(instance.settings, options);
        changeCurrentCity.init();
    } else {
        $.data(this, changeCurrentCity, changeCurrentCity);
    };
    changeCurrentCity.popoverTpl = '' +
            '<div id="change-city-popover" class="popover fade show bs-popover-right" role="tooltip" id="popover419371" x-placement="right" style="will-change: transform; position: absolute; top: 0px; left: 0px;">'+
                '<div class="arrow" style="top: 34px;"></div><h3 class="popover-header">Popover title</h3><div class="popover-body">And her\'s some amazing content. It\'s very engaging. Right?</div>'+
            '</div>';

    var defaults = {
        collection: [],
        $initButton: $(this)
    };

    changeCurrentCity.settings = $.extend(defaults, options);
    changeCurrentCity.init();
};


export default changeCurrentCity;