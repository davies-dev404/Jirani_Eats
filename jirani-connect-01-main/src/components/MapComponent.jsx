import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const defaultCenter = [-1.2921, 36.8219]; // Nairobi Default

const MapComponent = ({ foods }) => {
  const [position, setPosition] = React.useState(defaultCenter);

  const handleLocateMe = React.useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition([pos.coords.latitude, pos.coords.longitude]);
        },
        () => console.warn("Could not get your location.")
      );
    }
  }, []);

  React.useEffect(() => {
    handleLocateMe();
  }, [handleLocateMe]);

  const Recenter = ({ lat, lng }) => {
    const map = useMap();
    React.useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);
    return null;
  };

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-md border border-gray-200 relative group">
      <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={false} className="h-full w-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Recenter lat={position[0]} lng={position[1]} />
        
        {/* User Location Marker (if different from default) */}
        {position[0] !== defaultCenter[0] && (
            <Marker position={position} icon={DefaultIcon}>
                <Popup>You are here</Popup>
            </Marker>
        )}

        {foods.map((food) => (
          food.pickupLocation?.coordinates?.lat && (
            <Marker 
              key={food._id} 
              position={[food.pickupLocation.coordinates.lat, food.pickupLocation.coordinates.lng]}
            >
              <Popup>
                <div className="p-2 min-w-[150px]">
                  <h3 className="font-bold text-gray-900">{food.title}</h3>
                  <p className="text-xs text-gray-600 mb-2 truncate">{food.pickupLocation.address}</p>
                  <a href={`/dashboard/receiver/request/${food._id}`} className="block w-full text-center bg-green-600 text-white text-xs font-bold py-1.5 rounded hover:bg-green-700 transition-colors">
                      Request
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
      
      {/* Floating Locate Button */}
      <button 
        onClick={handleLocateMe}
        className="absolute bottom-4 right-4 z-[400] bg-white text-gray-700 p-2 rounded-lg shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-200 transition-all active:scale-95 flex items-center gap-2 font-medium text-xs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
        Locate Me
      </button>
    </div>
  );
};

export default MapComponent;
