import $ from 'jquery';  
import settingsVC from './modals/settingsVC';
import moment from 'moment';
import 'bootstrap';

var appComponent = {};
appComponent.objectData = {};
appComponent.$main = $('.body__wrapper');
appComponent.APPID = '3edd02e6040799429c7f443bd7b0f39a'

appComponent.init = function () {

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
                appComponent.objectData = response

                   appComponent.get5DaysForecast(position);

                   appComponent.getUviData(position)


               setTimeout(function() {
                appComponent.appendData()
            },3000)
            });
        })
    }

    $('[data-function="button-settings"]').off('click').on('click', appComponent.onSettingClick);

    $('.day-tile-group--left').off('click').on('click', function() {

        $('.day-tile-group--list').find('.day-tile').last().css('display', 'none');
        $('.day-tile-group--list').find('.day-tile').first().css('display', 'flex');

    })

    $('.day-tile-group--right').off('click').on('click', function() {
        $('.day-tile-group--list').find('.day-tile').first().css('display', 'none');
        $('.day-tile-group--list').find('.day-tile').last().css('display', 'flex');
        
    })
}

appComponent.appendData = function () {

    // header info
    appComponent.$main.find('.weather-info__city').text(appComponent.objectData.name);
    appComponent.$main.find('.weather-info__date').text(moment().format('MMMM Do'));

    // this day data
    $('.today-data__left--degree').text(Math.round(appComponent.objectData.main.temp) + '°C');

    var $details = appComponent.$main.find('.today-data__body');

    $details.find('.today-data-details--humidity').text(appComponent.objectData.main.humidity + '%');
    appComponent.$main.find('.today-data__header').find('.today-data-details--rain').append(appComponent.objectData.weather[0].main)
    $details.find('.today-data-details--rain').text(appComponent.objectData.weather[0].description)



    if (appComponent.objectData.wind) {
        $details.find('.today-data-details--wind').text(appComponent.objectData.wind.speed + 'km/h');
    }

    if (appComponent.objectData.uvi){
        $details.find('.today-data-details--uv-index').text(appComponent.objectData.uvi.value)
    }

    // next 5 days
    if (appComponent.objectData.forecast){

        var simpleData = $.grep(appComponent.objectData.forecast, function(weatherData, index){
            return moment(weatherData.dt_txt).format('HH:mm:ss') == "06:00:00"
        })

        $('.day-tile-group--list').html('');

        $.each(simpleData, function(index, weatherData){
            var $dayTpl =  appComponent.makeDayTile(weatherData);
            
            $('.day-tile-group--list').append($dayTpl);

        });

        $('.day-tile').last().css('display', 'none');

    }

};

appComponent.onSettingClick = function () {
    settingsVC.initView();
}

appComponent.get5DaysForecast = function (position) {
    appComponent.objectData.forecast = {};
    
    var url = "http://api.openweathermap.org/data/2.5/forecast?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&APPID=" + appComponent.APPID + '&units=metric';
    $.getJSON(url, function (response) {
        //if success
        appComponent.objectData.forecast = response.list

    });

}

appComponent.getUviData = function (position) {
    appComponent.objectData.uvi = {};
    
    var url = "http://api.openweathermap.org/data/2.5/uvi?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&APPID=" + appComponent.APPID + '&units=metric';
    $.getJSON(url, function (response) {
        //if success
        appComponent.objectData.uvi = response

    });

}

appComponent.makeDayTile = function (weatherData) {
    var $dayTpl = $(appComponent.dayTileTpl);

    $dayTpl.find('.day-tile__header').text(moment(weatherData.dt_txt).format('MMMM Do'))
    $dayTpl.find('.day-tile__body--degree').text(Math.round(weatherData.main.temp) + '°C');
    $dayTpl.find('.day-tile__body--icon').html('<img class="weather-widget__img" src="https://openweathermap.org/img/wn/'+ appComponent.objectData.weather[0].icon +'.png" width="50" height="50">');


    return $dayTpl
}

appComponent.dayTileTpl = 
'<div class="day-tile">'+
'<div class="day-tile--wrapper">'+
'  <div class="day-tile__header"></div>'+
'  <div class="day-tile__body">'+
'    <div class="day-tile__body--degree"></div>'+
'    <div class="day-tile__body--icon"></div>'+
'  </div>'+
'  <div class="day-tile__footer"></div>'+
'</div>'+
'</div>'

appComponent.init();

export default appComponent;