import React, { useEffect, useState, useRef } from "react";
import { Data, InfoMarker } from "./Data";

interface InfoMarkerOptions extends google.maps.MarkerOptions {
    marker: InfoMarker;
    data: Data;
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

    let content = options.marker.data;
    if (!options.marker.data) {
        content = `Text: <input type="text" id="textInput${options.marker.id}" size="31" maxlength="31" tabindex="1"/> <input type="button" id="inputButton${options.marker.id}" value="Submit">`;
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
                google.maps.event.addListener(infowindow, 'domready', function () {
                    let button = document.getElementById(`inputButton${options.marker.id}`);
                    if (button) {
                        let textInput = document.getElementById(`textInput${options.marker.id}`) as HTMLInputElement;
                        button.onclick = async () => {
                            try {
                                await options.data.addMarker(options.marker.lat, options.marker.lng, textInput!.value);
                            } catch {
                                textInput.value = 'Error saving marker';
                                return;
                            }

                            infowindow.setContent(textInput.value);
                        }
                    }
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