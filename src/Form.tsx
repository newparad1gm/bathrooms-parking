import React, { useEffect, useRef, useState } from 'react';
import { InfoMarker } from './Data';
import './Form.css';

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
        <div className='form'>
            <div className='form-line'>
                <label htmlFor="zoom" className='form-text'>Zoom</label>
                <input
                    type="number"
                    id="zoom"
                    name="zoom"
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                />
            </div>
            <div className='form-line'>
                <label htmlFor="lat" className='form-text'>Latitude</label>
                <input
                    type="number"
                    id="lat"
                    name="lat"
                    value={center.lat}
                    onChange={(event) =>
                        setCenter({ ...center, lat: Number(event.target.value) })
                    }
                />
            </div>
            <div className='form-line'>
                <label htmlFor="lng" className='form-text'>Longitude</label>
                <input
                    type="number"
                    id="lng"
                    name="lng"
                    value={center.lng}
                    onChange={(event) =>
                        setCenter({ ...center, lng: Number(event.target.value) })
                    }
                />
            </div>
            <div className='form-search'>
                <input
                    type="string"
                    id="search"
                    name="search"
                    ref={searchInput}
                    placeholder="Enter Address"
                    style={{
                        width:'100%'
                    }}
                />
            </div>
            <h3>{userMarkers.length === 0 ? "Click on map to add markers" : "Your Markers"}</h3>
            {userMarkers.map((marker, i) => (
                <div key={i} onClick={() => { {mapRef.current?.panTo(marker.latLng)} }}>
                    {marker.data}
                </div>
            ))}
        </div>
    );
}