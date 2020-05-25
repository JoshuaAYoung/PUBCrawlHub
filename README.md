# PUBcrawlHUB
A free app to find bars and breweries and map out your pub crawl. [Link to the live version](http://pubcrawlhub.dev)
## Live App: [Pub Crawl Hub](https://pubcrawlhub.dev)
[![CodeFactor](https://www.codefactor.io/repository/github/joshuaayoung/pubcrawlhub-client/badge/master)](https://www.codefactor.io/repository/github/joshuaayoung/pubcrawlhub-client/overview/master)
### Some notes on the build
- The app's design was born organically - no templates here
- The CSS was scratch built - no bootstrap here
- The functionality of the Mapbox plugin was somewhat limiting. Eventually, the Mapbox plugin will be replaced with Google Maps. 
 Some creative JavaScript was crafted in order to work around some missing features. For example:
    - The map required longitude and latitude in order to add pins to the map. The OpenBrewery API, unfortunately, does not have latitude and longitude data for ALL bars. These were strategically sorted out.
    - The Mapbox API does not automatically center on any of the results. This latitude and longitude had to be calculated and fed to the plugin in order to show all results on the page.
    - Unfortunately, the plugin would not automatically get directions without a click event inside of the map plugin. There was nothing to do here other than to instruct the user on how to start their route. 
    
### Features to come

- Countdown timer, to sync up with your friends and know when to move on
- Share-able routes/breweries list
- Find the user's current location and add as a marker to the map
- Get directions between multiple bars

## Built With
[Open Brewery DB](https://www.openbrewerydb.org/)

[Mapbox and Mapbox GL JS](https://www.mapbox.com/)

[jQuery](https://jquery.com/)

[Sortable jQuery](https://jqueryui.com/sortable/)

[jQuery UI Touch Punch](http://touchpunch.furf.com/)

HTML 5, CSS 3, Javascript

## Authors
* **Josh Young** - *API Implimentation* [Josh's Portfolio](https://joshyoung.net)


* **Michael Ploughman** - *Mapping Functionality* [michaelhploughman.com](https://michaelhploughman.com)
