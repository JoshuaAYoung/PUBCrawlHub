'use strict';
// STORE
const STORE = {
  state: 'MAIN',
  stateNumber: 0
}






// URLs

// KEYS
const MAPBOX_API_KEY = 'pk.eyJ1IjoibWljaGFlbGhwIiwiYSI6ImNrMzF1NjkyODBkMGwzbXBwOWJrcXQxOWwifQ.5VGC7vYD6ckQ2v-MVsIHLw';
// HEADERS
const mapboxOptions = {
  header: new Headers(
    {
      'API-X-Key': MAPBOX_API_KEY,
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


function getMapData() {
  fetch()
    .then(res => res.json())
    .then(resJson =>
      renderResults(resJson))
    .catch(e => console.log(e));
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

function getDirections() {
  fetch()
    .then(res => res.json())
    .then(resJson =>
      renderResults(resJson))
    .catch(e => console.log(e));
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
      <p>${bars[i].street}</p>
      <p>${bars[i].city}, ${bars[i].city}, ${bars[i].state}, ${bars[i].postal_code}</p>
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