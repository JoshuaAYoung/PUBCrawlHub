'use strict';
// STORE
const STORE = {
  state: 'MAIN',
  stateNumber: 0,
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

  console.log(url);

  fetch(url)
  .then(response => {
    if (response.ok) {
      STORE.state = "RESULTS";
      return response.json();
    }
    throw new Error(response.statusText)
  })
  .then(responseJson => { 
    determineView(STORE.state, responseJson);
    STORE.brewList = responseJson})
  .catch(err => {
    STORE.state = "BAD RESULTS";
    determineView(STORE.state, err)
  })
}

function buildMap(startBar) {
  mapboxgl.accessToken = MAPBOX_API_KEY;
  let map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v9',
  center: startBar,
  zoom: 13,
});
  map.addControl(new MapboxDirections({
    accessToken: mapboxgl.accessToken
  }), 'top-left');
}

/* DON'T NEED?
function getDirections(latLon1, latLon2) {
  let coordinate1 = formatCoordinates(latLon1);
  let coordinate2 = formatCoordinates(latLon2);
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coordinate1}%3B${coordinate2}.json?access_token=${MAPBOX_API_KEY}`
  fetch(url)
    .then(res => res.json())
    .then(resJson =>
      console.log(resJson))
    .catch(e => console.log(e));
} 

// HELPER FUNCTION
function formatCoordinates(coordinatePair) {
  // Takes object of lat and lon { lat: lon }
  const lat = Object.keys(coordinatePair);
  const lon = coordinatePair[lat];
  return `${lat}%2C${lon}`
}*/

// EVENT LISTENERS
function watchForm() {
  $('.searchForm').on('submit', function(e){
    e.preventDefault();
    let cityInput = $(this).find('input[name="mainSearch"]').val();
    let stateInput = convertAbbrev($(this).find('input[name="stateSearch"]').val());
    let zipcodeInput = $(this).find('input[name="zipSearch"]').val();
    let limitInput = $(this).find('input[name="resultsNumber"]').val();
    let radiusInput = $(this).find('input[name="proximitySearch"]').val();
    getBarsFromOB(cityInput, stateInput, limitInput);
    // getMapData();
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
    // let coord1 = {'-73.989': 40.733};
    // let coord2 = {'-74': 40.733};
    // getDirections(coord1, coord2);
    // -73.989%2C40.733%3B-74%2C40.733
  });
}

function submitForDirections() {
  $('.mapData').submit(function(e) {
    e.preventDefault();
  })
  // get list of breweries
  // .submit( call map.setOrigin(firstBrewery)
  // , setWaypoint(...subsequentBreweries), 
  // and setDestination(lastBrewery))
}

//DRAG AND DROP
var _el;

function dragOver(e) {
  if (isBefore(_el, e.target))
    e.target.parentNode.insertBefore(_el, e.target);
  else
    e.target.parentNode.insertBefore(_el, e.target.nextSibling);
}

function dragStart(e) {
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", null); // Thanks to bqlou for their comment.
  _el = e.target;
}

function isBefore(el1, el2) {
  if (el2.parentNode === el1.parentNode)
    for (var cur = el1.previousSibling; cur && cur.nodeType !== 9; cur = cur.previousSibling)
      if (cur === el2)
        return true;
  return false;
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
  $('.results').html('');
  $('.map').html('');
}

function buildResultsView(res) {
  const bars = res;
  $('.results').html('');
  $('.map').html('');
  let resultView = [];
  for(let i = 0; i < bars.length; i++) {
    resultView.push(`
    <li class="dropzone${i+1}" draggable = "true" ondragstart="dragStart(event)" ondragover="dragOver(event)"> 
      <h3 class="barTitle barLink">
        <a href="${bars[i].website_url}">${bars[i].name}</a>
      </h3>
      <p class="barAddress">${bars[i].street}</p>
      <p class="barAddress">${bars[i].city}, ${bars[i].state}, ${bars[i].postal_code}</p>
      <p class="barPhone">${bars[i].phone}</p>
    </li>`);
  }
  resultView.join('');
  $('.results').html(resultView);
  $('.map').html(buildMap());
}

function buildBadResults(res) {
  $('.results').html('');
  $('.map').html('');
  let view = `<h2>We've experienced an error</h2>
  <p>${res.message}</p>`;
  $('.results').html(view);
}

// PAGE READY LISTENER
$(function() {
  watchForm();
  watchADVSearch();
})