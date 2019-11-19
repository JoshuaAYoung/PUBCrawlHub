'use strict';
// STORE
const STORE = {
  state: 'MAIN',
  stateNumber: 0,
  brewResults: [],
  brewList: [],
  stateCodes: {
    AK: "Alaska",
    AL: "Alabama",
    AR: "Arkansas",
    AZ:	"Arizona",
    CA:	"California",
    CO:	"Colorado",
    CT:	"Connecticut",
    DC: "Washington DC",
    DE:	"Delaware",
    FL:	"Florida",
    GA:	"Georgia",
    GU:	"Guam",
    HI:	"Hawaii",
    IA:	"Iowa",
    ID:	"Idaho",
    IL:	"Illinois",
    IN:	"Indiana",
    KS:	"Kansas",
    KY:	"Kentucky",
    LA:	"Louisiana",
    MA:	"Massachusetts",
    MD:	"Maryland",
    ME:	"Maine",
    MI:	"Michigan",
    MN:	"Minnesota",
    MO:	"Missouri",
    MS:	"Mississippi",
    MT:	"Montana",
    NC:	"North Carolina",
    ND:	"North Dakota",
    NE:	"Nebraska",
    NH:	"New Hampshire",
    NJ:	"New Jersey",
    NM:	"New Mexico",
    NV:	"Nevada",
    NY:	"New York",
    OH:	"Ohio",
    OK:	"Oklahoma",
    OR:	"Oregon",
    PA:	"Pennsylvania",
    PR:	"Puerto Rico",
    RI:	"Rhode Island",
    SC:	"South Carolina",
    SD:	"South Dakota",
    TN:	"Tennessee",
    TX:	"Texas",
    UT:	"Utah",
    VA:	"Virginia",
    VI:	"Virgin Islands",
    VT:	"Vermont",
    WA:	"Washington",
    WI:	"Wisconsin",
    WV:	"West Virginia",
    WY:	"Wyoming"
  }
}



// URLs
const MAPBOX_URL = 'https://api.mapbox.com/';
// KEYS
const MAPBOX_API_KEY = 'pk.eyJ1IjoibWljaGFlbGhwIiwiYSI6ImNrMzF1NjkyODBkMGwzbXBwOWJrcXQxOWwifQ.5VGC7vYD6ckQ2v-MVsIHLw';
mapboxgl.accessToken = MAPBOX_API_KEY;

// OPEN BREWERY
function convertAbbrev(input) {
  if (input.length === 2) {
    return STORE.stateCodes[input.toUpperCase()];
  }
  else {
    return input;
  }
}

function formatQuery(parameters) {
  //takes parameter keys and makes an array out of them
  const queryItems = Object.keys(parameters)
  //loops through our array and creates a new array made up of strings (encoded for use in url) with the format "key=value"
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`)
  //returns the array object as a single string with & in between each
    return queryItems.join('&');
}

function getBarsFromOB(cityQ, stateQ, limitQ=10) {
  const baseURL = 'https://api.openbrewerydb.org/breweries';
  const params = {
    by_city: cityQ,
    by_state: stateQ,
    per_page: limitQ,
    sort: "city"
  };
  //sets queryString variable as the full string of every parameter joined together
  const queryString = formatQuery(params)
  const url = baseURL + '?' + queryString;

  fetch(url)
  .then(response => {
    if (response.ok) {
      STORE.state = "RESULTS";
      return response.json();
    }
    throw new Error(response.statusText)
  })
  .then(responseJson => { 
    STORE.brewResults = responseJson
    determineView(STORE.state, responseJson);
  })
  .catch(err => {
    STORE.state = "BAD RESULTS";
    determineView(STORE.state, err)
  })
}

function buildMap(startBar) {
  mapboxgl.accessToken = MAPBOX_API_KEY;
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: startBar,
    zoom: 13,
  });
  map.addControl(new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    profile: 'mapbox/walking',
  }), 'top-left');
}

// EVENT LISTENERS
function watchForm() {
  $('.searchForm').on('submit', function(e){
    e.preventDefault();
    $(".listSubmit").show();
    let cityInput = $(this).find('input[name="mainSearch"]').val();
    let stateInput = convertAbbrev($(this).find('input[name="stateSearch"]').val());
    let zipcodeInput = $(this).find('input[name="zipSearch"]').val();
    let limitInput = $(this).find('input[name="resultsNumber"]').val();
    let radiusInput = $(this).find('input[name="proximitySearch"]').val();
    getBarsFromOB(cityInput, stateInput, limitInput);
  })
}

function watchModifiers() {
  $('#modifiers').on('click', function(e) {
    e.preventDefault();
  })
}

function watchADVSearch() {
  $('.searchForm').on('click', '#advSearchToggle', function(e) {
    e.preventDefault();
    $('.advSearchOptions').slideToggle('slow');
  });
}

function makeMarkersFromUserList(barNames) {
  let mapboxClient = mapboxSdk({ accessToken: mapboxgl.accessToken });
    mapboxClient.geocoding.forwardGeocode({
    query: barNames,
    autocomplete: false,
    limit: 1
  })
  .send()
  .then(function (response) {
    if (response && response.body && response.body.features && response.body.features.length) {
    let feature = response.body.features[0];

    let map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: feature.center,
      zoom: 13
    });
    new mapboxgl.Marker()
      .setLngLat(feature.center)
      .addTo(map);
    }
  });
}

//SORT THE BREWS OBJECT
function sortList(unordered) {
  let ordered = {};
  Object.keys(unordered).sort().forEach(function(key) {
    ordered[key] = unordered[key];
  });
}

//WATCH THE LIST OF BREWERIES SUBMIT FORM
function watchUserList() {
  $('.resultsForm').on('submit', function(e) {
    e.preventDefault();
    let brewObject = {};
    for (let i = 0; i < STORE.brewResults.length; i++) {
      brewObject[$(this).find('input[name="numberList'+ i +'"]').val()] = STORE.brewResults[i];
    };
    delete brewObject[""];
    sortList(brewObject);
    for (let i = 0; i < Object.keys(brewObject).length; i++) {
      STORE.brewList.push(brewObject[Object.keys(brewObject)[i]]);
    }
  makeMarkersFromUserList(`${STORE.brewList[0].street} ${STORE.brewList[0].city}`);
  })
}

function submitForDirections() {
  $('.mapData').submit(function(e) {
    e.preventDefault();
    let mapCenter = [STORE.brewList[0].longitude, STORE.brewList[0].latitude]
    buildMap(mapCenter);
    // AFTER ADDING POINTS THIS?
    // map.on('click', function(e) {
    //   let features = map.queryRenderedFeatures(e.point, {
    //     layers: ['bars'] // replace this with the name of the layer
    //   });
    
    //   if (!features.length) {
    //     return;
    //   }
    
    //   let feature = features[0];
    
    //   let popup = new mapboxgl.Popup({ offset: [0, -15] })
    //     .setLngLat(feature.geometry.coordinates)
    //     .setHTML('<h3>' + feature.properties.title + '</h3><p>' + feature.properties.description + '</p>')
    //     .addTo(map);
    // });
  })
}


// VIEW HANDLERS
function determineView(state, res) {
  if (state === 'MAIN') {
    return buildMainView();
  } else if (state === 'RESULTS') {
    return buildResultsView(res);
  } else if (state === 'BAD RESULT') {
    return buildBadResults(res);
  }
}

function buildMainView() {
  $('.resultsList').html('');
  $('.map').html('');
}

function buildResultsView(res) {
  const bars = res;
  $('.resultsList').html('');
  $('.map').html('');
  let resultView = [];
  for(let i = 0; i < bars.length; i++) {
    resultView.push(`
      <input type="text" id="numberList${i}" name="numberList${i}">
      <li class="barCardItem"><h3 class="barTitle barLink">
        <a href="${bars[i].website_url}">${bars[i].name}</a>
      </h3>
      <p class="barAddress">${bars[i].street}</p>
      <p class="barAddress">${bars[i].city}, ${bars[i].state}, ${bars[i].postal_code}</p>
      <p class="barPhone">${bars[i].phone}</p>
      </li>
      `);
  }

  resultView.join('');
  $('.resultsList').html(resultView);
  let mapCenter = [STORE.brewResults[0].longitude, STORE.brewResults[0].latitude];
  buildMap(mapCenter);
}

function buildBadResults(res) {
  $('.resultsList').html('');
  $('.map').html('');
  let view = `<h2>We've experienced an error</h2>
  <p>${res.message}</p>`;
  $('.resultList').html(view);
}

// PAGE READY LISTENER
$(function() {
  watchForm();
  watchADVSearch();
  watchUserList();
})