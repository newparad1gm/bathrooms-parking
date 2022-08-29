import React from 'react';
import './App.css';
import { createCustomEqual, TypeEqualityComparator, deepEqual } from 'fast-equals';
import { isLatLngLiteral } from '@googlemaps/typescript-guards';

interface MapProps extends google.maps.MapOptions {
    style: { [key: string]: string };
    onClick?: (e: google.maps.MapMouseEvent) => void;
    onIdle?: (map: google.maps.Map) => void;
    children?: React.ReactNode;
}
  
const Map: React.FC<MapProps> = ({
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
            ['click', 'idle'].forEach((eventName) =>
                google.maps.event.clearListeners(map, eventName)
            );
    
            if (onClick) {
                map.addListener('click', onClick);
            }
    
            if (onIdle) {
                map.addListener('idle', () => onIdle(map));
            }
        }
    }, [map, onClick, onIdle]);
  
    return (
        <>
            <div ref={ref} style={style} />
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    // set the map prop on the child component
                    return React.cloneElement(child, { map });
                }
            })}
        </>
    );
};
  
const areMapsEqual: TypeEqualityComparator<any, undefined> = (
    a,
    b,
) => {
    if (
    isLatLngLiteral(a) || a instanceof google.maps.LatLng ||
    isLatLngLiteral(b) || b instanceof google.maps.LatLng
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

export default Map;