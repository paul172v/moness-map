import React, { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvent,
} from "react-leaflet";
import { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import "./leaflet.css";
import "leaflet-rotatedmarker";
import "./Map.module.scss";
import classes from "./Map.module.scss";
import {
  miscList,
  cottageList as workingCottageList,
} from "../../dev/nav-list";

// Blue dot icon
const blueDotIcon = L.icon({
  iconUrl: "/blue-dot.svg",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Arrow icon for heading
const arrowIcon = L.icon({
  iconUrl: "/arrow-icon.svg",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Component to log clicks
const ClickLogger = () => {
  useMapEvent("click", (e) => {
    console.log("Map clicked at:", {
      latitude: e.latlng.lat,
      longitude: e.latlng.lng,
    });
  });
  return null;
};

const Map = () => {
  const initialPosition: [number, number] = [
    56.61594463631259, -3.8622468709945683,
  ];

  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null
  );
  const [heading, setHeading] = useState<number | null>(null);

  // Use a ref for the map instance
  const mapRef = useRef<LeafletMap | null>(null);

  // Search input
  const [searchInput, setSearchInput] = useState<string>("");

  // Search result message
  const [searchResultMessage, setSearchResultMessage] = useState("");

  // Cottages list state
  const [cottages, setCottages] = useState(workingCottageList);

  // Continuously track user position
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserPosition([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.error("Error getting user location:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, []);

  // Listen for device orientation
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setHeading(event.alpha);
      }
    };

    window.addEventListener(
      "deviceorientationabsolute",
      handleOrientation,
      true
    );

    return () => {
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation
      );
    };
  }, []);

  const handleLocate = () => {
    if (userPosition && mapRef.current) {
      mapRef.current.setView(userPosition, 15, { animate: true });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchInput.trim().toUpperCase();
    let found = false;

    const updated = cottages.map((cottage) => {
      if (
        cottage.number.toString() === query ||
        cottage.name.toUpperCase() === query
      ) {
        found = true;
        setSearchResultMessage(`Cottage ${cottage.number} - ${cottage.name}`);
        return { ...cottage, isActive: true };
      }
      return { ...cottage, isActive: false };
    });

    if (!found) {
      setSearchResultMessage("No matching cottage found.");
    }

    setCottages(updated);

    const active = updated.find((c) => c.isActive);
    if (active && mapRef.current) {
      mapRef.current.setView([active.lat, active.lng], 17, { animate: true });
    }
  };

  return (
    <>
      <header className={classes.header}>
        <img
          className={classes.logo}
          src="/moness-logo.jpg"
          alt="moness logo"
        />
        <div className={classes["form-container"]}>
          <form
            onSubmit={handleSearch}
            style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
          >
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cottage name or number"
              style={{ padding: "0.4rem", flex: "1" }}
            />
            <button type="submit" style={{ padding: "0.4rem 1rem" }}>
              Find
            </button>
          </form>
          <p className={classes["search-result-message"]}>
            {searchResultMessage}
          </p>
        </div>
      </header>

      <div className="map-container" style={{ position: "relative" }}>
        <MapContainer
          className={classes.map}
          center={initialPosition}
          zoom={20}
          scrollWheelZoom={true}
          ref={mapRef}
          style={{ height: "90svh", width: "100vw" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          />

          {/* Misc markers */}
          {miscList.map((item) => (
            <Marker position={[item.lat, item.lng]} icon={item.icon}>
              <Popup>{item.name}</Popup>
            </Marker>
          ))}

          {/* User position */}
          {userPosition && (
            <>
              <Marker position={userPosition} icon={blueDotIcon}>
                <Popup>You are here!</Popup>
              </Marker>

              {heading !== null && (
                <Marker
                  {...({
                    position: userPosition,
                    icon: arrowIcon,
                    rotationAngle: heading,
                    rotationOrigin: "center",
                  } as any)}
                />
              )}
            </>
          )}

          {/* Active cottage marker(s) */}
          {cottages
            .filter((c) => c.isActive)
            .map((c) => (
              <Marker key={c.number} position={[c.lat, c.lng]} icon={c.icon}>
                <Popup>{`Cottage ${c.number} - ${c.name}`}</Popup>
              </Marker>
            ))}

          <ClickLogger />
        </MapContainer>

        {/* Locate Me Button */}
        {/* <button
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1000,
            background: "#fff",
            border: "1px solid #ccc",
            padding: "6px 10px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={handleLocate}
        >
          Locate Me
        </button> */}
      </div>
    </>
  );
};

export default Map;
