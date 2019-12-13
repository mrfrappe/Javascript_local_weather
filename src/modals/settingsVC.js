import $ from 'jquery';

var settingsVC = {}
settingsVC.photosCollection = [];
settingsVC.appComponent = '';
settingsVC.newSettings = {}

settingsVC.initView = function (appComponent) {
    settingsVC.appComponent = appComponent

    settingsVC.newSettings.unit = settingsVC.appComponent.defaultSettings.unit;
    settingsVC.newSettings.city = settingsVC.appComponent.defaultSettings.city;
    settingsVC.newSettings.background = settingsVC.appComponent.defaultSettings.background;

    //work on webserver
    // $('body').load('./templates/settingModal.html');

    var $modal = $(settingsVC.modalTpl);
    $('body').append($modal);

    settingsVC.appendData();

    settingsVC.getPhotos();

    // set events

    $('#modal-settings').find('.dropdown-item').off('click').on('click', settingsVC.changeUnit);

    $('#modal-settings').find('[data-function="current-city"]').off('input').on('input', function (e) {

        console.log(e.target.value)

    });

    $('#modal-settings').find('[data-function="set-background"]').off('click').on('click', settingsVC.changeBackground);

    $('#modal-settings').find('[data-function="save-settings"').off('click').on('click', settingsVC.onSaveClick);

    $('#modal-settings').on('hidden.bs.modal', function () {
        $('html').css({
            'background-image': 'url(' + settingsVC.appComponent.defaultSettings.background + ')',
        });
    })

    $('#modal-settings').modal('show');


};

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

    $('#modal-settings').modal('hide');

};


settingsVC.modalTpl =
    '<div class="modal fade modal-settings" id="modal-settings" tabindex="-1" role="dialog" aria-hidden="true">' +
    '<div class="modal-dialog modal-dialog-centered" role="document">' +
    '<div class="modal-content">' +
    '<div class="modal-header">' +
    '<h5 class="modal-title">Settings</h5>' +
    '<button type="button" class="close" data-dismiss="modal" aria-label="Close">' +
    '<span aria-hidden="true">&times;</span>' +
    '</button>' +
    '</div>' +
    '<div class="modal-body">' +
    '' +
    '<div class="row">' +
    '<div class="col-2"></div>' +
    '<div class="col-8">' +
    '<div class="input-section">' +
    '<div class="input-section__label"> Choose units</div>' +
    '<div class="input-section__input">' +
    '<div class="dropdown">' +
    '<button class="btn btn-secondary dropdown-toggle" type="button"' +
    'id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true"' +
    'aria-expanded="false">' +
    'Units' +
    '</button>' +
    '<div class="dropdown-menu" aria-labelledby="dropdownMenuButton">' +
    '<a class="dropdown-item" href="#">Celcius</a>' +
    '<a class="dropdown-item" href="#">Kelvin</a>' +
    '<a class="dropdown-item" href="#">Fahrenheit</a>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="col-2"></div>' +
    '</div>' +
    '<div class="row">' +
    '<div class="col-2"></div>' +
    '<div class="col-8">' +
    '<div class="input-section">' +
    '<div class="input-section__label"> Search city </div>' +
    '<div class="input-section__input">' +
    '<input type="text" data-function="current-city">' +
    '</div>' +
    '</div>' +
    '</div>' +
    '<div class="col-2"></div>' +
    '</div>' +
    '<div class="row">' +
    '<div class="col-2"></div>' +
    '<div class="col-8">' +
    '<div class="carousel-section">' +
    '<div id="carouselExampleControls" class="carousel slide" data-ride="carousel">' +
    '<div class="carousel-inner">' +
    '</div>' +
    '<a class="carousel-control-prev" href="#carouselExampleControls" role="button"' +
    'data-slide="prev">' +
    '<span class="carousel-control-prev-icon" aria-hidden="true"></span>' +
    '<span class="sr-only">Previous</span>' +
    '</a>' +
    '<a class="carousel-control-next" href="#carouselExampleControls" role="button"' +
    'data-slide="next">' +
    '<span class="carousel-control-next-icon" aria-hidden="true"></span>' +
    '<span class="sr-only">Next</span>' +
    '</a>' +
    '</div>' +
    '<button data-function="set-background">Set background</button>' +
    '</div>' +
    '</div>' +
    '<div class="col-2"></div>' +
    '</div>' +
    '</div>' +
    '<div class="modal-footer">' +
    '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>' +
    '<button type="button" class="btn btn-primary" data-function="save-settings">Save</button>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>'

export default settingsVC;