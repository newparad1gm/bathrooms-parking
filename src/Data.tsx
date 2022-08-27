class Data {
    constructor() {}

    async getMarkers(): Promise<any> {
        let res = await fetch(`http://localhost:8080/markers`, {
            method: 'GET'
        })
        let json = await res.json();
        return json.map((obj: any) => new InfoMarker(obj));
    }
}

class InfoMarker {
    constructor(json: any) {
        this.id = json.id;
        this.lat = json.lat;
        this.lng = json.lng;
        this.data = json.data;
    }

    id: number;

    get latLng(): google.maps.LatLngLiteral {
        return {
            lat: this.lat,
            lng: this.lng
        }
    }

    lat: number;

    lng: number;

    data: string;
}

export { Data, InfoMarker }