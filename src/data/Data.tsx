
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, addDoc, query, orderBy, startAt, endAt, getDocs, where, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { User } from "firebase/auth";
import { InfoMarker } from './InfoMarker';
import * as geofire from 'geofire-common';

export class Data {
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

    verifyNewMarker(infoMarker: InfoMarker): boolean {
        const parseId = parseInt(infoMarker.id);
        return !isNaN(parseId) && parseId < 0;
    }

    async saveMarker(infoMarker: InfoMarker, data: string, user: User): Promise<string | undefined> {
        if (infoMarker.userid == user.uid) {
            const [lat, lng] = [infoMarker.lat, infoMarker.lng];
            if (this.verifyNewMarker(infoMarker)) {
                let doc = await addDoc(collection(this.db, 'markers'), {
                    geohash: geofire.geohashForLocation([lat, lng]),
                    lat: lat,
                    lng: lng,
                    data: data,
                    userid: user.uid,
                    username: user.displayName,
                    formattedaddress: infoMarker.formattedaddress
                });
                return doc.id;
            }
            await setDoc(doc(this.db, 'markers', infoMarker.id), {
                geohash: geofire.geohashForLocation([lat, lng]),
                lat: lat,
                lng: lng,
                data: data,
                userid: user.uid,
                username: user.displayName,
                formattedaddress: infoMarker.formattedaddress
            });
            return infoMarker.id;
        }
    }

    async getMarkersForUser(user: User): Promise<InfoMarker[]> {
        const snap = await getDocs(query(collection(this.db, 'markers'), where('userid', '==', user.uid)));
        return snap.docs.map(doc => new InfoMarker(
            doc.id, 
            doc.get('lat'), 
            doc.get('lng'), 
            doc.get('geohash'), 
            doc.get('userid'), 
            doc.get('username'),
            doc.get('data'), 
            doc.get('formattedaddress')
        ));
    }

    async getMarkers(center: [number, number], radius: number, user: User): Promise<InfoMarker[]> {
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
                const [id, lat, lng, data, geohash, userid, username, formattedaddress] = [
                    doc.id, 
                    doc.get('lat'), 
                    doc.get('lng'), 
                    doc.get('data'), 
                    doc.get('geohash'), 
                    doc.get('userid'), 
                    doc.get('username'),
                    doc.get('formattedaddress')
                ];
          
                // Filter out due to geohash accuracy and not the users markers
                const distanceInKm = geofire.distanceBetween([lat, lng], center);
                const distanceInM = distanceInKm * 1000;
                if (distanceInM <= radius && userid !== user.uid) {
                    markers.push(new InfoMarker(id, lat, lng, geohash, userid, username, data, formattedaddress));
                }
            }
        }
        return markers;
    }

    async deleteMarker(infoMarker: InfoMarker, user: User): Promise<void> {
        if (!this.verifyNewMarker(infoMarker)) {
            return deleteDoc(doc(this.db, 'markers', infoMarker.id));
        }
    }
}