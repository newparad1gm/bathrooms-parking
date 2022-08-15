import { useLoadScript } from '@react-google-maps/api';
import Map from './Map';

function App() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!
  });

  return isLoaded ? <Map /> : null;
}

export default App;
