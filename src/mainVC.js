import $ from 'jquery';
import settingsVC from './modals/settingsVC';
import changeCurrentCity from './modals/changeCurrentCity';
import moment from 'moment';
import 'bootstrap';



var appComponent = {};
appComponent.objectData = {};
appComponent.$main = $('.body__wrapper');

var keysValue = JSON.parse($('#data').val());

appComponent.keys = {
    apiOpenWeatherKey: keysValue.apiOpenWeatherKey,
    apiUnsplashKey: keysValue.apiUnsplashKey,
    apiGooglePlacesKey: keysValue.apiGooglePlacesKey,
};

appComponent.firstGeolocationRun = true;

var position = {
    coords: {
        latitude: '',
        longitude: ''
    }
};

appComponent.defaultSettings = {
    unit: 'Celcius',
    city: 'London',
    background: './img/background.jpg',
    customFields: []
};



appComponent.init = function () {

    appComponent.getCookieData();


    if (appComponent.firstGeolocationRun === true && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {


            var url = "http://api.openweathermap.org/data/2.5/weather?lat=" +
                position.coords.latitude + "&lon=" +
                position.coords.longitude + "&APPID=" +
                appComponent.keys.apiOpenWeatherKey + '&units=metric';
            $.getJSON(url, (response) => {

                //if success
                appComponent.objectData = response;
                appComponent.defaultSettings.city = appComponent.objectData.name;

                appComponent.get5DaysForecast(position).then(() => {
                    appComponent.getUviData(position).then(() => {
                        appComponent.appendData()
                    })

                })

            });
        }, (err) => {
            alert('[ERROR] Choose city')
            settingsVC.initView(appComponent);
        })
    } else {


        var url = "http://api.openweathermap.org/data/2.5/weather?q=" + appComponent.defaultSettings.city +
            "&APPID=" + appComponent.keys.apiOpenWeatherKey + '&units=metric';
        $.getJSON(url, (response) => {}).done((response) => {

            position.coords.longitude = response.coord.lon
            position.coords.latitude = response.coord.lat

            //if success
            appComponent.objectData = response;
            appComponent.defaultSettings.city = appComponent.objectData.name;

            appComponent.get5DaysForecast(position).then(() => {
                appComponent.getUviData(position).then(() => {
                    appComponent.appendData()
                })

            })
        }).fail((response) => {
            // if (confirm('[ERROR] Wrong city')) {
            settingsVC.initView(appComponent);

            // }
        });
    }

    appComponent.setEvents();

};

appComponent.setEvents = () => {
    $('[data-function="button-settings"]').off('click').on('click', appComponent.onSettingClick);

    $('.day-tile-group--left').off('click').on('click', () => {

        $('.day-tile-group--list').find('.day-tile').last().css('display', 'none');
        $('.day-tile-group--list').find('.day-tile').first().css('display', 'flex');

    })

    $('.day-tile-group--right').off('click').on('click', () => {
        $('.day-tile-group--list').find('.day-tile').first().css('display', 'none');
        $('.day-tile-group--list').find('.day-tile').last().css('display', 'flex');

    })
};

appComponent.getCookieData = () => {

    if (document.cookie.match(/^(.*;)?\s*weatherAppCookie\s*=\s*[^;]+(.*)?$/)) {
        var cookieJSON = JSON.parse(document.cookie.replace(/(?:(?:^|.*;\s*)weatherAppCookie\s*\=\s*([^;]*).*$)|^.*$/, "$1"));

        $.each(appComponent.defaultSettings, (key, setting) => {
            appComponent.defaultSettings[key] = cookieJSON[key];
            if (key === 'city') {
                appComponent.firstGeolocationRun = false;
            }
            if (key === 'background') {
                $('html').css({
                    'background-image': 'url(' + appComponent.defaultSettings.background + ')',
                });
            }
        });
    }
};

appComponent.appendData = () => {


    // header info
    appComponent.$main.find('.weather-info__city').html(appComponent.defaultSettings.city + '<i data-function="change-city-popover" class="popover-settings fas fa-exchange-alt"></i>');
    appComponent.$main.find('.weather-info__date').text(moment().format('MMMM Do'));

    $('[data-function="change-city-popover"]').click((e) => {
        $(this).changeCurrentCity({})
    })
    $('[data-function="change-city-popover"]').changeCurrentCity({
        currentCity: appComponent.defaultSettings,
        apiOpenWeatherKey: appComponent.keys.apiOpenWeatherKey,
        _onSaveChanges: appComponent.onPopoverChangeCity
    })

    // this day data
    appComponent.setTemperature($('.today-data__left--degree'), appComponent.objectData.main.temp, appComponent.defaultSettings.unit);

    if ($.inArray("settings-feels-temp", appComponent.defaultSettings.customFields) !== -1 && appComponent.objectData.main.feels_like) {


        appComponent.setTemperature($('.today-data__left--feels-like'), appComponent.objectData.main.feels_like, appComponent.defaultSettings.unit, "Feels like");


    } else {
        $('.today-data__left--feels-like').text('');
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

    var $bottomDetailsHeader = appComponent.$main.find('.tbody__right--bottom').find('.today-data__header');
    $bottomDetailsHeader.css('display', 'none');

    var $bottomDetailsSection = appComponent.$main.find('.tbody__right--bottom').find('.today-data__body');

    if ($.inArray("settings-preassure", appComponent.defaultSettings.customFields) !== -1 && appComponent.objectData.main.pressure) {
        $bottomDetailsSection.find('.today-data-details--pressure').text(appComponent.objectData.main.pressure + ' hPa');

        $bottomDetailsHeader.css('display', 'flex');
    } else {
        $bottomDetailsSection.find('.today-data-details--pressure').text('');

    }

    if ($.inArray("settings-wind-deg", appComponent.defaultSettings.customFields) !== -1 && appComponent.objectData.wind.deg) {
        $bottomDetailsSection.find('.today-data-details--wind-degree').text(appComponent.objectData.wind.deg + '°');

        $bottomDetailsHeader.css('display', 'flex');

    } else {
        $bottomDetailsSection.find('.today-data-details--wind-degree').text('');
    }

    if ($.inArray("settings-sun", appComponent.defaultSettings.customFields) !== -1 && appComponent.objectData.sys.sunrise && appComponent.objectData.sys.sunset) {
        $bottomDetailsSection.find('.today-data-details--sunrise').text(moment(appComponent.objectData.sys.sunrise, 'X').format("HH:mm"));
        $bottomDetailsSection.find('.today-data-details--sunset').text(moment(appComponent.objectData.sys.sunset, 'X').format("HH:mm"));

        $bottomDetailsHeader.css('display', 'flex');

    } else {

        $bottomDetailsSection.find('.today-data-details--sunrise').text('');
        $bottomDetailsSection.find('.today-data-details--sunset').text('');

    }

    // next 5 days
    if (appComponent.objectData.forecast) {

        var simpleData = $.grep(appComponent.objectData.forecast, (weatherData, index) => {

            return moment(weatherData.dt_txt).format('HH:mm:ss') == "05:00:00" || moment(weatherData.dt_txt).format('HH:mm:ss') == "06:00:00"
        })

        if (simpleData !== []) {
            $('.day-tile-group--list').html('');

            $.each(simpleData, (index, weatherData) => {
                var $dayTpl = appComponent.makeDayTile(weatherData);

                $('.day-tile-group--list').append($dayTpl);

            });
        }

        $('.day-tile').last().css('display', 'none');

    }

};

appComponent.setTemperature = ($target, value, unit, text) => {
    var text = (text === undefined) ? '' : text + ' ';

    if (unit === "Celcius") {
        $target.text(text + Math.round(value) + '°C');

    } else {
        $target.text(text + Math.round(value * 33.8) + '°F');
        (value === 0) ? $target.text(text + 32 + '°F'): $target.text(text + Math.round(value * 33.8) + '°F');
    }
};

appComponent.onSettingClick = () => {
    settingsVC.initView(appComponent);
};

appComponent.onPopoverChangeCity = (city) => {

    appComponent.firstGeolocationRun = false;

    appComponent.init();

};

appComponent.get5DaysForecast = (position) => {

    return new Promise((resolve, reject) => {

        appComponent.objectData.forecast = {};

        var url = "http://api.openweathermap.org/data/2.5/forecast?lat=" +
            position.coords.latitude + "&lon=" +
            position.coords.longitude + "&APPID=" +
            appComponent.keys.apiOpenWeatherKey + '&units=metric';
        $.getJSON(url, (response) => {

            //if error 
            if ('200' !== response.cod) {
                reject(console.log('error001'))
            }
            appComponent.objectData.forecast = response.list;

            resolve(response)

        });
    })

};

appComponent.getUviData = (position) => {
    return new Promise((resolve, reject) => {

        appComponent.objectData.uvi = {};

        var url = "http://api.openweathermap.org/data/2.5/uvi?lat=" +
            position.coords.latitude + "&lon=" +
            position.coords.longitude + "&APPID=" +
            appComponent.keys.apiOpenWeatherKey + '&units=metric';
        $.getJSON(url, (response) => {

            //if success
            appComponent.objectData.uvi = response;

            resolve(response)


        });
    })

};

appComponent.makeDayTile = (weatherData) => {
    var $dayTpl = $(appComponent.dayTileTpl);

    $dayTpl.find('.day-tile__header').text(moment(weatherData.dt_txt).format('MMMM Do'));

    appComponent.setTemperature($dayTpl.find('.day-tile__body--degree'), weatherData.main.temp, appComponent.defaultSettings.unit);

    $dayTpl.find('.day-tile__body--icon').html('<img class="weather-widget__img" src="https://openweathermap.org/img/wn/' + appComponent.objectData.weather[0].icon + '.png" width="50" height="50">');

    if ($.inArray("settings-feels-temp", appComponent.defaultSettings.customFields) !== -1 && weatherData.main.feels_like) {

        appComponent.setTemperature($dayTpl.find('.day-tile__footer'), weatherData.main.feels_like, appComponent.defaultSettings.unit, 'Feels like');

    }

    return $dayTpl
};

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


export default appComponent;