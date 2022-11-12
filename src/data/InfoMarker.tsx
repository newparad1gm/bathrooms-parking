export class InfoMarker {
    constructor(id: string, lat: number, lng: number, geohash: string, userid: string, username: string, data?: string, formattedaddress?: string) {
        this.id = id;
        this.lat = lat;
        this.lng = lng;
        this.geohash = geohash;
        this.data = data;
        this.userid = userid;
        this.username = username;
        this.formattedaddress = formattedaddress;
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

    userid: string;
    username: string;

    formattedaddress?: string
}