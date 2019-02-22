const app = {};
app.apiKeyWeather = "8f6dab90acf14f9da11221736191902";
app.apiUrlWeather = "http://api.apixu.com/v1/current.json";
app.apiKeyEtsy = "rkcrycwnyei9ana141cxdioh";
app.apiUrlEtsy = "https://openapi.etsy.com/v2/shops/polomocha/listings/active";
app.userInput = ""; //empty var for user to enter city

//obtaining data from weather API
app.getWeather = location => {
  $.ajax({
    url: app.apiUrlWeather,
    method: "GET",
    dataType: "json",
    data: {
      key: app.apiKeyWeather,
      q: location
    }
  }).then(function(response) {
    //once data is received, display weather to DOM
    app.displayWeather(response);
    // get temperature from response
    let temperature = response.current.temp_c;
    //call app.getEtsyParams and pass it the temperature from weather API
    app.getEtsyParams(temperature);
  });
}; //app.getWeather ends here

let weatherArray = []; 
app.displayWeather = function(data) {
  weatherArray.pop(); //remove content from weatherArray on each call to API (on additional submit)
  weatherArray.push(data);
  app.currentConditions = weatherArray.map(function(current) {
    return `
            <div class="weatherDetails" >
                <h2 class="weatherSentence">In ${
                  current.location.name
                }, the weather is ${current.current.condition.text} with current temperature of ${current.current.temp_c}, but it feels like ${current.current.feelslike_c} degrees celcius</h2>
            </div>`;
  }); 

  $(".displayWeather").html("");
  $(".displayWeather").html(app.currentConditions);
}; //app.displayWeather ends here

//error handling, if user does not input city
app.emptyInput = function() {
  if ($('#city').val() === '') {
    Swal.fire({
      title: 'Error!',
      text: 'Enter city',
      type: 'error',
      confirmButtonText: 'OK'
    });
  };
}; //app.emptyInput ends here

app.handleEmptyInput = function () {
  $("#submitButton").on("click", function () {
    app.emptyInput();
  });
}; //event handler for on submit, specific to on submit  *** i think we need to rejig init and move the call app.callEtsyApiTwice outside of init, to make it global and then call it in init. is this proper name spaceing? question for helpcue *** 

// generate button is hidden on page load, show button on submit
app.generateButton = function () {
  $("#submitButton").on("click", function () {
    $('#generate').show();
  })
}

//app.getValue gets the value of the users input, sends it to app.getWeather
app.getValue = function () {
  app.location = $("#city").val();
  app.getWeather(app.location);
}


//once receive temperature, it will compare it with 0
//if above 0'C, return Etsy A (Tshirt,Short Pants)
//if below 0'C, return Etsy B (jacket,  Pants)
app.getEtsyParams = temperature => {
  let EtsyA = ["tshirt", "shorts"];
  let EtsyB = ["sweater", "denim pants"];
  if (temperature > 0) {
    app.callEtsyApiTwice(EtsyA);
  } else {
    app.callEtsyApiTwice(EtsyB);
  }
};

//receive paramater (temperature) from app.getEtsyParams to call the etsy API twice
app.callEtsyApiTwice = param => {
  let etsyQuery = param.map(query => {
    console.log("query: ", query);
    return app.getEtsy(query);
  });
  $.when(...etsyQuery).then((...args) => {
    let argItem = args.map((item, index) => {
      console.log(item);
      const i = Math.floor(Math.random() * item[0].results.length);
      return item[0].results[i].MainImage.url_75x75;
    });
    console.log(argItem);
    app.displayEtsy(argItem); //
  });
}; //callEtsyApiTwice ends here



app.displayEtsy = item => {
  let itemDisplay = item.map(item => {
    console.log(item);
    return `<img src="${item}">`;
  });

  $(".displayTop").html("");
  $(".displayTop").append(itemDisplay);
};



app.getEtsy = item => {
  //proxy
  return $.ajax({
    url: "https://proxy.hackeryou.com",
    method: "GET",
    dataType: "json",
    data: {
      reqUrl: app.apiUrlEtsy,
      params: {
        api_key: app.apiKeyEtsy,
        keywords: item,
        includes: "MainImage"
      }
    }
  });
};

let etsyArray = [];
app.displayEtsy = data => {
  etsyArray.pop();
  etsyArray.push(data);
  app.etsyImage = etsyArray.map(function(item) {
    // let top = item[0].MainImage.url_fullxfull;
    let top = item[0].MainImage.url_75x75;
    let bottom = item[2].MainImage.url_75x75;

    $(".displayTop").html("");
    $(".displayTop").append(`<img src="${top}" />`);
    $(".displayTop").append(`<img src="${bottom}" />`);
  });
};

$("#generate").on("click", function() {
  //call api twice with top/bottom then return to DOM.
});

app.init = () => {
  app.getWeather(); //calling 
  // app.handleEmptyInput();
  $("#submitButton").on("click", function () { //proper name spacing?
    app.handleEmptyInput(); //calling
    app.getValue();
    //displayWeather will show the API data according to userInput to DOM *** ask about namespacing
    $(".displayWeather").val("");
  });

  app.generateButton();
};

$(function() {
  app.init();
}); // doc ready ends here
