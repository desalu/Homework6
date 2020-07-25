$(document).ready(function() {
  $("#search-button").on("click", function() {
    var searchValue = $("#search-value").val();
    

    // clear input box
    $("#search-value").val("");
    
    searchWeather(searchValue);
  });

  $(".history").on("click", "li", function() {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  function searchWeather(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=b5072d22f047ab13efd9ee98bee50c73",
      dataType: "json",
      success: function(data) {
        
        
        // create history link for this search
        if (history.indexOf(searchValue) === -1) {
          history.push(searchValue);
          window.localStorage.setItem("history", JSON.stringify(history));
    
          makeRow(searchValue);
        }
        
        // clear any old content
        $("#today").empty();

        // create html content for current weather
        var cardBody  = $("<div>").addClass("card-body");
        var city = $("<p>").addClass("display-4 m-1").text(data.name);
        var temp = $("<p>").addClass("display-5 m-1").html("Temperature: " + ((data.main.temp - 273.15) * 1.80 + 32).toFixed(1)+ "&#176F");
        var humidity = $("<p>").addClass("display-5 m-1").text("Humidity: " + data.main.humidity + "%");
        var wind = $("<p>").addClass("display-5 m-1").text("Wind Speed: " + data.wind.speed + " MPH");
        

        // merge and add to page
        $("#today").append(cardBody);
        $(cardBody).append(city, temp, humidity, wind);
        // call follow-up api endpoints
        getForecast(searchValue);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }
  
  function getForecast(searchValue) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=b5072d22f047ab13efd9ee98bee50c73",
      dataType: "json",
      success: function(data) {
        // overwrite any existing content with title and empty row
          $("#forecast").empty();

          

          //console.log(month, day, year);

          

        // loop over all forecasts (by 3-hour increments)
        
        for (var i = 0; i < data.list.length; i++) {
          var year = data.list[i].dt_txt.substr(0,4);
          var month = data.list[i].dt_txt.substr(5,2);
          var day = data.list[i].dt_txt.substr(8,2);
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {

            // create html elements for a bootstrap card
            var column = $("<div>").addClass("col m-1 p-0");
            var card = $("<div>").addClass("card");
            var cardBody  = $("<div>").addClass("card-body bg-primary text-light");
            var date = $("<div>").addClass("card-title").text(month + "/" + day + "/" + year);
            var icon = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + data.list[i].weather[0].icon +"@2x.png");
            var temp = $("<div>").addClass("").html("Temperature: " + ((data.list[i].main.temp - 273.15) * 1.80 + 32).toFixed(1)+ "&#176F");
            var humidity = $("<div>").addClass("").text("Humidity: " + data.list[i].main.humidity+ "%");
            

            // merge together and put on page
            $(column).append(card);
            $(card).append(cardBody);
            $(cardBody).append(date);
            $(cardBody).append(icon);
            $(cardBody).append(temp);
            $(cardBody).append(humidity);
            $("#forecast").append(column);
          }
        }
      }
    });
  }

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: "https://api.openweathermap.org/data/2.5/uvi?&appid=b5072d22f047ab13efd9ee98bee50c73&lat=" + lat + "&lon=" + lon,
      dataType: "json",
      success: function(data) {
        console.log(data.value);
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);
        
        // change color depending on uv value
        if (data.value < 2) {
          btn.addClass("btn-success")
        }
        else if (data.value < 5) {
          $(btn).css("background-color", "yellow");
        }
        else if (data.value < 7) {
          btn.addClass("btn-warning")
        }
        else{
          btn.addClass("btn-danger")
        }
        
        $("#today .card-body").append(uv.append(btn).addClass("m-1 display-5"));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length-1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
