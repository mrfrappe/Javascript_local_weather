import $ from 'jquery';
// import 'bootstrap-popover-x';
var changeCurrentCity = {};


$.fn.changeCurrentCity = function (options) {
    

    return this.each(function () {
        var changeCurrentCity = {};
        changeCurrentCity.$modal = $("#change-city-popover");
        // console.log($(this))
        var instance = $.data(this, 'changeCurrentCity');
        if (instance) {
            // update settings for existing instance and stop
            changeCurrentCity = instance;
            $.extend(instance.settings, options);
            changeCurrentCity.init();
            return;
        } else {
            // store component data
            $.data(this, 'changeCurrentCity', changeCurrentCity);
        }

    changeCurrentCity.init = function () {
        var autocomplete = null;
        if (changeCurrentCity.settings) {

            // console.log(changeCurrentCity.$modal, changeCurrentCity.settings);
           (defaults.$initButton).off('click').on('click', function(e) {
               
            $('#change-city-popover').remove();

            var $popover = $(changeCurrentCity.popoverTpl);
            var position = changeCurrentCity.settings.$initButton.position();
            var parentPosition = changeCurrentCity.settings.$initButton.parents('.main__body').position();
            $popover.css({
                position: 'absolute',
                top: parentPosition.top + position.top -31,
                left: parentPosition.left + position.left + 43
            });

            // events

            var input = document.getElementById('current-city');
            var options = {
                types: ['(cities)']
                };
            //  to fix
            autocomplete = new google.maps.places.Autocomplete(input, options);
            console.log(autocomplete)

            $popover.find('[data-function="localize-me"]').off('click').on('click', changeCurrentCity.localizeMe);
            $popover.find('[data-function="popover-cancel"]').off('click').on('click', changeCurrentCity.onCityCancel);
            $popover.find('[data-function="popover-save"]').off('click').on('click', changeCurrentCity.onCityChange);

            $('body').append($popover);
           })
        }

    };

    changeCurrentCity.localizeMe = function () {

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
    
                var url = "http://api.openweathermap.org/data/2.5/weather?lat=" +
                    position.coords.latitude + "&lon=" +
                    position.coords.longitude + "&APPID=" +
                   changeCurrentCity.settings.APPID + '&units=metric';
                $.getJSON(url, function (response) {
    
                    $('[data-function="current-city"]').val(response.name)
                });
            })
        }
    };

    changeCurrentCity.onCityChange = function () {

        var city = $('#change-city-popover').find('[data-function="current-city"]').val();
        document.cookie = 'city=' + city;


        // custom  function
        if (changeCurrentCity.settings._onSaveChanges) {
            console.log(changeCurrentCity.settings._onSaveChanges)
            changeCurrentCity.settings._onSaveChanges(city);

            $('#change-city-popover').remove();

        }

    };

    changeCurrentCity.onCityCancel = function () {
        $('#change-city-popover').remove();
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
                '<div class="arrow" style="top: 34px;"></div>'+
                '<h3 class="popover-header">Change city</h3>'+
                '<div class="popover-body">'+
                    '<div class="row">'+
                        '<div class="input-section">'+
                        '<div class="input-section__label"> City </div>'+
                        '<div class="input-group mb-3 input-section__input">'+
                            '<input type="text" class="form-control" id="current-city" data-function="current-city" aria-describedby="basic-addon2">'+
                                '<div class="input-group-append">'+
                                '<button class="btn btn-outline-primary" data-function="localize-me" type="button"><i class="fas fa-globe"></i></button>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                    '<div class="row popover-body__footer">'+
                        '<button class="btn btn-cancel" data-function="popover-cancel">Cancel</button>'+
                        '<button class="btn btn-primary" data-function="popover-save">Save</button>'+
                    '</div>'+
                '</div>'+
            '</div>';

    var defaults = {
        curretCity: "",
        APPID: "",
        $initButton: $(this),
        _onSaveChanges: null,
    };


    changeCurrentCity.settings = $.extend(defaults, options);
    changeCurrentCity.init();

    });
};


export default changeCurrentCity;