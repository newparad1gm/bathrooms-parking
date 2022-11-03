
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, addDoc, query, orderBy, startAt, endAt, getDocs } from 'firebase/firestore';
import * as geofire from 'geofire-common';

class Data {
    app: FirebaseApp;
    db: Firestore;

    constructor() {
        this.app = initializeApp({
            apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
            authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
            storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.REACT_APP_FIREBASE_APP_ID,
            measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
        });          
        this.db = getFirestore(this.app);
    }

    async addMarker(lat: number, lng: number, data: string) {
        return addDoc(collection(this.db, 'markers'), {
			geohash: geofire.geohashForLocation([lat, lng]),
            lat: lat,
            lng: lng,
            data: data
        });
    }

    async getMarkers(center: [number, number], radius: number): Promise<InfoMarker[]> {
        const bounds = geofire.geohashQueryBounds(center, radius);
        const promises = [];
        for (const b of bounds) {
            const q = query(collection(this.db, 'markers'),
                orderBy('geohash'), 
                startAt(b[0]), 
                endAt(b[1])
            );
          
            promises.push(getDocs(q));
        }
        
        let snapshots = await Promise.all(promises);
        const markers: InfoMarker[] = [];
        for (const snap of snapshots) {
            for (const doc of snap.docs) {
                const [id, lat, lng, data, geohash] = [doc.id, doc.get('lat'), doc.get('lng'), doc.get('data'), doc.get('geohash')];
          
                // We have to filter out a few false positives due to GeoHash
                // accuracy, but most will match
                const distanceInKm = geofire.distanceBetween([lat, lng], center);
                const distanceInM = distanceInKm * 1000;
                const newMarker = new InfoMarker(id, lat, lng, geohash, data);
                if (distanceInM <= radius) {
                    markers.push(newMarker);
                }
            }
        }
        return markers;
    }
}

class InfoMarker {
    constructor(id: string, lat: number, lng: number, geohash: string, data?: string) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        this.geohash = geohash;
        this.data = data;
    }

    id: string;

    get latLng(): google.maps.LatLngLiteral {
        return {
            lat: this.lat,
            lng: this.lng
        }
    }

    lat: number;
    lng: number;

    data: string | undefined;

    geohash: string;
}

export { Data, InfoMarker }