import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    FormControl,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Chip,
    Card,
    CardContent,
} from '@mui/material';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RouteDetails, BusPosition } from '../../../types';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

interface RouteMapViewProps {
    routes: RouteDetails[];
    onRouteClick: (route: RouteDetails) => void;
}

// Custom bus icon
const createBusIcon = (color: string, status: 'on_time' | 'delayed' | 'ahead_of_schedule') => {
    const statusColor = status === 'on_time' ? '#4caf50' : status === 'delayed' ? '#f44336' : '#2196f3';
    return L.divIcon({
        html: `
            <div style="position: relative;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                    <path d="M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16M6.5,17A1.5,1.5 0 0,1 5,15.5A1.5,1.5 0 0,1 6.5,14A1.5,1.5 0 0,1 8,15.5A1.5,1.5 0 0,1 6.5,17M17.5,17A1.5,1.5 0 0,1 16,15.5A1.5,1.5 0 0,1 17.5,14A1.5,1.5 0 0,1 19,15.5A1.5,1.5 0 0,1 17.5,17M6,8V6H18V8H6M6,11H9V13H6V11M10,11H14V13H10V11M15,11H18V13H15V11Z"/>
                </svg>
                <div style="position: absolute; top: -4px; right: -4px; width: 12px; height: 12px; border-radius: 50%; background: ${statusColor}; border: 2px solid white;"></div>
            </div>
        `,
        className: 'bus-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });
};

// Custom stop icon
const createStopIcon = (color: string) => {
    return L.divIcon({
        html: `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="${color}" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">
                <circle cx="12" cy="12" r="8" fill="white" stroke="${color}" stroke-width="2"/>
                <circle cx="12" cy="12" r="4" fill="${color}"/>
            </svg>
        `,
        className: 'stop-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

// Component to handle map bounds updates
const MapBoundsHandler: React.FC<{ routes: RouteDetails[]; selectedRoutes: number[] }> = ({ routes, selectedRoutes }) => {
    const map = useMap();

    useEffect(() => {
        const visibleRoutes = routes.filter(r => selectedRoutes.includes(r.id) && r.path.length > 0);
        if (visibleRoutes.length > 0) {
            const allPoints: L.LatLngExpression[] = visibleRoutes.flatMap(r =>
                r.path.map(p => [p[0], p[1]] as L.LatLngExpression)
            );
            if (allPoints.length > 0) {
                const bounds = L.latLngBounds(allPoints);
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    }, [map, routes, selectedRoutes]);

    return null;
};

const RouteMapView: React.FC<RouteMapViewProps> = ({ routes, onRouteClick }) => {
    const [showRoutes, setShowRoutes] = useState(true);
    const [showStops, setShowStops] = useState(true);
    const [showRealTimeBuses, setShowRealTimeBuses] = useState(true);
    const [selectedRoutes, setSelectedRoutes] = useState<number[]>(
        routes.filter(r => r.isActive).map(r => r.id)
    );
    const [busPositions, setBusPositions] = useState<BusPosition[]>([]);

    // Bucharest center coordinates
    const bucharestCenter: [number, number] = [44.4268, 26.1025];

    useEffect(() => {
        // Simulate real-time bus positions
        const updateBusPositions = () => {
            const positions: BusPosition[] = routes
                .filter(r => r.isActive && selectedRoutes.includes(r.id) && r.path.length > 0)
                .map(route => {
                    // Pick a random point along the route path
                    const pathIndex = Math.floor(Math.random() * route.path.length);
                    const point = route.path[pathIndex];

                    return {
                        busId: route.id * 10 + Math.floor(Math.random() * 3),
                        routeId: route.id,
                        location: {
                            latitude: point[0] + (Math.random() - 0.5) * 0.002,
                            longitude: point[1] + (Math.random() - 0.5) * 0.002,
                        },
                        heading: Math.random() * 360,
                        speed: 20 + Math.random() * 30,
                        lastUpdated: new Date().toISOString(),
                        status: Math.random() > 0.8 ? 'delayed' : Math.random() > 0.5 ? 'on_time' : 'ahead_of_schedule',
                        nextStopId: Math.floor(Math.random() * 10) + 1,
                    };
                });
            setBusPositions(positions);
        };

        updateBusPositions();
        const interval = setInterval(updateBusPositions, 5000);

        return () => clearInterval(interval);
    }, [routes, selectedRoutes]);

    const handleRouteToggle = (routeId: number) => {
        setSelectedRoutes(prev =>
            prev.includes(routeId)
                ? prev.filter(id => id !== routeId)
                : [...prev, routeId]
        );
    };

    const getRouteColor = (routeId: number): string => {
        const colors = ['#1976d2', '#dc004e', '#f57c00', '#388e3c', '#7b1fa2', '#0288d1', '#d32f2f', '#0097a7'];
        return colors[routeId % colors.length];
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'inactive':
                return 'default';
            case 'maintenance':
                return 'warning';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, height: 'calc(100vh - 300px)', minHeight: '600px' }}>
                {/* Map Controls Sidebar */}
                <Paper sx={{ width: 280, p: 2, overflow: 'auto' }}>
                    <Typography variant="h6" gutterBottom>
                        Map Layers
                    </Typography>
                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={showRoutes}
                                    onChange={(e) => setShowRoutes(e.target.checked)}
                                />
                            }
                            label="Show Routes"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={showStops}
                                    onChange={(e) => setShowStops(e.target.checked)}
                                />
                            }
                            label="Show Bus Stops"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={showRealTimeBuses}
                                    onChange={(e) => setShowRealTimeBuses(e.target.checked)}
                                />
                            }
                            label="Real-Time Buses"
                        />
                    </FormGroup>

                    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                        Routes
                    </Typography>
                    {routes.map(route => (
                        <FormControlLabel
                            key={route.id}
                            control={
                                <Checkbox
                                    checked={selectedRoutes.includes(route.id)}
                                    onChange={() => handleRouteToggle(route.id)}
                                    disabled={!route.isActive}
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            bgcolor: getRouteColor(route.id),
                                        }}
                                    />
                                    <Typography variant="body2" noWrap>
                                        {route.code}
                                    </Typography>
                                </Box>
                            }
                            sx={{ display: 'block', mb: 0.5 }}
                        />
                    ))}

                    {/* Route Stats */}
                    <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Statistics
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Active Routes: {routes.filter(r => r.isActive).length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Visible Routes: {selectedRoutes.length}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Live Buses: {busPositions.length}
                        </Typography>
                    </Box>
                </Paper>

                {/* Leaflet Map */}
                <Paper
                    sx={{
                        flexGrow: 1,
                        overflow: 'hidden',
                        position: 'relative',
                    }}
                >
                    <MapContainer
                        center={bucharestCenter}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={true}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <MapBoundsHandler routes={routes} selectedRoutes={selectedRoutes} />

                        {/* Draw Route Polylines */}
                        {showRoutes &&
                            routes
                                .filter(r => selectedRoutes.includes(r.id) && r.isActive && r.path.length > 0)
                                .map((route) => (
                                    <Polyline
                                        key={route.id}
                                        positions={route.path as L.LatLngExpression[]}
                                        color={getRouteColor(route.id)}
                                        weight={4}
                                        opacity={0.7}
                                        eventHandlers={{
                                            click: () => onRouteClick(route),
                                        }}
                                    >
                                        <Popup>
                                            <Box sx={{ minWidth: 200 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {route.code}
                                                    </Typography>
                                                    <Chip
                                                        label={route.status}
                                                        size="small"
                                                        color={getStatusColor(route.status)}
                                                    />
                                                </Box>
                                                <Typography variant="body2" gutterBottom>
                                                    {route.name}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="textSecondary">
                                                    Stops: {route.numberOfStops}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="textSecondary">
                                                    Passengers: {route.averageDailyPassengers.toLocaleString()}/day
                                                </Typography>
                                                <Typography variant="caption" display="block" color="textSecondary">
                                                    On-time: {route.onTimePercentage}%
                                                </Typography>
                                            </Box>
                                        </Popup>
                                    </Polyline>
                                ))}

                        {/* Draw Bus Stops */}
                        {showStops &&
                            routes
                                .filter(r => selectedRoutes.includes(r.id))
                                .flatMap(route =>
                                    route.stops.map((stop) => (
                                        <Marker
                                            key={`${route.id}-${stop.id}`}
                                            position={[stop.location.latitude, stop.location.longitude]}
                                            icon={createStopIcon(getRouteColor(route.id))}
                                        >
                                            <Popup>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {stop.stopName}
                                                    </Typography>
                                                    <Typography variant="caption" display="block" color="textSecondary">
                                                        Route: {route.code}
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        Stop #{stop.sequenceNumber}
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        Avg wait: {stop.averageWaitTime} min
                                                    </Typography>
                                                    <Typography variant="caption" display="block">
                                                        Boarding: {stop.boardingCount} | Alighting: {stop.alightingCount}
                                                    </Typography>
                                                </Box>
                                            </Popup>
                                        </Marker>
                                    ))
                                )}

                        {/* Draw Real-time Buses */}
                        {showRealTimeBuses &&
                            busPositions.map((bus) => {
                                const route = routes.find(r => r.id === bus.routeId);
                                if (!route) return null;

                                return (
                                    <Marker
                                        key={bus.busId}
                                        position={[bus.location.latitude, bus.location.longitude]}
                                        icon={createBusIcon(getRouteColor(bus.routeId), bus.status)}
                                    >
                                        <Popup>
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    Bus #{bus.busId}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="textSecondary">
                                                    Route: {route.code}
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    Status:{' '}
                                                    <span
                                                        style={{
                                                            color:
                                                                bus.status === 'on_time'
                                                                    ? '#4caf50'
                                                                    : bus.status === 'delayed'
                                                                    ? '#f44336'
                                                                    : '#2196f3',
                                                        }}
                                                    >
                                                        {bus.status === 'on_time'
                                                            ? 'On Time'
                                                            : bus.status === 'delayed'
                                                            ? 'Delayed'
                                                            : 'Ahead of Schedule'}
                                                    </span>
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    Speed: {Math.round(bus.speed)} km/h
                                                </Typography>
                                                <Typography variant="caption" display="block" color="textSecondary">
                                                    Updated: {new Date(bus.lastUpdated).toLocaleTimeString()}
                                                </Typography>
                                            </Box>
                                        </Popup>
                                    </Marker>
                                );
                            })}
                    </MapContainer>

                    {/* Legend */}
                    <Paper
                        sx={{
                            position: 'absolute',
                            bottom: 16,
                            right: 16,
                            p: 2,
                            minWidth: 200,
                            zIndex: 1000,
                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                        }}
                    >
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                            Legend
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Box
                                sx={{
                                    width: 16,
                                    height: 3,
                                    bgcolor: '#1976d2',
                                    borderRadius: 1,
                                }}
                            />
                            <Typography variant="body2">Route Path</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Box
                                sx={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    border: '2px solid #1976d2',
                                    bgcolor: 'white',
                                }}
                            />
                            <Typography variant="body2">Bus Stop</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#1976d2">
                                <path d="M4,16C4,16.88 4.39,17.67 5,18.22V20A1,1 0 0,0 6,21H7A1,1 0 0,0 8,20V19H16V20A1,1 0 0,0 17,21H18A1,1 0 0,0 19,20V18.22C19.61,17.67 20,16.88 20,16V6C20,2.5 16.42,2 12,2C7.58,2 4,2.5 4,6V16M6.5,17A1.5,1.5 0 0,1 5,15.5A1.5,1.5 0 0,1 6.5,14A1.5,1.5 0 0,1 8,15.5A1.5,1.5 0 0,1 6.5,17M17.5,17A1.5,1.5 0 0,1 16,15.5A1.5,1.5 0 0,1 17.5,14A1.5,1.5 0 0,1 19,15.5A1.5,1.5 0 0,1 17.5,17M6,8V6H18V8H6M6,11H9V13H6V11M10,11H14V13H10V11M15,11H18V13H15V11Z"/>
                            </svg>
                            <Typography variant="body2" sx={{ ml: 0.5 }}>
                                Live Bus
                            </Typography>
                        </Box>
                        <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                            <Typography variant="caption" color="textSecondary" display="block">
                                🟢 On Time • 🔴 Delayed • 🔵 Early
                            </Typography>
                            <Typography variant="caption" color="textSecondary" display="block">
                                Updates: Every 5 seconds
                            </Typography>
                        </Box>
                    </Paper>
                </Paper>
            </Box>
        </Box>
    );
};

export default RouteMapView;
