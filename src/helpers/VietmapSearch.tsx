import { useEffect, useRef, useState, useCallback } from "react";
import { Input } from "antd";
import {
  SearchOutlined,
  CloseCircleFilled,
  EnvironmentOutlined,
} from "@ant-design/icons";
import "././style/VietmapSearch.css";

interface Suggestion {
  display?: string;
  name?: string;
  ref_id?: string;
  refid?: string;
  refId?: string;
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface PlaceDetail {
  lat: number;
  lng: number;
  display?: string;
  name?: string;
  address?: string;
}

interface VietmapSearchProps {
  onLocationSelect?: (location: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  initialLocation?: { lat: number; lng: number; address?: string };
}

export function VietmapSearch({
  onLocationSelect,
  initialLocation,
}: VietmapSearchProps = {}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const vietmapgl = useRef<any>(null);

  const [searchValue, setSearchValue] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const debounceTimeout = useRef<NodeJS.Timeout>(null);
  const placeCache = useRef<Map<string, PlaceDetail>>(new Map());

  // Reverse geocoding - tìm địa chỉ từ tọa độ
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Gọi API reverse geocoding qua backend
      const url = `/api/vietmap/reverse?lat=${lat}&lng=${lng}`;
      const res = await fetch(url);

      if (res.ok) {
        const data = await res.json();
        if (data.address) {
          setSearchValue(data.address);
          // Gọi callback nếu có để cập nhật địa chỉ
          if (onLocationSelect) {
            onLocationSelect({
              address: data.address,
              lat: lat,
              lng: lng,
            });
          }
        }
      }
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      // Fallback: hiển thị tọa độ
      setSearchValue(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  // Load Vietmap GL JS from CDN (like the working HTML example)
  useEffect(() => {
    const loadVietmapGL = () => {
      console.log("Starting to load Vietmap GL JS...");

      // Check if already loaded
      if (window.vietmapgl) {
        console.log("Vietmap GL JS already loaded");
        vietmapgl.current = window.vietmapgl;
        initializeMap();
        return;
      }

      // Load CSS from CDN
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href =
        "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.css";
      cssLink.onload = () => console.log("Vietmap CSS loaded");
      cssLink.onerror = () => console.error("Failed to load Vietmap CSS");
      document.head.appendChild(cssLink);

      // Load JS from CDN
      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.js";
      script.async = true;

      script.onload = () => {
        console.log("Vietmap GL JS loaded successfully");
        vietmapgl.current = window.vietmapgl;
        initializeMap();
      };

      script.onerror = (error) => {
        console.error("Failed to load Vietmap GL JS from CDN:", error);
      };

      document.head.appendChild(script);
    };

    const initializeMap = () => {
      console.log("Initializing map...", {
        mapContainer: !!mapContainer.current,
        map: !!map.current,
        vietmapgl: !!vietmapgl.current,
      });

      if (mapContainer.current && !map.current && vietmapgl.current) {
        try {
          // Sử dụng tọa độ ban đầu nếu có, không thì dùng Hà Nội
          const center = initialLocation
            ? [initialLocation.lng, initialLocation.lat]
            : [105.8342, 21.0376];
          const zoom = initialLocation ? 16 : 13;

          map.current = new vietmapgl.current.Map({
            container: mapContainer.current,
            style: `https://namduocvien-api.id.vn/vm/style.json`,
            center: center,
            zoom: zoom,
          });

          map.current.addControl(
            new vietmapgl.current.NavigationControl(),
            "bottom-right"
          );

          // Hiển thị marker ban đầu nếu có tọa độ
          if (initialLocation) {
            // Tìm địa chỉ từ tọa độ (reverse geocoding)
            reverseGeocode(initialLocation.lat, initialLocation.lng);
            showMarker(
              initialLocation.lng,
              initialLocation.lat,
              initialLocation.address || "Vị trí đã chọn"
            );
          }
          console.log("Map initialized successfully");
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      }
    };

    // Delay to ensure DOM is ready
    setTimeout(loadVietmapGL, 100);

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // Lấy refid từ suggestion
  const getRefId = (item: Suggestion): string | undefined => {
    return item?.ref_id || item?.refid || item?.refId;
  };

  // Hiển thị marker trên map
  const showMarker = useCallback(
    (lng: number, lat: number, popupText: string) => {
      if (!map.current || !vietmapgl.current) return;

      // Remove marker cũ nếu có
      if (marker.current) {
        marker.current.remove();
      }

      // Tạo marker mới
      marker.current = new vietmapgl.current.Marker()
        .setLngLat([lng, lat])
        .addTo(map.current);

      // Add popup
      if (popupText) {
        const popup = new vietmapgl.current.Popup({ offset: 25 }).setText(
          popupText
        );
        marker.current.setPopup(popup).togglePopup();
      }

      // Fly to location
      map.current.flyTo({
        center: [lng, lat],
        zoom: 16,
        duration: 1500,
      });
    },
    []
  );

  function getUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation)
        return reject(new Error("Browser không hỗ trợ Geolocation"));
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  // Gọi Place API để lấy chi tiết
  const fetchPlaceByRefId = async (refid: string): Promise<PlaceDetail> => {
    if (!refid) throw new Error("Missing refid");
    const origin = await getUserLocation();
    console.log("User location:", origin);
    // Check cache
    if (placeCache.current.has(refid)) {
      return placeCache.current.get(refid)!;
    }

    const url = `https://namduocvien-api.id.vn/vietmap/api/place?refid=${encodeURIComponent(
      refid
    )}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Place API error: ${res.status}`);
    }

    const data = await res.json();
    placeCache.current.set(refid, data);
    return data;
  };

  // Gọi Autocomplete API
  const fetchAutocomplete = async (text: string) => {
    if (!text.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);

    try {
      const { lat, lng } = map.current.getCenter();
      const url = `https://namduocvien-api.id.vn/vietmap/api/autocomplete?text=${encodeURIComponent(
        text
      )}&focus=${lat},${lng}&display_type=1`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Autocomplete API error: ${res.status}`);
      }

      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
      setShowSuggestions(true);
      setActiveIndex(-1);
    } catch (error) {
      console.error("Autocomplete error:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change với debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    // Clear previous timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout
    debounceTimeout.current = setTimeout(() => {
      fetchAutocomplete(value);
    }, 300);
  };

  // Handle chọn suggestion
  const handleSelectSuggestion = async (suggestion: Suggestion) => {
    const displayText = suggestion.display || suggestion.name || "";
    setSearchValue(displayText);
    setShowSuggestions(false);

    // Nếu có sẵn tọa độ
    const candLat = suggestion.lat ?? suggestion.latitude;
    const candLng = suggestion.lng ?? suggestion.longitude;

    if (typeof candLat === "number" && typeof candLng === "number") {
      showMarker(candLng, candLat, displayText);

      // Gọi callback nếu có
      if (onLocationSelect) {
        onLocationSelect({
          address: displayText,
          lat: candLat,
          lng: candLng,
        });
      }
      return;
    }

    // Không có tọa độ -> gọi Place API
    try {
      const refid = getRefId(suggestion);
      if (!refid) {
        throw new Error("Missing refid");
      }

      const place = await fetchPlaceByRefId(refid);
      if (
        place &&
        typeof place.lat === "number" &&
        typeof place.lng === "number"
      ) {
        const label = place.display || place.name || displayText;
        showMarker(place.lng, place.lat, label);

        // Gọi callback nếu có
        if (onLocationSelect) {
          onLocationSelect({
            address: label,
            lat: place.lat,
            lng: place.lng,
          });
        }
      }
    } catch (error) {
      console.error("Place API error:", error);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    setSearchValue("");
    setSuggestions([]);
    setShowSuggestions(false);

    if (marker.current) {
      marker.current.remove();
      marker.current = null;
    }
  };

  return (
    <div className="vietmap-container">
      {/* Title */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "white",
          zIndex: 1001,
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#344054",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          Vietmap Search Demo
        </h2>
      </div>

      {/* Search Box - Google Maps style */}
      <div className="vietmap-search-wrapper">
        <div className="vietmap-search-box">
          <div className="search-icon">
            <SearchOutlined />
          </div>

          <Input
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Nhập địa điểm cần tìm… (↑/↓ để chọn, Enter để xác nhận)"
            className="search-input"
            bordered={false}
            style={{ fontSize: "14px" }}
          />

          {searchValue && (
            <div className="clear-icon" onClick={handleClear}>
              <CloseCircleFilled />
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="suggestions-dropdown">
            {isLoading ? (
              <div className="suggestion-item loading">
                <span>Đang tìm…</span>
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`suggestion-item ${
                    index === activeIndex ? "active" : ""
                  }`}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <div className="suggestion-icon">
                    <EnvironmentOutlined />
                  </div>
                  <div className="suggestion-content">
                    <div className="suggestion-name">
                      {suggestion.display || suggestion.name}
                    </div>
                    {suggestion.address && (
                      <div className="suggestion-address">
                        {suggestion.address}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="suggestion-item no-results">
                <span>Không tìm thấy kết quả</span>
              </div>
            )}
          </div>
        )}

        {/* Hint badges like in HTML example */}
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="vietmap-canvas" />
    </div>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    vietmapgl: any;
  }
}
