import React, { useEffect, useRef, useState } from 'react';
import '../css/form.css';

interface SearchBoxProps {
    mapRef: React.MutableRefObject<google.maps.Map | undefined>;
}

export const SearchBox = (props: SearchBoxProps): JSX.Element => {
    const {mapRef} = props;
    const searchInput = useRef<HTMLInputElement>(null);
    const [searchbox, setSearchbox] = useState<google.maps.places.SearchBox>();
    let searchMarkers: google.maps.Marker[] = [];

    useEffect(() => {
        if (searchInput.current) {
            if (!searchbox) {
                const newSearchbox = new google.maps.places.SearchBox(searchInput.current);
                if (mapRef.current) {
                    const map = mapRef.current;
                    map.addListener("bounds_changed", () => {
                        newSearchbox.setBounds(map.getBounds() as google.maps.LatLngBounds);
                    });
                }
                setSearchbox(newSearchbox);
            }
        }
    }, [searchInput, searchbox, mapRef]);

    useEffect(() => {
        if (searchbox && mapRef.current) {
            const map = mapRef.current;
            searchbox.addListener("places_changed", () => {
                const places = searchbox.getPlaces();
                if (!places || places.length === 0) {
                    return;
                }

                for (let searchMarker of searchMarkers) {
                    searchMarker.setMap(null);
                }
                searchMarkers = [];

                const bounds = new google.maps.LatLngBounds();
                for (let place of places) {
                    if (!place.geometry || !place.geometry.location) {
                        console.log(`${place.name} has no geometry`);
                        continue;
                    }

                    const icon = {
                        url: place.icon as string,
                        size: new google.maps.Size(71,71),
                        origin: new google.maps.Point(0, 0),
                        anchor: new google.maps.Point(17, 34),
                        scaledSize: new google.maps.Size(25, 25),
                    }

                    searchMarkers.push(
                        new google.maps.Marker({
                            map,
                            icon,
                            title: place.name,
                            position: place.geometry.location
                        })
                    );

                    if (place.geometry.viewport) {
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                }
                map.fitBounds(bounds);
            });
        }
    }, [searchbox, mapRef]);

    return (
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
    )
}