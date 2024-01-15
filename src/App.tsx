import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import LocMarker from './assets/locmarker.svg';
import L, { LocationEvent } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent: React.FC = () => {
  const myIcon = L.icon({
    iconUrl: LocMarker,
    iconSize: [45, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
  });

  const center = [35.700444, 51.336264];
  const markerRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const [finalMarkers, setFinalMarkers] = useState<
    { lat: string; lng: string }[]
  >([]);
  const [userLocation, setUserLocation] = useState<{
    lat: string;
    lng: string;
  } | null>(null);

  useEffect(() => {
    if (finalMarkers.length >= 2) {
      const bounds: [lat: string, lng: string][] = [];
      finalMarkers.map((marker) => {
        bounds.push([marker.lat, marker.lng]);
      });
      mapRef.current.flyToBounds(bounds);
    }
  }, [finalMarkers]);

  const handleDoneClick = () => {
    const newMarker: { lat: string; lng: string } =
      markerRef.current.getLatLng();
    setFinalMarkers((prevState) => [
      ...prevState,
      { lat: newMarker.lat, lng: newMarker.lng },
    ]);
    mapRef.current.flyTo(
      { lat: newMarker.lat + -0.0002, lng: newMarker.lng },
      18,
    );
  };

  const handleDoneCancelClick = () => {
    const newValue = finalMarkers.pop();
    const newValueLat = newValue?.lat;
    mapRef.current.flyTo(newValue, 17);
    const newArray = finalMarkers.filter((value) => value.lat !== newValueLat);
    setFinalMarkers(newArray);
  };

  const handleLocate = () => {
    if (userLocation !== null) {
      mapRef.current.flyTo(userLocation, 16);
    }
    mapRef.current.locate();
  };

  console.log(finalMarkers);

  const CenterMarker: React.FC = () => {
    const map = useMap();

    useEffect(() => {
      const updateMarkerPosition = () => {
        if (markerRef.current) {
          const center = map.getCenter();
          markerRef.current.setLatLng(center);
        }
      };

      const onLocationFound = (e: LocationEvent) => {
        setUserLocation(e.latlng as any);
        console.log('location updated');
        map.flyTo(e.latlng, 16);
      };

      map.on('move', updateMarkerPosition);
      map.on('locationfound', onLocationFound);
      map.on('locationerror', () => {
        console.error('can not locate the user!');
      });

      return () => {
        map.off('move', updateMarkerPosition);
        map.off('locationfound', onLocationFound);
        map.off('locationerror', () => {
          console.error('can not locate the user!');
        });
      };
    }, [map]);

    return <Marker position={map.getCenter()} ref={markerRef} icon={myIcon} />;
  };

  return (
    <MapContainer
      ref={mapRef}
      center={center as any}
      zoom={17}
      style={{ height: '90vh' }}
    >
      <TileLayer
        detectRetina
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {finalMarkers.length < 2 && <CenterMarker />}
      {finalMarkers.map((marker, index) => (
        <Marker key={index} position={marker as any} icon={myIcon} />
      ))}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          width: '100%',
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
        }}
      >
        <button
          onClick={handleDoneClick}
          style={{
            padding: '10px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 999,
          }}
        >
          Done
        </button>
        <button
          onClick={handleDoneCancelClick}
          style={{
            padding: '10px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 999,
          }}
        >
          Clear
        </button>
        <button
          onClick={handleLocate}
          style={{
            padding: '10px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 999,
          }}
        >
          Locate me
        </button>
      </div>
    </MapContainer>
  );
};

export default MapComponent;
