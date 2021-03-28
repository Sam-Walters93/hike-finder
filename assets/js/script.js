
var parksAPIKey = "cLPFutN3JOEcVqfEXTU1EekbZDczkTNkqEsKFCDX";
var weatherAPIKey = "8192203cac5ae6d369c41fb47e14d962";
var parksData = {};
var singleParkData = {};
var totalPages = 0;
var currentPage = 1;
var picPage = 0;
var picPageMax = 0;
var historyList = {
    text: [],
    id: []
};


// funtion to get parks from (word, state);
var getPark = function(word, state) {
    var apiUrl = "https://developer.nps.gov/api/v1/parks?q=" + word + "&stateCode=" + state + "&api_key=" + parksAPIKey;
    if (!word) {
        var apiUrl = "https://developer.nps.gov/api/v1/parks?stateCode=" + state + "&api_key=" + parksAPIKey;
    }
    if (!state)
    var apiUrl = "https://developer.nps.gov/api/v1/parks?q=" + word + "&api_key=" + parksAPIKey;
    fetch(apiUrl).then(function(response){
        // request was succesful
        if(response.ok) {
            response.json().then(function(data) {

                parksData = data;
                console.log(parksData);
                // call display data function
                pagesDefinition(parksData);
            });
        } else {
            alert("Error: " + response.status);
        }
    });
};

// funtion to get single park by code (parkCode);
var getParkByCode = function(parkCode) {
    var apiUrl = "https://developer.nps.gov/api/v1/parks?parkCode=" + parkCode + "&api_key=" + parksAPIKey;
    fetch(apiUrl).then(function(response){
        // request was succesful
        if(response.ok) {
            response.json().then(function(data) {
                console.log(data);
                // call display data function with park index and data
                var index = 0;
                displayParkInfo(index, data);

            });
        } else {
            alert("Error: " + response.status);
        }
    });
};

// function to get weather by lat and lon 
var getWeather = function(lat, lon) {
    var apiUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&units=imperial&appid=" + weatherAPIKey;
    fetch(apiUrl).then(function(response){
        // request was succesful
        if(response.ok) {
            response.json().then(function(data) {
                console.log(data);
                // call current weather display function

            });
        } else {
            alert("Error: " + response.status);
        }
    });
};

// result number of pages definition function
var pagesDefinition = function (data) {
    totalPages = Math.floor((data.total - 1) / 10) + 1;
    displaySearchResults(data);
};

// right button was clicked
$("#right").on("click", function () {
    // go to next page if current is not the last one
    if (currentPage < totalPages) {
        currentPage++;
        displaySearchResults(parksData);
    } else {
        return false;
    }
});

// left button was clicked
$("#left").on("click", function () {
    // go to previous page if current is not the first one
    if (currentPage > 1) {
        currentPage--;
        displaySearchResults(parksData);
    } else {
        return false;
    }
});

// function to display list of search results (need a UL element with id=search-list on html)
var displaySearchResults = function(data) {
    var total = data.total;
    var iMax = currentPage * 10;
    if (total < iMax) {
        iMax = total;
    }      
    // clears data before displaying new one
    $("#search-list").empty();
    for (i = (currentPage - 1)*10; i < iMax; i++) {
        $("#search-list").append("<li id='" + i + "'>" + data.data[i].fullName + ' - ' + data.data[i].states + "</li>");        
    }
    $("#page-info").text("Page " + currentPage + " of " + totalPages);
};

// One of the parks in search result was clicked
$("#search-list").click (function(e) {
    var parkId = e.target.id;
    $("#history-list").prepend("<li id='" + parksData.data[parkId].parkCode + "'>" + parksData.data[parkId].fullName + ' - ' + parksData.data[parkId].states + "</li>");
    // call history filter function
    historyCrop();
    // call display data function with park index and data
    displayParkInfo(parkId, parksData);
});

// History list crop and saving funtion
var historyCrop = function() {
    // convert li elements text content into an object of arrays 
    historyList.text = $("ul#history-list > li").map(function(j, element) { 
        return $(element).text(); 
    }).get();
    historyList.id = $("ul#history-list > li").map(function(j, element) { 
        return $(element).attr("id"); 
    }).get();
    // cut the array at a max of 10 and eliminate the extra elements
    if (historyList.text.length > 10) {
        historyList.text.length  = 10;
        historyList.id.length = 10;
        $("ul#history-list > li").slice(10).remove();
    }
    // call save function
    saveHistoryList();
};

// save history to localstorage
var saveHistoryList = function() {
    localStorage.setItem("history-list", JSON.stringify(historyList));
};

// load history from localstorage
var loadHistory = function() {
    var loadedHistoryList = JSON.parse(localStorage.getItem("history-list"));
    if (loadedHistoryList) {
        for (i = 0; i < loadedHistoryList.id.length; i++) {
            $("#history-list").append("<li id='" + loadedHistoryList.id[i] + "'>" + loadedHistoryList.text[i] + "</li>");
        }
    }
};

// Clear History button was click
$("#clear").on("click", function() {
    $("#history-list").empty();
    historyList = {
        text: [],
        id: []
    };
    saveHistoryList();
});

// Park on history was clicked
$("#history-list").click (function(e) {
    var parkName = e.target.innerText;
    var parkCode = e.target.id;
    // remove element clicked from list
    $("#" + parkCode).remove();
    // add clicked element to top of the list
    $("#history-list").prepend("<li id='" + parkCode + "'>" + parkName + "</li>");
    // call history list crop and saving function
    historyCrop();
    // call the get park by Id function
    getParkByCode(parkCode);
});

// click on search button. 
$("#search").on("click", function() {
    // get values from word and state and pass to function
    var searchWord = $("#word").val();
    var state = $("#state-select").val();
    if ((searchWord) || (state)) {
        // reset current page
        currentPage = 1;
        getPark(searchWord, state);
    } else {
        alert("You must enter a search word and/or select state to search");
    }
});

// Display park data function
var displayParkInfo = function(index, data) {
    // display park name
    $("#park-name").text(data.data[index].fullName);
    // puts single park data into global variable to be use by other  functions
    singleParkData = data.data[index];
    console.log(singleParkData);
    // call pictures display
    picDisplay();
    // get park lat and long for weather


    // call weather fetch with lat and long



    // display park description
    $("#park-description").empty();
    $("#park-description").text("Description:");
    $("#park-description").append("<p>" + data.data[index].description + "</p>");
    // display park activities
    var activities = "";
    for (i = 0; i < data.data[index].activities.length; i++) {
        if (i < data.data[index].activities.length - 2) {
            activities += data.data[index].activities[i].name + ", ";
        }
        if (i === data.data[index].activities.length - 2) {
            activities += data.data[index].activities[i].name;
        }
        if (i === data.data[index].activities.length - 1) {
            activities += " and " + data.data[index].activities[i].name + ".";
        } 
    }
    $("#activities").text("Activities: " + activities);
    // entrance fees display
    $("#entrance-fees").empty();
    $("#entrance-fees").text("Entrance Fees:");
    for (i = 0; i < data.data[index].entranceFees.length; i++) {
        $("#entrance-fees").append("<p>Cost: $" + data.data[index].entranceFees[i].cost + ", " + data.data[index].entranceFees[i].description + "</p>");
    }
    // hours of operation display
    $("#operating-hours").empty();
    $("#operating-hours").text("Operating hours:");
    var hours = data.data[index].operatingHours;
    for (i = 0; i < hours.length; i++) {
        $("#operating-hours").append("<p>" + (i+1) + ") " + hours[i].name + ". " + hours[i].description + "</p>");
        $("#operating-hours").append("<p>Open-Hours: Sunday: " + hours[i].standardHours.sunday + "; Monday: " + hours[i].standardHours.monday + "; Tuesday: " + hours[i].standardHours.tuesday + "; Wednesday: " + hours[i].standardHours.wednesday + "; Thursday: " + hours[i].standardHours.thursday + "; Friday: " + hours[i].standardHours.friday + "; Saturday: " + hours[i].standardHours.saturday + ".</p>");
        $("#operating-hours").append("<p>Exception days (Park Closed):</p>"); 
        var exceptions = hours[i].exceptions;
        if (exceptions.length > 0) {
            // for loop for exceptions (park closed days)
            for (e = 0; e < exceptions.length; e++) {
                $("#operating-hours").append("<p>* " + exceptions[e].name + ": from " + exceptions[e].startDate + " to " + exceptions[e].endDate + "</p>");
            }
        } else {
            $("#operating-hours").append("<p>No exceptions</p>"); 
        }
    }
    // Directions display
    $("#directions").empty();
    $("#directions").text("Directions:");
    $("#directions").append("<p>" + data.data[index].directionsInfo + "</p>");
    $("#directions").append("<a href='" + data.data[index].directionsUrl + "' target='_blank'>For more directions information click here.</a>");
    // More Park information link
    $("#more-info").empty();
    $("#more-info").text("For more Information about " + data.data[index].fullName + " click here");
    $("#more-info").attr("href", data.data[index].url);
    $("#more-info").attr("target", "_blank");
};

// park picturas pagination filter
var picDisplay = function() {
    picPage = 0;
    picPageMax = singleParkData.images.length - 1;
    // clean everything on pictures <div>
    $("#pictures").empty();
    $("#pictures").append("<p id='imgTitle'>" + singleParkData.images[picPage].title + "</p>");
    $("#pictures").append("<img id='image' src='" + singleParkData.images[picPage].url + "' alt='" + singleParkData.images[picPage].altText + "'></img>");
    $("#pictures").append("<p id='imgCaption'>" + singleParkData.images[picPage].caption + " - By: " + singleParkData.images[picPage].credit + ".</p>");
    var picNum = picPage + 1;
    var picLast = picPageMax + 1;
    $("#pictures").append("<p id='pic-page'>Picture " + picNum + " out of " + picLast + "</p>");
    $("#pictures").append("<button id='previous'>Previous</button>");
    $("#pictures").append("<button id='next'>Next</button>");
};

// Next or previous picture button was clicked
$("#pictures").click (function(e) {
    var buttonId = e.target.id;
    if (buttonId === "next") {
        if (picPage < picPageMax) {
            picPage++;
            // call new picture display
            newPictureDisplay();
        }
        return;
    }
    if (buttonId === "previous") {
        if (picPage > 0) {
            picPage--;
            // call new picture display
            newPictureDisplay;
        }
    }
});

// new picture display
var newPictureDisplay = function() {
    $("#imgTitle").text(singleParkData.images[picPage].title);
    $("#image").attr("src", singleParkData.images[picPage].url);
    $("#image").attr("alt", singleParkData.images[picPage].altText);
    $("#imgCaption").text(singleParkData.images[picPage].caption + " - By: " + singleParkData.images[picPage].credit);
    var picNum = picPage + 1;
    var picLast = picPageMax + 1;
    $("#pic-page").text("Picture " + picNum + " out of " + picLast);
};










loadHistory();