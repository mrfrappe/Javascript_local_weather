import $ from 'jquery';

var settingsVC = {}
settingsVC.photosCollection = [];
settingsVC.appComponent = '';
settingsVC.newSettings = {};
var autocomplete = null;

settingsVC.initView = function (appComponent) {
    settingsVC.appComponent = appComponent

    settingsVC.newSettings.unit = settingsVC.appComponent.defaultSettings.unit;
    settingsVC.newSettings.city = settingsVC.appComponent.defaultSettings.city;
    settingsVC.newSettings.background = settingsVC.appComponent.defaultSettings.background;
    settingsVC.newSettings.customFields = settingsVC.appComponent.defaultSettings.customFields;


    settingsVC.getTpl().then(() => {
        settingsVC.appendData();

        settingsVC.getPhotos();



        // set events

        $('#modal-settings').find('.dropdown-item').off('click').on('click', settingsVC.changeUnit);

        $('#modal-settings').find('[data-function="current-city"]').off('click').on('click', function (e) {
            e.target.value = '';
        });

        $('.pac-container').remove();
        var input = document.getElementById('current-city');
        var options = {
            types: ['(cities)']
            };
        autocomplete = new google.maps.places.Autocomplete(input, options);


        $('#modal-settings').find('.form-check-input').off('click').on('click', function(e){
            if ($(this).is(':checked')) {
                settingsVC.newSettings.customFields.push($(this).attr('id'))
            } else {
                settingsVC.newSettings.customFields.splice( settingsVC.newSettings.customFields.indexOf($(this).attr('id')), 1 );
            }
        })

        $('#modal-settings').find('[data-function="set-background"]').off('click').on('click', settingsVC.changeBackground);

        $('#modal-settings').find('[data-function="save-settings"').off('click').on('click', settingsVC.onSaveClick);

        $('#modal-settings').on('hidden.bs.modal', function () {
            $('html').css({
                'background-image': 'url(' + settingsVC.appComponent.defaultSettings.background + ')',
            });
        })
        $('[data-function="default-settings"]').off('click').on('click',settingsVC.setDefaultData);

        $('[data-function="localize-me"]').off('click').on('click', settingsVC.localizeMe);

        $('#modal-settings').modal('show');
    });

};
settingsVC.localizeMe = function () {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {

            var url = "http://api.openweathermap.org/data/2.5/weather?lat=" +
                position.coords.latitude + "&lon=" +
                position.coords.longitude + "&APPID=" +
                settingsVC.appComponent.keys.apiOpenWeatherKey + '&units=metric';
            $.getJSON(url, function (response) {

                $('[data-function="current-city"]').val(response.name)
            });
        })
    }
};

settingsVC.setDefaultData = function () {
    settingsVC.newSettings = {
        unit: 'Celcius',
        city: 'London',
        background: './img/background.jpg',
        customFields: []
    }
    
    $('#modal-settings').find('.dropdown-toggle').text(settingsVC.newSettings.unit);

    $.each($('#modal-settings').find('.dropdown-item'), function (index, droppdownItem) {
        if ($(droppdownItem).text() === settingsVC.newSettings.unit) {
            $(droppdownItem).addClass('active')
        }
    })

    
    $.each($('#modal-settings').find('.form-check-input'), function(index, check){
        $(check).prop('checked',false)

    });

    $('#modal-settings').find('[data-function="current-city"]').val(settingsVC.newSettings.city);

    $('html').css({
        'background-image': 'url(' + settingsVC.newSettings.background + ')',
    });

};

settingsVC.setEvents = function () {

};

settingsVC.getTpl = function () {
    return new Promise((resolve, reject) => {

        $.get('./templetes/settings.html', function (response) {
            $('body').append(response);
            resolve(response)
        })
    })
}

settingsVC.getPhotos = function (e) {

    $.getJSON('https://api.unsplash.com/search/photos?query=weather?w=400&h=400&fit=crop&client_id=' + settingsVC.appComponent.keys.apiUnsplashKey + '&orientation=landscape', function (response) {
        //   if error 
        if (response === undefined || response.results.length === 0) {
            return;
        }
        // if success


        settingsVC.photosCollection = response.results


        $.each(settingsVC.photosCollection, function (index, photo) {
            var $carouselItem = $('<div class="carousel-item">' +
                '<img src="' + photo.urls.small + '" class="d-block w-100" alt="..." data-photo-id="' + photo.id + '">' +
                '</div>');

            $('.carousel-inner').append($carouselItem);
        });

        $('.carousel-item').removeClass('active');
        $('.carousel-item').first().addClass('active');
    })
};

settingsVC.appendData = function () {


    $('#modal-settings').find('.dropdown-toggle').text(settingsVC.appComponent.defaultSettings.unit);

    $.each($('#modal-settings').find('.dropdown-item'), function (index, droppdownItem) {
        if ($(droppdownItem).text() === settingsVC.appComponent.defaultSettings.unit) {
            $(droppdownItem).addClass('active')
        }
    })

    
    $.each($('#modal-settings').find('.form-check-input'), function(index, check){
        if ($.inArray($(check).attr('id'), settingsVC.appComponent.defaultSettings.customFields) !== -1) {
            $(check).prop('checked',true)
        } else {
            $(check).prop('checked',false)
        }

    });

    $('#modal-settings').find('[data-function="current-city"]').val(settingsVC.appComponent.defaultSettings.city)
};

settingsVC.changeUnit = function (e) {

    $('.dropdown-item').removeClass('active');
    $(this).addClass('active');

    settingsVC.newSettings.unit = $(this).text();

    $('#modal-settings').find('.dropdown-toggle').text(settingsVC.newSettings.unit);
};

settingsVC.changeBackground = function (e) {

    var photoId = $(this).parent().find('.active').find('img').attr('data-photo-id')

    $.each(settingsVC.photosCollection, function (index, photo) {

        if (photo.id === photoId) {

            $('html').css({
                'background-image': 'url(' + photo.urls.full + ')',
            });

            settingsVC.newSettings.background = photo.urls.full;
        }
    });



};


settingsVC.onSaveClick = function (e) {

    settingsVC.appComponent.defaultSettings = settingsVC.newSettings;
    settingsVC.appComponent.defaultSettings.city = $('#modal-settings').find('[data-function="current-city"]').val();
    settingsVC.appComponent.firstGeolocationRun = false;


    document.cookie = 'unit=' + settingsVC.newSettings.unit;
    document.cookie = 'city=' + $('#modal-settings').find('[data-function="current-city"]').val();
    document.cookie = 'background=' + settingsVC.newSettings.background;
    document.cookie = 'customFields=' + settingsVC.newSettings.customFields;

    $('#modal-settings').modal('hide');

    settingsVC.appComponent.init();



};

export default settingsVC;