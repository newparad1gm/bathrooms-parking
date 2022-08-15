import React from 'react';
import './App.css';
import { GoogleMap, InfoWindow, Marker, MarkerF } from '@react-google-maps/api';
import { Data } from './Data';

let newMarker: google.maps.Marker | undefined = undefined;
const data = new Data();

function Map() {
    const [activeMarker, setActiveMarker] = React.useState(null);
    const [clicks, setClicks] = React.useState<google.maps.LatLng[]>([]);
    const [zoom, setZoom] = React.useState(10); // initial zoom
    const [center, setCenter] = React.useState<google.maps.LatLngLiteral>({
        lat: 40.7128,
        lng: -74.0060
    });

    const handleActiveMarker = (marker: any) => {
        if (marker === activeMarker) {
            return;
        }
        setActiveMarker(marker);
    };

    const onClick = (e: google.maps.MapMouseEvent) => {
        setActiveMarker(null);
        setClicks([...clicks, e.latLng!]);
    };

    const onAdd = (marker: google.maps.Marker) => {
        newMarker && newMarker.setMap(null);
        newMarker = marker;
    }

    return (
        <GoogleMap
            onClick={onClick}
            mapContainerStyle={{ width: "100vw", height: "100vh" }}
            center={center}
            zoom={zoom}
        >
            {data.markers.map(({ 
                id, latLng, info 
            }) => (
                <MarkerF
                    key={id}
                    position={latLng}
                    onClick={() => handleActiveMarker(id)}
                >
                    {activeMarker === id ? (
                        <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                        <div>{info}</div>
                        </InfoWindow>
                    ) : null}
                </MarkerF>
            ))}
            {clicks.map((latLng, i) => (
                <MarkerF onLoad={onAdd} key={i} position={latLng} />
            ))}
        </GoogleMap>
    );
}

export default Map;
