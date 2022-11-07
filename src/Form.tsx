import React, { useEffect, useRef, useState } from 'react';
import { InfoMarker } from './Data';

interface FormProps {
    zoom: number; 
    setZoom: React.Dispatch<React.SetStateAction<number>>;
    center: google.maps.LatLngLiteral; 
    setCenter: React.Dispatch<React.SetStateAction<google.maps.LatLngLiteral>>;
    userMarkers: InfoMarker[];
    mapRef: React.MutableRefObject<google.maps.Map | undefined>;
}

export const Form = (prop: FormProps): JSX.Element => {
    const {zoom, setZoom, center, setCenter, userMarkers, mapRef} = prop;
    const searchInput = useRef<HTMLInputElement>(null);
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder>();
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete>();
    
    useEffect(() => {
        if (searchInput.current) {
            if (!geocoder) {
                setGeocoder(new google.maps.Geocoder());
            }
            if (!autocomplete) {
                const options = {
                    fields: ["formatted_address", "geometry", "name"],
                    strictBounds: false,
                    types: ["establishment"],
                };
                setAutocomplete(new google.maps.places.Autocomplete(searchInput.current, options));
            }
        }
    }, [searchInput, geocoder, autocomplete]);

    useEffect(() => {
        if (autocomplete && mapRef.current) {
            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (!place.geometry || !place.geometry.location) {
                    // User entered the name of a Place that was not suggested and
                    // pressed the Enter key, or the Place Details request failed.
                    window.alert("No details available for input: '" + place.name + "'");
                    return;
                }
                if (place.geometry.viewport) {
                    mapRef.current!.fitBounds(place.geometry.viewport);
                } else {
                    mapRef.current!.setCenter(place.geometry.location);
                    mapRef.current!.setZoom(17);
                }
            });
        }
    }, [autocomplete, mapRef]);

    const search = async () => {
        if (searchInput.current && geocoder) {
            return geocoder.geocode({ address: searchInput.current.value });
        }
    }

    return (
        <div
          style={{
            padding: "1rem",
            flexBasis: "250px",
            height: "100%",
            overflow: "auto",
          }}
        >
            <label htmlFor="zoom">Zoom</label>
            <input
                type="number"
                id="zoom"
                name="zoom"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
            />
            <br />
            <label htmlFor="lat">Latitude</label>
            <input
                type="number"
                id="lat"
                name="lat"
                value={center.lat}
                onChange={(event) =>
                    setCenter({ ...center, lat: Number(event.target.value) })
                }
            />
            <br />
            <label htmlFor="lng">Longitude</label>
            <input
                type="number"
                id="lng"
                name="lng"
                value={center.lng}
                onChange={(event) =>
                    setCenter({ ...center, lng: Number(event.target.value) })
                }
            />
            <br />
            <label htmlFor="search">Search</label>
            <input
                type="string"
                id="search"
                name="search"
                ref={searchInput}
                defaultValue="Enter Address"
            />
            <br />
            <input
                type="button"
                id="searchBtn"
                value="Search"
                onClick={
                    async () => { 
                        let res = await search();
                        alert(JSON.stringify(res)); 
                    }
                }
            />
            <h3>{userMarkers.length === 0 ? "Click on map to add markers" : "Clicks"}</h3>
            {userMarkers.map((marker, i) => (
                <div key={i}>
                    <pre>{marker.geohash}</pre>
                    <pre>{marker.data}</pre>
                </div>
            ))}
        </div>
    );
}