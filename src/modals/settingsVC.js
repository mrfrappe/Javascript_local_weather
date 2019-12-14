import $ from 'jquery';

var settingsVC = {}
settingsVC.photosCollection = [];
settingsVC.appComponent = '';
settingsVC.newSettings = {}
settingsVC.googleAPI = 'AIzaSyD9GWnu5651bNqfAsdrcc58bmSOGdu4RsQ';

settingsVC.initView = function (appComponent) {
    settingsVC.appComponent = appComponent

    settingsVC.newSettings.unit = settingsVC.appComponent.defaultSettings.unit;
    settingsVC.newSettings.city = settingsVC.appComponent.defaultSettings.city;
    settingsVC.newSettings.background = settingsVC.appComponent.defaultSettings.background;


    settingsVC.getTpl().then(() => {
        settingsVC.appendData();

        settingsVC.getPhotos();

        // set events

        $('#modal-settings').find('.dropdown-item').off('click').on('click', settingsVC.changeUnit);

        $('#modal-settings').find('[data-function="current-city"]').off('click').on('click', function (e) {
            e.target.value = '';
        });

        $('#modal-settings').find('[data-function="current-city"]').off('input').on('input', function (e) {

    
            $.get('https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + e.target.value +
            '&types=(cities)&language=pt_BR&key=AIzaSyD9GWnu5651bNqfAsdrcc58bmSOGdu4RsQ', function(response){
                console.log(response)

            });

        });

        $('#modal-settings').find('[data-function="set-background"]').off('click').on('click', settingsVC.changeBackground);

        $('#modal-settings').find('[data-function="save-settings"').off('click').on('click', settingsVC.onSaveClick);

        $('#modal-settings').on('hidden.bs.modal', function () {
            $('html').css({
                'background-image': 'url(' + settingsVC.appComponent.defaultSettings.background + ')',
            });
        })

        $('#modal-settings').modal('show');
    });

};

settingsVC.getTpl = function () {
    return new Promise((resolve, reject) => {

        $.get('./src/templetes/settings.html', function (response) {
            $('body').append(response);
            resolve(response)
        })
    })
}

settingsVC.getPhotos = function (e) {

    $.getJSON('https://api.unsplash.com/search/photos?query=weather?w=400&h=400&fit=crop&client_id=0be411bbc18eab35251b44718f0590582b0f401b2a3bc6326bf46f16c67dd9b5&orientation=landscape', function (response) {
        //   if error 
        if (response === undefined || response.results.length === 0) {
            return;
        }
        // if success


        settingsVC.photosCollection = response.results


        $.each(settingsVC.photosCollection, function (index, photo) {
            var $carouselItem = $('<div class="carousel-item">' +
                '<img src="' + photo.urls.thumb + '" class="d-block w-100" alt="..." data-photo-id="' + photo.id + '">' +
                '</div>');

            $('.carousel-inner').append($carouselItem);
        });

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

    $('#modal-settings').find('[data-function="current-city"]').val(settingsVC.appComponent.defaultSettings.city)
};

settingsVC.changeUnit = function (e) {

    $('.dropdown-item').removeClass('active');
    $(this).addClass('active');

    settingsVC.newSettings.unit = $(this).text();

    $('#modal-settings').find('.dropdown-toggle').text(settingsVC.newSettings.unit);
};

settingsVC.changeCity = function (e) {

    settingsVC.newSettings.city = $(this).value();

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

    settingsVC.appComponent.appendData();


    document.cookie = 'unit=' + settingsVC.newSettings.unit 
    document.cookie = 'city=' + settingsVC.newSettings.city
    document.cookie = 'background=' + settingsVC.newSettings.background

    
    $('#modal-settings').modal('hide');

};

export default settingsVC;