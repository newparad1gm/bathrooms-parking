import React, { useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import Map from './Map';
import { Data } from './Data';

const markerData = new Data();

function App() {
  const [data, updateData] = React.useState<any[]>();
  useEffect(() => {
    const getData = async () => {
      const markers = await markerData.getMarkers();
      updateData(markers);
    }
    getData();
  }, []);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!
  });

  return isLoaded ? <Map data={data} /> : null;
}

export default App;
