import * as React from "react";
import { InfoMarker } from './Data';

interface InfoMarkerOptions extends google.maps.MarkerOptions {
    data: string
}

const Marker: React.FC<InfoMarkerOptions> = (options) => {
    const [marker, setMarker] = React.useState<google.maps.Marker>();
  
    React.useEffect(() => {
        if (!marker) {
            setMarker(new google.maps.Marker());
        }
    
        // remove marker from map on unmount
        return () => {
            if (marker) {
                marker.setMap(null);
            }
        };
    }, [marker]);

    const infowindow = new google.maps.InfoWindow({
        content: options.data
    });

    React.useEffect(() => {
        if (marker) {
            ['click', 'idle'].forEach((eventName) =>
                google.maps.event.clearListeners(marker, eventName)
            );
            marker.addListener('click', () => {
                infowindow.open({
                    anchor: marker,
                    map: options.map,
                    shouldFocus: false
                })
            });
        }
    })
  
    React.useEffect(() => {
        if (marker) {
            marker.setOptions(options);
        }
    }, [marker, options]);

    
  
    return null;
};

export default Marker;