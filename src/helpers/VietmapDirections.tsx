import { useEffect, useRef, useState, useCallback } from "react";
import { Input, Button, Select, Space, Tooltip } from "antd";
import {
  SwapOutlined,
  EnvironmentOutlined,
  EnvironmentFilled,
  AimOutlined,
  CloseCircleFilled,
  CarOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import "./style/VietmapDirection.css";

type VehicleType = "car" | "motorcycle" | "foot";

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

interface Point {
  lat: number;
  lng: number;
  address?: string;
}

interface VietmapDirectionsProps {
  initialStart?: Point;
  initialEnd?: Point;
  onRouteReady?: (info: { distanceMeters: number; durationMs: number }) => void;
}

export function VietmapDirections({
  initialStart,
  initialEnd,
  onRouteReady,
}: VietmapDirectionsProps = {}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markerStart = useRef<any>(null);
  const markerEnd = useRef<any>(null);
  const routeSourceId = "route-line-source";
  const routeLayerId = "route-line-layer";
  const vietmapgl = useRef<any>(null);

  // State cho 2 ô tìm kiếm
  const [startValue, setStartValue] = useState(initialStart?.address || "");
  const [endValue, setEndValue] = useState(initialEnd?.address || "");
  const [startPoint, setStartPoint] = useState<Point | null>(
    initialStart || null
  );
  const [endPoint, setEndPoint] = useState<Point | null>(initialEnd || null);

  // Gợi ý & loading theo từng ô
  const [activeBox, setActiveBox] = useState<"start" | "end" | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const [vehicle, setVehicle] = useState<VehicleType>("car");
  const [distanceKm, setDistanceKm] = useState<string>("");
  const [durationMin, setDurationMin] = useState<string>("");

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const placeCache = useRef<Map<string, PlaceDetail>>(new Map());

  // ======= Helpers =======

  const getRefId = (item: Suggestion) =>
    item?.ref_id || item?.refid || item?.refId;

  function getUserLocation(): Promise<Point> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation)
        return reject(new Error("Trình duyệt không hỗ trợ Geolocation"));
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  // Polyline decoder (Google/VietMap compatible)
  function decodePolyline(str: string, precision = 5): [number, number][] {
    let index = 0,
      lat = 0,
      lng = 0,
      coordinates: [number, number][] = [];
    const factor = Math.pow(10, precision);

    while (index < str.length) {
      let result = 0,
        shift = 0,
        b;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      result = 0;
      shift = 0;
      do {
        b = str.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      coordinates.push([lng / factor, lat / factor]); // [lng, lat]
    }
    return coordinates;
  }

  const addOrUpdateRouteLine = (
    geojson: GeoJSON.Feature<GeoJSON.LineString>
  ) => {
    if (!map.current) return;

    if (map.current.getLayer(routeLayerId)) {
      (map.current.getSource(routeSourceId) as any)?.setData(geojson);
    } else {
      map.current.addSource(routeSourceId, {
        type: "geojson",
        data: geojson,
      });
      map.current.addLayer({
        id: routeLayerId,
        type: "line",
        source: routeSourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-width": 5, "line-color": "#2563EB" }, // màu mặc định
      });
    }
  };

  const clearRoute = () => {
    if (!map.current) return;
    if (map.current.getLayer(routeLayerId)) {
      map.current.removeLayer(routeLayerId);
    }
    if (map.current.getSource(routeSourceId)) {
      map.current.removeSource(routeSourceId);
    }
  };

  const fitBoundsToPoints = (a: Point, b: Point) => {
    if (!map.current || !vietmapgl.current) return;
    const bounds = new vietmapgl.current.LngLatBounds();
    bounds.extend([a.lng, a.lat]);
    bounds.extend([b.lng, b.lat]);
    map.current.fitBounds(bounds, { padding: 80, duration: 900 });
  };

  const showMarker = useCallback(
    (which: "start" | "end", lng: number, lat: number, label?: string) => {
      if (!map.current || !vietmapgl.current) return;

      const iconColor = which === "start" ? "#16A34A" : "#DC2626";

      const el = document.createElement("div");
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.background = iconColor;
      el.style.border = "2px solid white";
      el.style.borderRadius = "50%";
      el.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.15)";

      const marker =
        which === "start"
          ? (markerStart.current ||= new vietmapgl.current.Marker({
              element: el,
            }))
          : (markerEnd.current ||= new vietmapgl.current.Marker({
              element: el,
            }));

      marker.setLngLat([lng, lat]).addTo(map.current);

      if (label) {
        const popup = new vietmapgl.current.Popup({ offset: 20 }).setText(
          label
        );
        marker.setPopup(popup);
      }
    },
    []
  );

  // ======= API calls via your proxy =======

  const fetchAutocomplete = async (text: string) => {
    if (!text.trim() || !map.current) {
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
      if (!res.ok) throw new Error(`Autocomplete error: ${res.status}`);
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
      setShowSuggestions(true);
      setActiveIndex(-1);
    } catch (e) {
      console.error(e);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlaceByRefId = async (refid: string): Promise<PlaceDetail> => {
    if (!refid) throw new Error("Missing refid");
    if (placeCache.current.has(refid)) return placeCache.current.get(refid)!;

    const url = `https://namduocvien-api.id.vn/vietmap/api/place?refid=${encodeURIComponent(
      refid
    )}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Place error: ${res.status}`);
    const data = await res.json();
    placeCache.current.set(refid, data);
    return data;
  };

  const fetchRoute = async (
    origin: Point,
    destination: Point,
    vehicle: VehicleType
  ) => {
    const qs = new URLSearchParams({ vehicle, "api-version": "1.1" });
    // GraphHopper-style: multiple 'point' parameters
    qs.append("point", `${origin.lat},${origin.lng}`);
    qs.append("point", `${destination.lat},${destination.lng}`);

    const url = `https://namduocvien-api.id.vn/vietmap/api/route?${qs.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Route error: ${res.status}`);
    const data = await res.json();

    const path = data?.paths?.[0];
    if (!path) throw new Error("Không tìm thấy tuyến đường");

    return {
      distanceMeters: path.distance,
      durationMs: path.time,
      encoded: path.points as string,
      bbox: path.bbox as [number, number, number, number] | undefined,
    };
  };

  // ======= Tính route & vẽ =======

  const computeAndDrawRoute = async (s: Point, e: Point, v: VehicleType) => {
    try {
      const route = await fetchRoute(s, e, v);
      const coords = decodePolyline(route.encoded).map(([lng, lat]) => [
        lng,
        lat,
      ]);

      const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: "Feature",
        geometry: { type: "LineString", coordinates: coords },
        properties: {},
      };

      addOrUpdateRouteLine(geojson);

      const km = (route.distanceMeters / 1000).toFixed(2);
      const mins = Math.round(route.durationMs / 1000 / 60);
      setDistanceKm(km);
      setDurationMin(String(mins));
      onRouteReady?.({
        distanceMeters: route.distanceMeters,
        durationMs: route.durationMs,
      });

      // fit bounds nhẹ
      fitBoundsToPoints(s, e);
    } catch (e) {
      console.error("Route error:", e);
      clearRoute();
      setDistanceKm("");
      setDurationMin("");
    }
  };

  // ======= Map bootstrap =======

  useEffect(() => {
    const loadVietmapGL = () => {
      if (window.vietmapgl) {
        vietmapgl.current = window.vietmapgl;
        initMap();
        return;
      }
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href =
        "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.css";
      document.head.appendChild(css);

      const script = document.createElement("script");
      script.src =
        "https://unpkg.com/@vietmap/vietmap-gl-js@6.0.0/dist/vietmap-gl.js";
      script.async = true;
      script.onload = () => {
        vietmapgl.current = (window as any).vietmapgl;
        initMap();
      };
      script.onerror = () => console.error("Load Vietmap GL failed");
      document.head.appendChild(script);
    };

    const initMap = () => {
      if (!mapContainer.current || map.current || !vietmapgl.current) return;

      // center theo start nếu có, không thì Hà Nội
      const center: [number, number] = startPoint
        ? [startPoint.lng, startPoint.lat]
        : [105.8342, 21.0376];

      map.current = new vietmapgl.current.Map({
        container: mapContainer.current,
        style: `https://namduocvien-api.id.vn/vm/style.json`,
        center,
        zoom: startPoint ? 14 : 12,
      });

      map.current.addControl(
        new vietmapgl.current.NavigationControl(),
        "bottom-right"
      );

      // Marker nếu có sẵn
      if (startPoint)
        showMarker("start", startPoint.lng, startPoint.lat, startPoint.address);
      if (endPoint)
        showMarker("end", endPoint.lng, endPoint.lat, endPoint.address);

      // Nếu có đủ 2 điểm → vẽ route luôn
      if (startPoint && endPoint)
        computeAndDrawRoute(startPoint, endPoint, vehicle);
    };

    loadVietmapGL();
    return () => {
      if (map.current) map.current.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======= Event handlers cho 2 ô =======

  const handleChange = (which: "start" | "end", value: string) => {
    which === "start" ? setStartValue(value) : setEndValue(value);
    setActiveBox(which);

    // debounce autocomplete
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAutocomplete(value);
    }, 300);
  };

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
      if (activeIndex >= 0) onPickSuggestion(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const onPickSuggestion = async (sug: Suggestion) => {
    const display = sug.display || sug.name || "";
    const lat = sug.lat ?? sug.latitude;
    const lng = sug.lng ?? sug.longitude;

    // set UI value
    if (activeBox === "start") {
      setStartValue(display);
    } else if (activeBox === "end") {
      setEndValue(display);
    }
    setShowSuggestions(false);

    let point: Point | null = null;

    if (typeof lat === "number" && typeof lng === "number") {
      point = { lat, lng, address: display };
    } else {
      // Place v4
      try {
        const refid = getRefId(sug);
        if (!refid) throw new Error("Thiếu refid");
        const place = await fetchPlaceByRefId(refid);
        point = {
          lat: place.lat,
          lng: place.lng,
          address: place.display || place.name || display,
        };
      } catch (e) {
        console.error(e);
        return;
      }
    }

    if (!point) return;

    if (activeBox === "start") {
      setStartPoint(point);
      showMarker("start", point.lng, point.lat, point.address);
    } else {
      setEndPoint(point);
      showMarker("end", point.lng, point.lat, point.address);
    }

    // Nếu đủ hai điểm → tính route
    const s = activeBox === "start" ? point : startPoint;
    const e = activeBox === "end" ? point : endPoint;
    if (s && e) computeAndDrawRoute(s, e, vehicle);
  };

  const useMyLocation = async (which: "start" | "end") => {
    try {
      const me = await getUserLocation();
      const p = { ...me, address: "Vị trí của tôi" };
      if (which === "start") {
        setStartPoint(p);
        setStartValue("Vị trí của tôi");
        showMarker("start", p.lng, p.lat, p.address);
      } else {
        setEndPoint(p);
        setEndValue("Vị trí của tôi");
        showMarker("end", p.lng, p.lat, p.address);
      }
      if (which === "start" ? endPoint : startPoint) {
        const s = which === "start" ? p : (startPoint as Point);
        const e = which === "start" ? (endPoint as Point) : p;
        computeAndDrawRoute(s, e, vehicle);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const swapPoints = () => {
    const s = startPoint ? { ...startPoint } : null;
    const e = endPoint ? { ...endPoint } : null;

    setStartPoint(e);
    setEndPoint(s);
    setStartValue(e?.address || "");
    setEndValue(s?.address || "");

    // hoán đổi marker
    if (markerStart.current) markerStart.current.remove();
    if (markerEnd.current) markerEnd.current.remove();
    markerStart.current = null;
    markerEnd.current = null;

    if (e) showMarker("start", e.lng, e.lat, e.address);
    if (s) showMarker("end", s.lng, s.lat, s.address);

    clearRoute();
    if (e && s) computeAndDrawRoute(e, s, vehicle);
  };

  const clearAll = () => {
    setStartValue("");
    setEndValue("");
    setStartPoint(null);
    setEndPoint(null);
    setSuggestions([]);
    setShowSuggestions(false);
    setDistanceKm("");
    setDurationMin("");

    if (markerStart.current) {
      markerStart.current.remove();
      markerStart.current = null;
    }
    if (markerEnd.current) {
      markerEnd.current.remove();
      markerEnd.current = null;
    }
    clearRoute();
  };

  // Khi đổi loại phương tiện
  useEffect(() => {
    if (startPoint && endPoint) {
      computeAndDrawRoute(startPoint, endPoint, vehicle);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicle]);

  // ======= UI =======

  return (
    <div className="vietmap-container">
      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 68,
          background: "white",
          zIndex: 1001,
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
        }}
      >
        <Space
          direction="vertical"
          size={8}
          style={{ width: 520, maxWidth: "90vw" }}
        >
          {/* Start box */}
          <div className="vietmap-search-box">
            <div className="search-icon">
              <EnvironmentFilled style={{ color: "#16A34A" }} />
            </div>
            <Input
              value={startValue}
              onChange={(e) => handleChange("start", e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setActiveBox("start");
                suggestions.length && setShowSuggestions(true);
              }}
              placeholder="Điểm bắt đầu"
              className="search-input"
              bordered={false}
              style={{ fontSize: 14 }}
            />
            {startValue && (
              <div
                className="clear-icon"
                onClick={() => {
                  setStartValue("");
                  setStartPoint(null);
                  if (markerStart.current) {
                    markerStart.current.remove();
                    markerStart.current = null;
                  }
                  clearRoute();
                }}
              >
                <CloseCircleFilled />
              </div>
            )}
            <Tooltip title="Dùng vị trí của tôi">
              <Button
                type="text"
                icon={<AimOutlined />}
                onClick={() => useMyLocation("start")}
              />
            </Tooltip>
          </div>

          {/* End box */}
          <div className="vietmap-search-box">
            <div className="search-icon">
              <EnvironmentOutlined style={{ color: "#DC2626" }} />
            </div>
            <Input
              value={endValue}
              onChange={(e) => handleChange("end", e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setActiveBox("end");
                suggestions.length && setShowSuggestions(true);
              }}
              placeholder="Điểm đến"
              className="search-input"
              bordered={false}
              style={{ fontSize: 14 }}
            />
            {endValue && (
              <div
                className="clear-icon"
                onClick={() => {
                  setEndValue("");
                  setEndPoint(null);
                  if (markerEnd.current) {
                    markerEnd.current.remove();
                    markerEnd.current = null;
                  }
                  clearRoute();
                }}
              >
                <CloseCircleFilled />
              </div>
            )}
            <Tooltip title="Dùng vị trí của tôi">
              <Button
                type="text"
                icon={<AimOutlined />}
                onClick={() => useMyLocation("end")}
              />
            </Tooltip>
          </div>
        </Space>

        {/* Actions */}
        <Space wrap>
          <Tooltip title="Đổi chiều">
            <Button icon={<SwapOutlined />} onClick={swapPoints} />
          </Tooltip>

          <Select<VehicleType>
            value={vehicle}
            onChange={setVehicle}
            style={{ width: 140 }}
            options={[
              {
                value: "car",
                label: (
                  <span>
                    <CarOutlined /> Ô tô
                  </span>
                ),
              },
              {
                value: "motorcycle",
                label: (
                  <span>
                    <ThunderboltOutlined /> Xe máy
                  </span>
                ),
              },
              {
                value: "foot",
                label: (
                  <span>
                    {/* <WalkOutlined />  */}
                    Đi bộ
                  </span>
                ),
              },
            ]}
          />

          <Button onClick={clearAll}>Xoá</Button>
        </Space>

        {/* Stats */}
        <div style={{ marginLeft: "auto", color: "#334155", fontSize: 14 }}>
          {distanceKm && durationMin ? (
            <b>
              {distanceKm} km · ~{durationMin} phút
            </b>
          ) : (
            <span style={{ color: "#94a3b8" }}>
              Chọn điểm bắt đầu & điểm đến để tính tuyến
            </span>
          )}
        </div>
      </div>

      {/* Suggestions dropdown (cho cả 2 ô, dùng activeBox để phân biệt) */}
      {showSuggestions && (
        <div
          className="suggestions-dropdown"
          style={{ top: 80, left: 16, width: 520, zIndex: 1002 }}
        >
          {isLoading ? (
            <div className="suggestion-item loading">Đang tìm…</div>
          ) : suggestions.length ? (
            suggestions.map((sug, idx) => (
              <div
                key={idx}
                className={`suggestion-item ${
                  idx === activeIndex ? "active" : ""
                }`}
                onClick={() => onPickSuggestion(sug)}
                onMouseEnter={() => setActiveIndex(idx)}
                style={{ display: "flex", gap: 8 }}
              >
                <div className="suggestion-icon">
                  <EnvironmentOutlined />
                </div>
                <div className="suggestion-content">
                  <div className="suggestion-name">
                    {sug.display || sug.name}
                  </div>
                  {sug.address && (
                    <div className="suggestion-address">{sug.address}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="suggestion-item no-results">
              Không tìm thấy kết quả
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div ref={mapContainer} className="vietmap-canvas" />
    </div>
  );
}

// Extend Window interface
declare global {
  interface Window {
    vietmapgl: any;
  }
}
