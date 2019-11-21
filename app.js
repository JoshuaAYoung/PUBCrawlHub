'use strict';
// KEYS
const MAPBOX_API_KEY = 'pk.eyJ1IjoibWljaGFlbGhwIiwiYSI6ImNrMzF1NjkyODBkMGwzbXBwOWJrcXQxOWwifQ.5VGC7vYD6ckQ2v-MVsIHLw';
mapboxgl.accessToken = MAPBOX_API_KEY;

// STORE
const STORE = {
  state: 'MAIN',
  brewResults: [],
  brewList: [],
  map: new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-104.991531, 39.742043],
    zoom: 11,
  }),
  directions : new MapboxDirections({
    accessToken: mapboxgl.accessToken,
    profile: 'mapbox/walking',
  }),
  addNav: function() {
    STORE.map.addControl(this.directions);
  },
  removeNav: function() {
    STORE.map.removeControl(this.directions);
  },
  addMarker: function(coordArr) {
    for(let i = 0; i < coordArr.length; i++) {
      // create a HTML element for each feature
      let el = document.createElement('div');
      el.className = 'marker';
    // make a marker for each bar and add to the map
      new mapboxgl.Marker(el)
        .setLngLat([parseFloat(coordArr[i][0]), parseFloat(coordArr[i][1])])
        .addTo(STORE.map);
    }
  },
  recenter: function(latLon) {
    STORE.map.easeTo({
      center: latLon
    })
  },
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

// MAPBOX URL
const MAPBOX_URL = 'https://api.mapbox.com/';

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

function addDirections() {
  $('#addDirections').on('click', e => {
    e.preventDefault();
    STORE.addNav();
  })
}

function removeDirections() {
  $('#removeDirections').on('click', e => {
    e.preventDefault();
    STORE.removeNav();
  });
}

function slideOutADVSearch() {
  $('.searchForm').on('click', '#advSearchToggle', function(e) {
    e.preventDefault();
    $('.advSearchOptions').slideToggle('slow');
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
  let startBar = [STORE.brewList[0].longitude, STORE.brewList[0].latitude];
  let otherBars = [];
  STORE.brewList.forEach(bar => {
    otherBars.push([bar.longitude, bar.latitude]);
  });
  STORE.addMarker(otherBars);
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

function buildResultsView(res) {
  const bars = res;
  $('.resultsList').html('');
  $('.map').html('');
  let resultView = [];
  for(let i = 0; i < bars.length; i++) {
    resultView.push(`
      <li class="barCardItem">
      <label for="numberList${i}">Bar Order</label>
      <input type="text" id="numberList${i}" name="numberList${i}">
      <h3 class="barTitle barLink">
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
  STORE.map;
  STORE.addNav();
  STORE.recenter(mapCenter);
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
  slideOutADVSearch();
  watchUserList();
  removeDirections();
  addDirections();
})