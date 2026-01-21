import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../css/MapView.css";
import type { Restaurant } from "./RestaurantCard";

// Fix za default ikone u Leafletu (potrebno jer Webpack/Vite ne učitava ikone automatski)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
   iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
   iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
   shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapViewProps {
   restaurants: Restaurant[];
   hoveredRestaurant?: number | null;
   onMarkerClick?: (restaurant: Restaurant) => void;
   onMarkerHover?: (restaurantId: number | null) => void;
}

// Komponenta za centriranje i zoom na restorane
function MapUpdater({ restaurants }: { restaurants: Restaurant[] }) {
   const map = useMap();
   const prevRestaurantsRef = useRef<Restaurant[]>([]);

   useEffect(() => {
      if (restaurants.length === 0) return;

      // Filtriraj restorane koji imaju validne koordinate
      const restaurantsWithCoords = restaurants.filter(
         (r) => r.latitude != null && r.longitude != null
      );

      if (restaurantsWithCoords.length === 0) return;

      // Provjeri je li se lista restorana promijenila
      const hasChanged =
         prevRestaurantsRef.current.length !== restaurantsWithCoords.length ||
         prevRestaurantsRef.current.some((prev, i) => prev.id !== restaurantsWithCoords[i]?.id);

      if (hasChanged) {
         prevRestaurantsRef.current = restaurantsWithCoords;

         // Kreiraj bounds od svih restorana
         const bounds = L.latLngBounds(
            restaurantsWithCoords.map((r) => [r.latitude!, r.longitude!])
         );

         // Prilagodi mapu da prikaže sve restorane, ali ostani unutar Zagreba
         map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
   }, [restaurants, map]);

   return null;
}

const MapView: React.FC<MapViewProps> = ({
   restaurants,
   hoveredRestaurant,
   onMarkerClick,
   onMarkerHover
}) => {
   // Koordinate centra Zagreba
   const zagrebCenter: [number, number] = [45.8150, 15.9819];

   // Bounds za Zagreb (prilagođeno da pokriva grad)
   const zagrebBounds: L.LatLngBoundsExpression = [
      [45.7, 15.85],  // Southwest corner
      [45.88, 16.1]   // Northeast corner
   ];

   // Filtriraj restorane koji imaju koordinate
   const restaurantsWithLocation = restaurants.filter(
      (r) => r.latitude != null && r.longitude != null
   );

   // Kreiraj custom ikonu za hover stanje
   const createCustomIcon = (isHovered: boolean) => {
      return L.divIcon({
         className: 'custom-marker',
         html: `
        <div class="marker-pin ${isHovered ? 'marker-hovered' : ''}">
          <span class="marker-icon">📍</span>
        </div>
      `,
         iconSize: [40, 40],
         iconAnchor: [20, 40],
         popupAnchor: [0, -40]
      });
   };

   return (
      <div style={{ height: "100%", width: "100%", position: "relative" }}>
         <MapContainer
            center={zagrebCenter}
            zoom={13}
            minZoom={11}
            maxZoom={17}
            maxBounds={zagrebBounds}
            maxBoundsViscosity={0.7}
            style={{ height: "100%", width: "100%", borderRadius: "8px" }}
            scrollWheelZoom={true}
         >
            <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
               url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
               subdomains="abcd"
               maxZoom={19}
            />

            <MapUpdater restaurants={restaurants} />

            {restaurantsWithLocation.map((restaurant) => {
               const isHovered = hoveredRestaurant === restaurant.id;

               return (
                  <Marker
                     key={restaurant.id}
                     position={[restaurant.latitude!, restaurant.longitude!]}
                     icon={createCustomIcon(isHovered)}
                     eventHandlers={{
                        click: () => onMarkerClick?.(restaurant),
                        mouseover: () => onMarkerHover?.(restaurant.id),
                        mouseout: () => onMarkerHover?.(null),
                     }}
                  >
                     <Popup>
                        <div className="map-popup-content">
                           <h3 className="map-popup-title">
                              {restaurant.name}
                           </h3>

                           {restaurant.cuisine && (
                              <p className="map-popup-info">
                                 🍽️ {restaurant.cuisine}
                              </p>
                           )}

                           {restaurant.location && (
                              <p className="map-popup-info">
                                 📍 {restaurant.location}
                              </p>
                           )}

                           {restaurant.rating > 0 && (
                              <p className="map-popup-rating">
                                 ⭐ {typeof restaurant.rating === 'number' ? restaurant.rating.toFixed(1) : restaurant.rating}
                              </p>
                           )}

                           <button
                              onClick={() => onMarkerClick?.(restaurant)}
                              className="map-popup-button"
                           >
                              Vidi detalje
                           </button>
                        </div>
                     </Popup>
                  </Marker>
               );
            })}
         </MapContainer>
      </div>
   );
};

export default MapView;
