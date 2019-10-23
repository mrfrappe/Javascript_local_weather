import $ from 'jquery';  
import settingsVC from './modals/settingsVC';

var appComponent = {};
appComponent.objectData = {};

appComponent.init = function () {

    $.getJSON('https://api.unsplash.com/search/photos?query=weather&client_id=0be411bbc18eab35251b44718f0590582b0f401b2a3bc6326bf46f16c67dd9b5', function (response) {
        //   if error 
        if (response === undefined || response.results.length === 0) {
            return;
        }
        // if success
        var backgrounImage = response.results[Math.floor((Math.random() * response.results.length) + 0)].urls.regular;

        $('html').css({
            'background-image': 'url(' + backgrounImage + ')',
        });
    })


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var url = "http://api.openweathermap.org/data/2.5/weather?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&APPID=3edd02e6040799429c7f443bd7b0f39a";
            $.getJSON(url, function (response) {

                // if error

                if (response.cod !== 200) {
                    alert('')
                    return;
                }
                //if success
                appComponent.objectData = response

                $('.weather__info--city').text(appComponent.objectData.name);
            });
        })
    }

    $('.button-settings').off('click').on('click', appComponent.onSettingClick);
}

appComponent.onSettingClick = function () {
    settingsVC.initView();
}

appComponent.init();