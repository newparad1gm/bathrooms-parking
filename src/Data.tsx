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