
import firebase from 'firebase/app';
import 'firebase/firestore';
import * as geofire from 'geofire-common';

class Data {
    app: firebase.app.App;
    db: firebase.firestore.Firestore;

    constructor(projectId: string) {
        this.app = firebase.initializeApp({
            projectId: projectId
        });
        this.db = firebase.firestore(this.app);
    }

    async addMarker(lat: number, lng: number, data: string) {
        return this.db.collection('markers').add({
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
            const q = this.db.collection('markers')
                .orderBy('geohash')
                .startAt(b[0])
                .endAt(b[1]);
          
            promises.push(q.get());
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