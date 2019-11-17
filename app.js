'use strict';
// STORE
const STORE = {
  state: 'MAIN',
}

// URLs
const YELP_API_URL = 'https://api.yelp.com/v3/businesses/search';
const MAPBOX_API_URL = '';
// KEYS
const YELP_API_KEY = 'ZfWIRiwsSHvSYOQ3gxUAB6mY8RyQ1zKwv30vI274WbruCXISg8n5TN-NBFpVfqnDsM4_AWjmONrljsNLzTPuITMswrBWOwmL9H0NNrw71qpxPWfm2kFfniP3s23QXXYx';
const MAPBOX_API_KEY = 'pk.eyJ1IjoibWljaGFlbGhwIiwiYSI6ImNrMzF1NjkyODBkMGwzbXBwOWJrcXQxOWwifQ.5VGC7vYD6ckQ2v-MVsIHLw';
// HEADERS
const yelpOptions = {
  header: new Headers(
    {
      'API_KEY': YELP_API_KEY,
    }
  )
};
const mapboxOptions = {
  header: new Headers(
    {
      'API-X-Key': MAPBOX_API_KEY,
    }
  )
};

// GET DATA
function getBars() {
  fetch()
    .then(res => res.json())
    .then(resJson =>
      console.log(resJson))
    .catch(e => console.log(e));
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
});