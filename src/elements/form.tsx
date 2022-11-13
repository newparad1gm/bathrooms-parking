import React, { useEffect, useState } from 'react';
import { SearchBox } from './search-box';
import { InfoMarker } from '../data/InfoMarker';
import { MarkerEntry } from './marker-entry';
import '../css/form.css';

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
    const [geocoder, setGeocoder] = useState<google.maps.Geocoder>();
    
    useEffect(() => {
        if (!geocoder) {
            setGeocoder(new google.maps.Geocoder());
        }
    }, [geocoder]);

    return (
        <div className='form'>
        <div className='form-line'><label>Zoom to at least level 13 to view other markers</label></div>
            <div className='form-line'>
                <label htmlFor="zoom" className='form-text'>Zoom:</label>
                <input
                    type="number"
                    id="zoom"
                    name="zoom"
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                />
            </div>
            <div className='form-line'>
                <label htmlFor="lat" className='form-text'>Latitude:</label>
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
                <label htmlFor="lng" className='form-text'>Longitude:</label>
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
            <div className='form-line'><label>Hold Shift and move mouse to rotate and tilt</label></div>
            <SearchBox mapRef={mapRef}></SearchBox>
            <h3>{userMarkers.length === 0 ? "Click on map to add markers" : "Your Markers"}</h3>
            {userMarkers.map((marker, i) => (
                <div key={i}>
                    <MarkerEntry marker={marker} mapRef={mapRef} geocoder={geocoder}></MarkerEntry>
                </div>
            ))}
        </div>
    );
}