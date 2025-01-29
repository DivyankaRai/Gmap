

import React, { useEffect, useRef, useState } from 'react';
import './Gmap.css';

const GoogleMaps = () => {
  const mapRef = useRef(null);
  const pacInputRef = useRef(null);
  const destinationInputRef = useRef(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  let map;
  let autocompleteOrigin;
  let autocompleteDestination;
  let directionsService;
  let directionsRenderer;
  let vehicleMarker;
  let path = [];
  let currentIndex = 0;
  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.gomaps.pro/maps/api/js?key=AlzaSyq-E_r8GC25m1_wG40zoPFE337p9GKX6qW&libraries=geometry,places,directions&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    window.initMap = () => {
      map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 28.6139, lng: 77.2090 },
        zoom: 13,
      });

      directionsService = new window.google.maps.DirectionsService();
      directionsRenderer = new window.google.maps.DirectionsRenderer();
      directionsRenderer.setMap(map);

      autocompleteOrigin = new window.google.maps.places.Autocomplete(pacInputRef.current);
      autocompleteDestination = new window.google.maps.places.Autocomplete(destinationInputRef.current);

      autocompleteOrigin.bindTo('bounds', map);
      autocompleteDestination.bindTo('bounds', map);

      autocompleteOrigin.addListener('place_changed', () => {
        if (autocompleteOrigin.getPlace()) {
          calculateAndDisplayRoute();
        }
      });

      autocompleteDestination.addListener('place_changed', () => {
        if (autocompleteDestination.getPlace()) {
          calculateAndDisplayRoute();
        }
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const calculateAndDisplayRoute = () => {
    const originPlace = autocompleteOrigin.getPlace();
    const destinationPlace = autocompleteDestination.getPlace();

    if (!originPlace || !originPlace.geometry || !destinationPlace || !destinationPlace.geometry) {
      console.log('Please select a valid place.');
      return;
    }

    const request = {
      origin: originPlace.geometry.location,
      destination: destinationPlace.geometry.location,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(result);
        trackVehicle(result.routes[0].overview_path);
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  };

  const trackVehicle = (routePath) => {
    if (!routePath || routePath.length === 0) return;

    path = routePath;
    currentIndex = 0;

    if (vehicleMarker) {
      vehicleMarker.setMap(null);
    }

    vehicleMarker = new window.google.maps.Marker({
      position: path[currentIndex],
      map: map,
      icon: {
        url: "https://cdn-icons-png.flaticon.com/128/12689/12689302.png",
        scaledSize: new window.google.maps.Size(40, 40),
      },
    });

    moveVehicle();
  };

  const moveVehicle = () => {
    if (currentIndex >= path.length - 1) return;

    currentIndex++;
    vehicleMarker.setPosition(path[currentIndex]);

    setTimeout(moveVehicle, 100);
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    calculateAndDisplayRoute();
  };

  return (
    <div>
      <input
        ref={pacInputRef}
        id="pac-input"
        type="text"
        placeholder="Search for an origin"
        className="input-field"
      />
      <input
        ref={destinationInputRef}
        id="destination-input"
        type="text"
        placeholder="Search for a destination"
        className="input-field"
      />
      <button 
        onClick={handleSubmit} 
        className="submit-btn"
      >
        Submit
      </button>
      <div id="map" ref={mapRef}></div>
    </div>
  );
};

export default GoogleMaps;

