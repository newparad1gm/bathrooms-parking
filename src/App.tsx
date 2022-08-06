import React from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';
import './App.css';
import { createCustomEqual, TypeEqualityComparator, deepEqual } from "fast-equals";
import { isLatLngLiteral } from "@googlemaps/typescript-guards";
import { Data } from './Data';

function App() {
  const [clicks, setClicks] = React.useState<google.maps.LatLng[]>([]);
  const [zoom, setZoom] = React.useState(10); // initial zoom
  const [center, setCenter] = React.useState<google.maps.LatLngLiteral>({
    lat: 40.7128,
    lng: -74.0060
  });

  const onClick = (e: google.maps.MapMouseEvent) => {
    setClicks([...clicks, e.latLng!]);
  };

  const onIdle = (m: google.maps.Map) => {
    console.log("onIdle");
    setZoom(m.getZoom()!);
    setCenter(m.getCenter()!.toJSON());
  };

  const data = new Data();

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Wrapper apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY!} render={render}>
        <Map
          center={center}
          onClick={onClick}
          onIdle={onIdle}
          zoom={zoom}
          style={{ position: "relative", display: "block", height: "100%", width: "100%" }}
        >
        {data.markers != null &&
          data.markers.map(marker => (
            <Marker
                key={marker.id}
                position={marker.latLng}
            />
        ))}
        {clicks.map((latLng, i) => (
          <Marker key={i} position={latLng} />
        ))}
        </Map>
      </Wrapper>
    </div>
  );
}

const render = (status: Status) => {
  return <h1>{status}</h1>;
};

interface MapProperties extends google.maps.MapOptions {
  style: { [key: string]: string };
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
}

const Map: React.FC<MapProperties> = ({
  onClick,
  onIdle,
  children,
  style,
  ...options
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = React.useState<google.maps.Map>();

  React.useEffect(() => {
    if (ref.current && !map) {
      setMap(new window.google.maps.Map(ref.current, {}));
    }
  }, [ref, map]);

  useDeepCompareEffectForMaps(() => {
    if (map) {
      map.setOptions(options);
    }
  }, [map, options]);

  React.useEffect(() => {
    if (map) {
      ["click", "idle"].forEach((eventName) =>
        google.maps.event.clearListeners(map, eventName)
      );

      if (onClick) {
        map.addListener("click", onClick);
      }

      if (onIdle) {
        map.addListener("idle", () => onIdle(map));
      }
    }
  }, [map, onClick, onIdle]);

  return (
    <>
      <div ref={ref} style={style} />
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { map });
        }
      })}
    </>
  )
}

const areMapsEqual: TypeEqualityComparator<any, undefined> = (
  a,
  b,
) => {
  if (
    isLatLngLiteral(a) ||
    a instanceof google.maps.LatLng ||
    isLatLngLiteral(b) ||
    b instanceof google.maps.LatLng
  ) {
    return new google.maps.LatLng(a).equals(new google.maps.LatLng(b));
  }
  return deepEqual(a, b);
};

const deepCompareEqualsForMaps = createCustomEqual((deepEqual) => ({
  areMapsEqual,
}));

function useDeepCompareMemoize(value: any) {
  const ref = React.useRef();

  if (!deepCompareEqualsForMaps(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}

function useDeepCompareEffectForMaps(
  callback: React.EffectCallback,
  dependencies: any[]
) {
  React.useEffect(callback, dependencies.map(useDeepCompareMemoize));
}

const Marker: React.FC<google.maps.MarkerOptions> = (options) => {
  let [marker, setMarker] = React.useState<google.maps.Marker>();

  React.useEffect(() => {
    if (!marker) {
      marker = new google.maps.Marker();
      marker.addListener("click", () => { alert('test') });
      setMarker(marker);
    }

    if (marker) {
      marker.setOptions(options);
    }

    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker, options]);

  return null;
}

export default App;
