import React, { useState, useEffect, useRef } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import Map from './Map';
import Marker from './Marker';
import { InfoMarker, Data } from './Data';
import * as geofire from 'geofire-common';
import { Form } from './Form';
import { getAuth, signInWithRedirect, GoogleAuthProvider, getRedirectResult, User, setPersistence, browserLocalPersistence } from "firebase/auth";

const data = new Data();
const provider = new GoogleAuthProvider();
const auth = getAuth();

const App: React.FC = () => {
	const mapRef = useRef<google.maps.Map>();
	const [zoom, setZoom] = useState(14); // initial zoom
	const [center, setCenter] = useState<google.maps.LatLngLiteral>({
		lat: 40.7128,
		lng: -74.0060
	});
	const [markers, setMarkers] = useState<InfoMarker[]>([]);
	const [userMarkers, setUserMarkers] = useState<InfoMarker[]>([]);
	const [user, setUser] = useState<User>();

	const onClick = async (e: google.maps.MapMouseEvent) => {
		const [lat, lng] = [e.latLng?.lat()!, e.latLng?.lng()!];
		let geohash = geofire.geohashForLocation([lat, lng]);
		setUserMarkers([...userMarkers, new InfoMarker((-(userMarkers.length+1)).toString(), lat, lng, geohash, user?.uid!, user?.displayName!)]);
	};

	useEffect(() => {
		const setLogin = async () => {
			let signIn = await getRedirectResult(auth);
			if (signIn) {
				const user = signIn.user;
				const credential = GoogleAuthProvider.credentialFromResult(signIn)
				localStorage.setItem('user', JSON.stringify(user));
				localStorage.setItem('token', credential?.idToken!);
				setUser(user);
				setUserMarkers(await data.getMarkersForUser(user))
			} else {
				await setPersistence(auth, browserLocalPersistence);
				return signInWithRedirect(auth, provider);
			}
		}
		setLogin()
			.catch(console.error);
	}, []);

	const onIdle = async (m: google.maps.Map) => {
		let zoom = m.getZoom()!;
		setZoom(zoom);
		setCenter(m.getCenter()!.toJSON());
		if (user) {
			let markers = await data.getMarkers([center.lat, center.lng], 5000, user);
			setMarkers(markers);
		}
	};

	return (
		user ? 
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
					userMarkers.map((nm) => (
						<Marker key={nm.id} position={nm.latLng} infoMarker={nm} data={data} user={user} isUsers={true} setUserMarkers={setUserMarkers}/>
					))
				}
				{ 
					markers.map((m) => (
						<Marker key={m.id} position={m.latLng} infoMarker={m} data={data} user={user}/>
					))
				}
				</Map>
				<Form
					zoom={zoom}
					setZoom={setZoom}
					center={center}
					setCenter={setCenter}
					userMarkers={userMarkers}
					mapRef={mapRef}
				/>
			</Wrapper>
		</div> :
		<div>
			<h1>Please Log In</h1>
		</div>
	);
}

const render = (status: Status) => {
	return <h1>{status}</h1>;
};

export default App;
