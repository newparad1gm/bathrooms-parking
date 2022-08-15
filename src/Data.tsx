class Data {
    markers: InfoMarker[];

    constructor() {
        this.markers = [];
        let test = new InfoMarker();
        test.id = 1;
        test.latLng = {
            lat: 40.7128,
            lng: -74.0060
        };
        test.info = `<b>Test</b><br/>This is just a test`;
        this.markers.push(test);
        let test2 = new InfoMarker();
        test2.id = 2;
        test2.latLng = {
            lat: 41,
            lng: -74.010
        };
        test2.info = `<b>Test2</b><br/>This is just a test`;
        this.markers.push(test2);
    }

    getInfo(): string {
        return `<b>Test</b><br/>
                This is just a test`;
    }
}

class InfoMarker {
    id: number;

    latLng: google.maps.LatLngLiteral;

    info: string;
}

export { Data, InfoMarker }