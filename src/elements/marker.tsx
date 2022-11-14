import React, { useEffect, useRef, useState } from "react";
import { User } from "firebase/auth";
import { InfoMarker } from "../data/InfoMarker";
import { Data } from "../data/Data";
import { IconSelector } from './icon-selector';
import { createRoot } from "react-dom/client";

interface MarkerOptions extends google.maps.MarkerOptions {
    infoMarker: InfoMarker;
    data: Data;
    user: User;
    imageUrls?: string[];
    geocoder?: google.maps.Geocoder;
    isUsers?: boolean;
    setUserMarkers?: React.Dispatch<React.SetStateAction<InfoMarker[]>>
}

const MarkerContent = (markerId: string, username: string, content?: string): JSX.Element => {
    return (
        <div>
            <div id={markerId}>
                {content}
            </div><br/>
            Written By: {username}
        </div>
    );
}

const UserMarkerContent = (markerId: string, content?: string, imageUrls?: string[], saveClick?: (textInput: HTMLInputElement) => Promise<void>, deleteClick?: () => Promise<void>, iconClick?: (url: string | null) => void): JSX.Element => {
    return (
        <div>
            <textarea id={`textInput${markerId}`} defaultValue={content}></textarea><br/>
            <IconSelector imageUrls={imageUrls} onClick={iconClick}></IconSelector>
            <input type="button" id={`saveButton${markerId}`} value="Save" onClick={() => { return saveClick && saveClick(document.getElementById(`textInput${markerId}`) as HTMLInputElement); }}/> 
            <input type="button" id={`deleteButton${markerId}`} value="Delete" onClick={() => { return deleteClick && deleteClick(); }}/>
        </div>
    );
}

const Marker = (options: MarkerOptions) => {
    const {infoMarker, data, user, imageUrls, isUsers, setUserMarkers} = options;
    const [marker, setMarker] = useState<google.maps.Marker>();
    const infowindowDiv = document.createElement('div');
    const root = createRoot(infowindowDiv);
    const infowindow = useRef<google.maps.InfoWindow>();

    const selectIcon = (url: string | null) => {
        if (marker) {
            if (url) {
                marker.setIcon({
                    url: url
                });
                infoMarker.iconurl = url;
            }
            else {
                marker.setIcon();
                infoMarker.iconurl = undefined;
            }
        }
    }

    useEffect(() => {
        if (!marker) {
            const thisMarker = new google.maps.Marker({
                icon: infoMarker.iconurl
            });
            setMarker(thisMarker);
        }
    
        // remove marker from map on unmount
        return () => {
            if (marker) {
                marker.setMap(null);
            }
        };
    }, [marker, infoMarker.iconurl]);

    const saveMarker = async (textInput: HTMLInputElement) => {
        try {
            const oldId = infoMarker.id;
            infoMarker.data = textInput.value;
            let markerId = await data.saveMarker(infoMarker, textInput.value, user);
            if (markerId && infowindow.current) {
                infoMarker.id = markerId;
                infoMarker.data = textInput.value;
                root.render(UserMarkerContent(infoMarker.id, infoMarker.data, imageUrls, saveMarker, deleteMarker, selectIcon));
                infowindow.current.setContent(infowindowDiv);
                if (setUserMarkers) {
                    setUserMarkers(userMarkers => {
                        const newMarkers = userMarkers.map(um => {
                            if (um.id === oldId) {
                                um.id = infoMarker.id;
                                um.data = infoMarker.data;
                            }
                            return um;
                        });
                        return newMarkers;
                    });
                }
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
            // renders infowindow content with react root render
            root.render(isUsers ? 
                UserMarkerContent(infoMarker.id, infoMarker.data, imageUrls, saveMarker, deleteMarker, selectIcon) : 
                MarkerContent(infoMarker.id, infoMarker.username, infoMarker.data)
            );
            infowindow.current = new google.maps.InfoWindow({
                content: infowindowDiv
            });
        }
    }, [marker]);

    useEffect(() => {
        if (marker) {
            marker.setOptions(options);
            ['click', 'idle'].forEach((eventName) =>
                google.maps.event.clearListeners(marker, eventName)
            );
            marker.addListener('click', () => {
                if (infowindow.current) {
                    infowindow.current.open({
                        anchor: marker,
                        shouldFocus: false
                    });
                }
            });
        }
    }, [marker, options]);

    return null;
};

export default Marker;