// Using icons from https://sites.google.com/site/gmapsdevelopment/

export class Icons {
    private _imageUrls: string[];
    get imageUrls(): string[] {
        if (!this._imageUrls) {
            let urls: string[] = [];
            for (let site=2; site<6; site++) {
                const url = `http://maps.google.com/mapfiles/kml/pal${site}`;
                for (let i=0; i<64; i++) {
                    urls.push(`${url}/icon${i}.png`);
                }
            }
            this._imageUrls = urls;;
        }
        return this._imageUrls;
    }
}