import React, { useEffect, useState, useRef } from "react";
import * as ReactDOMServer from "react-dom/server";
import { User } from "firebase/auth";
import { Data, InfoMarker } from "./Data";

interface InfoMarkerOptions extends google.maps.MarkerOptions {
    infoMarker: InfoMarker;
    data: Data;
    user: User;
    isUsers?: boolean;
    setUserMarkers?: React.Dispatch<React.SetStateAction<InfoMarker[]>>
}

const MarkerContent = (markerId: string, username: string, content?: string, ) => {
    return (
        <div>
            <div id={markerId}>
                {content}
            </div><br/>
            Written By: {username}
        </div>
    );
}

const UserMarkerContent = (markerId: string, content?: string) => {
    return (
        <div>
            <textarea id={`textInput${markerId}`} defaultValue={content}></textarea><br/>
            <input type="button" id={`saveButton${markerId}`} value="Save"/> <input type="button" id={`deleteButton${markerId}`} value="Delete"/>
        </div>
    );
}

const Marker: React.FC<InfoMarkerOptions> = (options: InfoMarkerOptions) => {
    const {infoMarker, data, user, isUsers, setUserMarkers} = options;
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

    const infowindow = new google.maps.InfoWindow({
        content: ReactDOMServer.renderToString(isUsers ? 
            UserMarkerContent(infoMarker.id, infoMarker.data) : 
            MarkerContent(infoMarker.id, infoMarker.username, infoMarker.data))
    });

    const saveMarker = async (textInput: HTMLInputElement) => {
        try {
            const oldId = infoMarker.id;
            infoMarker.data = textInput.value;
            let markerId = await data.saveMarker(infoMarker, textInput.value, user);
            if (markerId) {
                infoMarker.id = markerId;
                infoMarker.data = textInput.value;
                infowindow.setContent(ReactDOMServer.renderToString(UserMarkerContent(infoMarker.id, infoMarker.data)));
                if (setUserMarkers) {
                    setUserMarkers(userMarkers => {
                        const newMarkers = userMarkers.map(um => {
                            if (um.id == oldId) {
                                um.id = infoMarker.id;
                                um.data = infoMarker.data;
                            }
                            return um;
                        });
                        return newMarkers;
                    });
                }
            } else {
                throw new Error(`Marker ID ${oldId} not saved`);
            }
        } catch (e) {
            textInput.value = 'Could not save marker';
            console.error(e);
        }
    }

    const deleteMarker = async () => {
        try {
            await data.deleteMarker(infoMarker, user);
            if (setUserMarkers) {
                setUserMarkers(userMarkers => {
                    const newMarkers = userMarkers.filter(um => {
                        return um.id !== infoMarker.id
                    });
                    return newMarkers;
                });
            }
        } catch (e) {
            console.error(`Could not delete marker ${infoMarker.id}`);
            console.error(e);
        }
    }

    useEffect(() => {
        if (marker) {
            ['click', 'idle'].forEach((eventName) =>
                google.maps.event.clearListeners(marker, eventName)
            );
            marker.addListener('click', () => {
                infowindow.open({
                    anchor: marker,
                    shouldFocus: false
                });
                google.maps.event.addListener(infowindow, 'domready', function () {
                    let saveButton = document.getElementById(`saveButton${infoMarker.id}`);
                    if (saveButton && isUsers) {
                        saveButton.onclick = async () => {
                            return saveMarker(document.getElementById(`textInput${infoMarker.id}`) as HTMLInputElement)
                        }
                    }
                    let deleteButton = document.getElementById(`deleteButton${infoMarker.id}`);
                    if (deleteButton && isUsers) {
                        deleteButton.onclick = async () => {
                            return deleteMarker();
                        }
                    }
                });
            });
        }
    });
  
    useEffect(() => {
        if (marker) {
            marker.setOptions(options);
        }
    }, [marker, options]);

    return null;
};

export default Marker;