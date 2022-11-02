import React, { useEffect, useState, useRef, createElement } from "react";
import ReactDOMServer from 'react-dom/server';

interface InfoMarkerOptions extends google.maps.MarkerOptions {
    data?: string
}

const Marker: React.FC<InfoMarkerOptions> = (options) => {
    const [marker, setMarker] = useState<google.maps.Marker>();
  
    useEffect(() => {
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

    let content = options.data;
    if (!options.data) {
        content = 'Text:  <input type="text" id="textInput" size="31" maxlength="31" tabindex="1"/>' + '<input type="button" id="inputButton" value="Submit">';
    }
    const infowindow = new google.maps.InfoWindow({
        content: content
    });

    useEffect(() => {
        if (marker) {
            ['click', 'idle'].forEach((eventName) =>
                google.maps.event.clearListeners(marker, eventName)
            );
            marker.addListener('click', () => {
                infowindow.open({
                    anchor: marker,
                    map: options.map,
                    shouldFocus: false
                });
            });
        }
    })
  
    useEffect(() => {
        if (marker) {
            marker.setOptions(options);
        }
    }, [marker, options]);

    return null;
};

export default Marker;