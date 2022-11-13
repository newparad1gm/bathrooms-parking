import React, { useEffect, useState } from 'react';
import { InfoMarker } from '../data/InfoMarker';
import '../css/form.css';

interface MarkerEntryProps {
    marker: InfoMarker;
    mapRef: React.MutableRefObject<google.maps.Map | undefined>;
    geocoder?: google.maps.Geocoder;
}

export const MarkerEntry = (prop: MarkerEntryProps): JSX.Element => {
    const {marker, mapRef, geocoder} = prop;
    const [markerLocation, setMarkerLocation] = useState<string>();

    useEffect(() => {
        const setLocation = async () => {
            setMarkerLocation(`Latitude: ${marker.lat}, Longitude: ${marker.lng}`);
            if (!marker.formattedaddress) {
                if (geocoder) {
                    let response = await geocoder.geocode({ location: marker.latLng });
                    if (response && response.results[0]) {
                        marker.formattedaddress = response.results[0].formatted_address;
                    }
                }
            }
            setMarkerLocation(prevText => {
                return marker.formattedaddress || prevText
            });
        }

        setLocation();
    }, [markerLocation, geocoder, marker]);

    return (
        <div className='marker-entry' onClick={() => { {mapRef.current?.panTo(marker.latLng)} }}>
            <div>{markerLocation}</div>
            <div>{marker.data}</div>
        </div>
    );
}