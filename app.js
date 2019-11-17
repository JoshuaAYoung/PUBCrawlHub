'use strict';
// STORE
const STORE = {
  state: 'MAIN',
}




// URLs
const MAPBOX_API_URL ='';
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

// GET DATA

function formatQueryParams(parameters) {
  //takes parameter keys and makes an array out of them
  const queryItems = Object.keys(parameters)
  //loops through our array and creates a new array made up of strings (encoded for use in url) with the format "key=value"
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`)
  //returns the array object as a single string with & in between each
    return queryItems.join('&');
}

function getBarsFromYelp(locationQ, radiusQ, limitQ, priceQ, openQ, termQ) {
  const yelpURL = 'https://api.yelp.com/v3/businesses/search';
  const yelp_api_key = 'Bearer ZfWIRiwsSHvSYOQ3gxUAB6mY8RyQ1zKwv30vI274WbruCXISg8n5TN-NBFpVfqnDsM4_AWjmONrljsNLzTPuITMswrBWOwmL9H0NNrw71qpxPWfm2kFfniP3s23QXXYx';
  const params = {
    location: locationQ,
    radius: radiusQ,
    limit: limitQ,
    sort_by: "distance",
    categories: "bar, brewery, beer garden, pub",
    price: priceQ,
    open_now: openQ, 
    term: termQ 
  };
  //sets queryString variable as the full string of every parameter joined together
  const queryString = formatQueryParams(params)
  const url = yelpURL + '?' + queryString;

  console.log(url);

  const yelpOptions = {
    headers: new Headers({
      'Authorization': yelp_api_key
    })
  };

  fetch(url, yelpOptions)
  .then(response => {
    if (response.ok) {
      STORE.state = "RESULTS";
      return response.json();
    }
    throw new Error(response.statusText)
  })
  // .then(responseJson => determineView(STORE.state, responseJson))
  .then(responseJson => console.log(responseJson))
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
  const view = ``;
  return view;
}

function buildResultsView(res) {
  $('results').html('');
  let view = ``;
  return view;
}

function buildBadResults(res) {
  $('results').html('');
  let view = ``;
  return view;
}

// PAGE READY LISTENER
$(function() {
  watchForm();
});