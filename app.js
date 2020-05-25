// KEYS
const MAPBOX_API_KEY =
  "pk.eyJ1IjoibWljaGFlbGhwIiwiYSI6ImNrMzF1NjkyODBkMGwzbXBwOWJrcXQxOWwifQ.5VGC7vYD6ckQ2v-MVsIHLw";
mapboxgl.accessToken = MAPBOX_API_KEY;

// STORE
const STORE = {
  state: "MAIN",
  brewResults: [],
  brewList: [],
  nav: null,
  map: new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: [-104.991531, 39.742043],
    zoom: 11,
  }),
  directions: new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    profile: "mapbox/walking",
  }),
  stateCodes: {
    AK: "Alaska",
    AL: "Alabama",
    AR: "Arkansas",
    AZ: "Arizona",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DC: "Washington DC",
    DE: "Delaware",
    FL: "Florida",
    GA: "Georgia",
    GU: "Guam",
    HI: "Hawaii",
    IA: "Iowa",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    MA: "Massachusetts",
    MD: "Maryland",
    ME: "Maine",
    MI: "Michigan",
    MN: "Minnesota",
    MO: "Missouri",
    MS: "Mississippi",
    MT: "Montana",
    NC: "North Carolina",
    ND: "North Dakota",
    NE: "Nebraska",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NV: "Nevada",
    NY: "New York",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    PR: "Puerto Rico",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VA: "Virginia",
    VI: "Virgin Islands",
    VT: "Vermont",
    WA: "Washington",
    WI: "Wisconsin",
    WV: "West Virginia",
    WY: "Wyoming",
  },
};

/////// MAPBOX ///////

function recenter(latLon) {
  STORE.map.easeTo({
    center: latLon,
  });
}

function removeMarkers() {
  $(".marker").remove();
}

function addMarker(barArr) {
  for (let i = 0; i < barArr.length; i++) {
    // create a HTML element for each feature
    let el = document.createElement("div");
    el.className = "marker";
    // make a marker for each bar and add to the map
    new mapboxgl.Marker(el)
      .setLngLat([parseFloat(barArr[i][0]), parseFloat(barArr[i][1])])
      .setPopup(new mapboxgl.Popup().setText(`${barArr[i][2]}`))
      .addTo(STORE.map);
  }
}

function addNav() {
  STORE.map.addControl(STORE.directions);
}

function removeNav() {
  STORE.map.removeControl(STORE.directions);
}

/////// HELPER FUNCTIONS ///////
function generateCopyright() {
  let d = new Date();
  let year = d.getFullYear();
  $(".copyright").html(`Copyright &copy; ${year}`);
}

// sortable jquery code
$(".resultsList").sortable({
  cancel: ".alert",
  start: function (event, ui) {
    $(ui.item).addClass("beingDragged");
  },
  stop: function (event, ui) {
    $(ui.item).removeClass("beingDragged");
    orderNumber();
    fillBrewList();
    passToMap();
  },
});

//iterates through each of the list items and sets the order number to the .ordernumber div
function orderNumber() {
  $(".resultsList li").each(function (i) {
    let position = i++;
    $(this)
      .find(".orderNumber")
      .html(position + 1);
  });
}

//after user rearranges the list or removes an item, (re)populate the brewList object
function fillBrewList() {
  STORE.brewList = [];
  $(".resultsList li").each(function () {
    let resultIndex = STORE.brewResults.findIndex((arrayItem) => {
      return (
        arrayItem.name ===
        $.parseHTML($(this).find(".barName").html())[0].textContent
      );
    });
    STORE.brewList.push(STORE.brewResults[resultIndex]);
  });
}

// open brewery
function convertAbbrev(input) {
  if (input.length === 2) {
    return STORE.stateCodes[input.toUpperCase()];
  } else {
    return input;
  }
}

//map arrow button display
function buttonScroll() {
  let mybutton = document.getElementById("scrollMap");
  window.onscroll = function () {
    scrollFunction();
  };
  function scrollFunction() {
    if (
      document.body.scrollTop > $(document).height() - 1200 ||
      document.documentElement.scrollTop > $(document).height() - 1200
    ) {
      mybutton.style.display = "none";
    } else {
      mybutton.style.display = "block";
    }
  }
}

/////// DATA HANDLERS ///////

//formats our query string
function formatQuery(parameters) {
  const queryItems = Object.keys(parameters).map(
    (key) => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`
  );
  return queryItems.join("&");
}

//api call function to openbrewery
function getBarsFromOB(cityQ, stateQ, limitQ = 20) {
  const baseURL = "https://api.openbrewerydb.org/breweries";
  const params = {
    by_city: cityQ,
    by_state: stateQ,
    per_page: limitQ,
    sort: "city",
  };
  const queryString = formatQuery(params);
  const url = baseURL + "?" + queryString;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        STORE.state = "RESULTS";
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then((responseJson) => {
      // Because open brewery DB doesn't have geo data for all bars
      // This filters results that don't have lat and long
      if (responseJson.length === 0) {
        STORE.state = "NO RESULTS";
        determineView(STORE.state);
      } else {
        let geocodedResults = filterLatLonResults(responseJson);
        STORE.brewResults = geocodedResults;
        let missingResults = false;
        if (geocodedResults.length !== responseJson.length) {
          missingResults = true;
        }
        determineView(STORE.state, STORE.brewResults, missingResults);
      }
    })
    .catch((err) => {
      STORE.state = "BAD RESULTS";
      determineView(STORE.state, err);
    });
}

//some results come back without latitude and longitude which mapbox needs - filters these items out
function filterLatLonResults(res) {
  return res.filter((bar) => bar.longitude !== null || bar.latitude !== null);
}

//sends brewlist to the map
function passToMap() {
  let startBar = [STORE.brewList[0].longitude, STORE.brewList[0].latitude];
  let otherBars = [];
  STORE.brewList.forEach((bar) => {
    otherBars.push([bar.longitude, bar.latitude, bar.name]);
  });
  removeMarkers();
  recenter(startBar);
  addMarker(otherBars);
}

/////// EVENT LISTENERS ///////

//watches the initial form
function watchForm() {
  $(".searchForm").on("submit", function (e) {
    e.preventDefault();
    $(".listSubmit").show();
    let cityInput = $(this).find("input[name='mainSearch']").val();
    let stateInput = convertAbbrev(
      $(this).find("input[name='stateSearch']").val()
    );
    let limitInput = $(this).find("input[name='resultsNumber']").val();
    getBarsFromOB(cityInput, stateInput, limitInput);
    buttonScroll();
    $(".mapHeader").show();
    $(".resultsHeader").show();
    $(".results").show();
    $(".resultsBreak").show();
  });
}

//toggles directions on and off in mapbox
function toggleDirections() {
  $("#toggleDirections").on("click", (event) => {
    event.preventDefault();
    if (STORE.nav !== true) {
      addNav();
      STORE.nav = true;
    } else {
      removeNav();
      STORE.nav = false;
    }
  });
}

//shows the "search options" inputs
function slideOutADVSearch() {
  $(".searchForm").on("click", "#advSearchToggle", function (e) {
    e.preventDefault();
    $(".advSearchOptions").slideToggle("slow");
  });
}

//button to remove a result
function removeBar() {
  $(".barCardItem").on("click", ".removeButton", function (event) {
    fillBrewList();
    if (STORE.brewList.length > 1) {
      event.preventDefault;
      $(this).parent().parent().remove();
      orderNumber();
      fillBrewList();
      passToMap();
    } else {
      event.preventDefault();
    }
  });
}

/////// HTML GENERATORS ///////

//generate the results html for happy result
function buildResults(resultView) {
  const bars = STORE.brewResults;
  $(".resultsList").html("");
  $(".map").html("");
  for (let i = 0; i < bars.length; i++) {
    resultView.push(`
      <li class="barCardItem" id=List${i + 1}>
      <div class="orderNumber">${i + 1}
      </div>
      <div class="barContainer">
      <h3 class="barTitle barLink">
        <a href="${bars[i].website_url}" class="barName" target="_blank">${
      bars[i].name
    }</a>
      </h3>
      <p class="barAddress barInfo">${bars[i].street}</p>
      <p class="barAddress barInfo">${bars[i].city}, ${bars[i].state}, ${
      bars[i].postal_code
    }</p>
      <p class="barPhone barInfo">${bars[i].phone}</p>
      <button type="button" id="removeButton" class="removeButton">&times</button>
      </li>`);
  }
}

//generates html for the case when the inputs did not return any results
function buildNoResults() {
  $(".resultsList").html();
  removeMarkers();
  $(".resultsList").html(`<div class="alert">
    <span class="warning">Sorry:</span> Your search didn't return any results. Please try again.
  </div>`);
  setTimeout(function () {
    $(".alert").fadeOut();
  }, 5000);
}

//generate html for unhappy result
function buildBadResults(res) {
  $(".resultsList").html("");
  $(".map").html("");
  let view = `<h2>We've experienced an error</h2>
  <p>${res.message}</p>`;
  $(".resultList").html(view);
}

//checks for missing longitude and latitude and pushes the results with an error if any are parsed out
function checkMissing(results, view) {
  if (results) {
    $(".resultsList")
      .html(`<div class="alert"><span class="warning">Note:</span> Some results were removed due to missing location information from the OpenBrewery database.</div>
  ${view.join("")}`);
    setTimeout(function () {
      $(".alert").fadeOut();
    }, 4000);
  } else {
    $(".resultsList").html(view.join(""));
  }
}

/////// VIEW HANDLERS ///////

//determines which state the page is in and pushes the resulting view
function determineView(state, res, missingResults) {
  if (state === "MAIN") {
    return buildMainView();
  } else if (state === "RESULTS") {
    return buildResultsView(missingResults);
  } else if (state === "NO RESULTS") {
    return buildNoResults();
  } else if (state === "BAD RESULT") {
    return buildBadResults(res);
  }
}

//builds the results and pushes them to both the map and the results list
function buildResultsView(missingResults = false) {
  let resultView = [];
  buildResults(resultView);
  checkMissing(missingResults, resultView);
  removeBar();
  let mapCenter = [
    STORE.brewResults[0].longitude,
    STORE.brewResults[0].latitude,
  ];
  STORE.map;
  addNav();
  STORE.nav = true;
  recenter(mapCenter);
  let initialBars = [];
  STORE.brewResults.forEach((bar) => {
    initialBars.push([bar.longitude, bar.latitude, bar.name]);
  });
  addMarker(initialBars);
}

/////// PAGE READY LISTENER ///////
$(function () {
  watchForm();
  slideOutADVSearch();
  toggleDirections();
  generateCopyright();
});
