import $ from 'jquery';
import settingsVC from './modals/settingsVC';
import moment from 'moment';
import 'bootstrap';

var appComponent = {};
appComponent.objectData = {};
appComponent.$main = $('.body__wrapper');
appComponent.APPID = '3edd02e6040799429c7f443bd7b0f39a'

appComponent.defaultSettings = {
    unit: 'Celcius',
    city: 'London',
    background: '../Javascript_local_weather/src/img/background.jpg'
}

appComponent.init = function () {
    if (document.cookie.match(/^(.*;)?\s*unit\s*=\s*[^;]+(.*)?$/)) {
        appComponent.defaultSettings.unit: document.cookie.replace(/(?:(?:^|.*;\s*)unit\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    }
    if (document.cookie.match(/^(.*;)?\s*city\s*=\s*[^;]+(.*)?$/)) {
        appComponent.defaultSettings.city: document.cookie.replace(/(?:(?:^|.*;\s*)city\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    }
    if (document.cookie.match(/^(.*;)?\s*background\s*=\s*[^;]+(.*)?$/)) {
        appComponent.defaultSettings.background: document.cookie.replace(/(?:(?:^|.*;\s*)background\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    }


    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {

            var url = "http://api.openweathermap.org/data/2.5/weather?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&APPID=" + appComponent.APPID + '&units=metric';
            $.getJSON(url, function (response) {

                // if error

                if (response.cod !== 200) {
                    alert('')
                    return;
                }
                //if success
                appComponent.objectData = response;
                appComponent.defaultSettings.city = appComponent.objectData.name;

                appComponent.get5DaysForecast(position).then(() => {

                    appComponent.getUviData(position).then(() => {
                        appComponent.appendData()
                    })

                })

            });
        })
    }

    $('[data-function="button-settings"]').off('click').on('click', appComponent.onSettingClick);

    $('.day-tile-group--left').off('click').on('click', function () {

        $('.day-tile-group--list').find('.day-tile').last().css('display', 'none');
        $('.day-tile-group--list').find('.day-tile').first().css('display', 'flex');

    })

    $('.day-tile-group--right').off('click').on('click', function () {
        $('.day-tile-group--list').find('.day-tile').first().css('display', 'none');
        $('.day-tile-group--list').find('.day-tile').last().css('display', 'flex');

    })
}

appComponent.appendData = function () {


    // header info
    appComponent.$main.find('.weather-info__city').text(appComponent.defaultSettings.city);
    appComponent.$main.find('.weather-info__date').text(moment().format('MMMM Do'));

    // this day data
    if (appComponent.defaultSettings.unit === "Celcius") {
        $('.today-data__left--degree').text(Math.round(appComponent.objectData.main.temp) + '°C');
    } else if (appComponent.defaultSettings.unit === "Kelvin") {
        $('.today-data__left--degree').text(Math.round(appComponent.objectData.main.temp * 274.15) + '°K');
    } else {
        $('.today-data__left--degree').text(Math.round(appComponent.objectData.main.temp * 33.8) + '°F');

    }

    var $details = appComponent.$main.find('.today-data__body');

    $details.find('.today-data-details--humidity').text(appComponent.objectData.main.humidity + '%');
    appComponent.$main.find('.today-data__header').find('.today-data-details--rain').html('<i class="fas fa-info-circle"></i>' + appComponent.objectData.weather[0].main)
    $details.find('.today-data-details--rain').text(appComponent.objectData.weather[0].description)



    if (appComponent.objectData.wind) {
        $details.find('.today-data-details--wind').text(appComponent.objectData.wind.speed + 'km/h');
    }

    if (appComponent.objectData.uvi) {
        $details.find('.today-data-details--uv-index').text(appComponent.objectData.uvi.value)
    }

    // next 5 days
    if (appComponent.objectData.forecast) {

        var simpleData = $.grep(appComponent.objectData.forecast, function (weatherData, index) {

            return moment(weatherData.dt_txt).format('HH:mm:ss') == "05:00:00"
        })

        if (simpleData !== []) {
            $('.day-tile-group--list').html('');

            $.each(simpleData, function (index, weatherData) {
                var $dayTpl = appComponent.makeDayTile(weatherData);

                $('.day-tile-group--list').append($dayTpl);

            });
        }

        $('.day-tile').last().css('display', 'none');

    }

};

appComponent.onSettingClick = function () {
    settingsVC.initView(appComponent);
}

appComponent.get5DaysForecast = function (position) {

    return new Promise((resolve, reject) => {

        appComponent.objectData.forecast = {};

        var url = "http://api.openweathermap.org/data/2.5/forecast?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&APPID=" + appComponent.APPID + '&units=metric';
        $.getJSON(url, function (response) {
            //if success
            appComponent.objectData.forecast = response.list;

            resolve(appComponent.objectData)

        });
    })

}

appComponent.getUviData = function (position) {
    return new Promise((resolve, reject) => {

        appComponent.objectData.uvi = {};

        var url = "http://api.openweathermap.org/data/2.5/uvi?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&APPID=" + appComponent.APPID + '&units=metric';
        $.getJSON(url, function (response) {
            //if success
            appComponent.objectData.uvi = response;

            resolve(appComponent.objectData)


        });
    })

}

appComponent.makeDayTile = function (weatherData) {
    var $dayTpl = $(appComponent.dayTileTpl);

    $dayTpl.find('.day-tile__header').text(moment(weatherData.dt_txt).format('MMMM Do'));

    if (appComponent.defaultSettings.unit === "Celcius") {
        $dayTpl.find('.day-tile__body--degree').text(Math.round(weatherData.main.temp) + '°C');

    } else if (appComponent.defaultSettings.unit === "Kelvin") {
        $dayTpl.find('.day-tile__body--degree').text(Math.round(weatherData.main.temp * 274.15) + '°K');

    } else {
        $dayTpl.find('.day-tile__body--degree').text(Math.round(weatherData.main.temp * 33.8) + '°F');


    }
    $dayTpl.find('.day-tile__body--icon').html('<img class="weather-widget__img" src="https://openweathermap.org/img/wn/' + appComponent.objectData.weather[0].icon + '.png" width="50" height="50">');


    return $dayTpl
}

appComponent.dayTileTpl =
    '<div class="day-tile">' +
    '<div class="day-tile--wrapper">' +
    '  <div class="day-tile__header"></div>' +
    '  <div class="day-tile__body">' +
    '    <div class="day-tile__body--degree"></div>' +
    '    <div class="day-tile__body--icon"></div>' +
    '  </div>' +
    '  <div class="day-tile__footer"></div>' +
    '</div>' +
    '</div>'

appComponent.init();

export default appComponent;