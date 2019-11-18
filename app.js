'use strict';
// STORE
const STORE = {
  state: 'MAIN',
  stateNumber: 0
}

// URLs
const MAPBOX_URL = 'https://api.mapbox.com/';
// KEYS
const MAPBOX_API_KEY = 'pk.eyJ1IjoibWljaGFlbGhwIiwiYSI6ImNrMzF1NjkyODBkMGwzbXBwOWJrcXQxOWwifQ.5VGC7vYD6ckQ2v-MVsIHLw';
// HEADERS
const mapboxOptions = {
  header: new Headers(
    {
      "id": "cijucimbe000brbkt48d0dhcx",
      "usage": "pk",
      "client": "api",
      "default": false,
      "note": "My website",
      "scopes": ["styles:read", "fonts:read"],
      "created": "2018-01-25T19:07:07.621Z",
      "modified": "2018-01-26T00:39:57.941Z",
      "token": MAPBOX_API_KEY,
    }
  )
};

// BEERMAPPING

// function formatBMQuery(parameters) {

//   //returns the array object as a single string with & in between each
//     return queryItems.join('&');
// }

// function getBarsFromBM(locationQ, radiusQ, limitQ, priceQ, openQ, termQ) {
//   const bMURL = 'http://beermapping.com/webservice/loccity/';
//   const bMKey = "658bca16f97e42e28a59c3bdb54241f8";
  
//   //sets queryString variable as the full string of every parameter joined together
//   const url = bMURL + bMKey + '/' + STORE[1].city + ',' + STORE[1].state; + "&s=json"

//   console.log(url);

//   fetch(url)
//   .then(response => {
//     if (response.ok) {
//       STATE[0].stateNumber++;
//       return response.json();
//     }
//     throw new Error(response.statusText)
//   })
//   // .then(responseJson => determineView(STORE.state, responseJson))
//   .then(responseJson => console.log(responseJson))
//   .catch(err => {
//     determineView(STORE.state, err)
//   })
// }

// OPEN BREWERY

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
  .then(responseJson => console.log(responseJson))
  // .then(responseJson => determineView(STORE.state, responseJson))
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
}

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
}

// EVENT LISTENERS
function watchForm() {
  $('form').submit(e => {
    e.preventDefault();
    getBarsFromYelp();
    getMapData();
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
    let coord1 = {'-73.989': 40.733};
    let coord2 = {'-74': 40.733};
    getDirections(coord1, coord2);
    // -73.989%2C40.733%3B-74%2C40.733
  });
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
    resultView.push(`<div class="barCard">
      <h3 class="barTitle barLink">
        <a href="${bars[i].website_url}">${bars[i].name}</a>
      </h3>
      <p class="barAddress">${bars[i].street}</p>
      <p class="barAddress">${bars[i].city}, ${bars[i].state}, ${bars[i].postal_code}</p>
      <p class="barPhone">${bars[i].phone}</p>
    `);
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