'use strict';
// STORE
const STORE = {
  state: 'MAIN',
}

// URLs
const YELP_API_URL = 'https://api.yelp.com/v3/businesses/search';
const MAPBOX_API_URL ='';
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
function getBarsFromYelp() {
  fetch()
  .then(res => res.json())
  .then(resJson => 
    renderResults(resJson))
  .catch(e => console.log(e));
}

function getMapData() {
  fetch()
  .then(res => res.json())
  .then(resJson => 
    renderResults(resJson))
  .catch(e => console.log(e));
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

  })
}

function watchModifiers() {
  $('#modifiers').on('click', function(e) {
    e.preventDefault();
  })
}

// VIEW HANDLERS
function determineView(state) {
  if(state === 'MAIN') {
    return buildMainView();
  } else if (state === 'RESULTS') {
    return buildResultsView();
  } else if (state === 'BAD RESULT') {
    return buildBadResults();
  }
}

function buildMainView() {
  $('results').html('');
  const 
}

function buildResultsView() {
  $('results').html('');
}

function buildBadResults() {
  $('results').html('');
}

// PAGE READY LISTENER
$(function() {
  watchForm();
});