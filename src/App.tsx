import React, { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import Map from './Map';
import Marker from './Marker';
import { InfoMarker, Data } from './Data';
import * as geofire from 'geofire-common';
import { Form } from './Form';

const data = new Data(process.env.REACT_APP_FIREBASE_PROJECT!);

const App: React.FC = () => {
	const mapRef = useRef<google.maps.Map>();
	const [zoom, setZoom] = useState(14); // initial zoom
	const [center, setCenter] = useState<google.maps.LatLngLiteral>({
		lat: 40.7128,
		lng: -74.0060
	});
	const [markers, setMarkers] = useState<InfoMarker[]>([]);
	const [newMarkers, setNewMarkers] = useState<InfoMarker[]>([]);

	const onClick = async (e: google.maps.MapMouseEvent) => {
	const [lat, lng] = [e.latLng?.lat()!, e.latLng?.lng()!];
	let geohash = geofire.geohashForLocation([lat, lng]);
		setNewMarkers([...newMarkers, new InfoMarker((-(newMarkers.length+1)).toString(), lat, lng, geohash)]);
		//return data.addMarker(e.latLng?.lat()!, e.latLng?.lng()!, 'Test');
	};

	const onIdle = async (m: google.maps.Map) => {
		let zoom = m.getZoom()!;
		setZoom(zoom);
		setCenter(m.getCenter()!.toJSON());
		let markers = await data.getMarkers([center.lat, center.lng], 5000);
		setMarkers(markers);
	};


	return (
		<div style={{ display: "flex", height: "100%" }}>
			<Wrapper apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY!} libraries={["places"]} render={render}>
				<Map
					center={center}
					mapRef={mapRef}
					onClick={onClick}
					onIdle={onIdle}
					zoom={zoom}
					style={{ flexGrow: "1", height: "100%" }}
				>
				{ 
					newMarkers.map(({ 
					id, latLng
					}) => (
					<Marker key={id} position={latLng}/>
					))
				}
				{ 
					markers.map(({ 
					id, latLng
					}) => (
					<Marker key={id} position={latLng} data={"Test"}/>
					))
				}
				</Map>
				<Form
					zoom={zoom}
					setZoom={setZoom}
					center={center}
					setCenter={setCenter}
					newMarkers={newMarkers}
					setNewMarkers={setNewMarkers}
					mapRef={mapRef}
				/>
			</Wrapper>
		</div>
	);
}

const render = (status: Status) => {
	return <h1>{status}</h1>;
};

export default App;
