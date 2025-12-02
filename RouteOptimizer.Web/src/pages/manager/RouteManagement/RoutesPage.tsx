import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Button,
    Paper,
} from '@mui/material';
import {
    Add as AddIcon,
    List as ListIcon,
    Map as MapIcon,
} from '@mui/icons-material';
import type { NotificationState, RouteDetails } from '../../../types';
import Navbar from '../../../components/common/Navbar';
import RouteList from './RouteList';
import RouteMapView from './RouteMapView';
import RouteDetailsPanel from './RouteDetailsPanel';
import RouteFormDialog from './RouteFormDialog';

interface RoutesPageProps {
    showNotification: (message: string, severity: NotificationState['severity']) => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`route-tabpanel-${index}`}
            aria-labelledby={`route-tab-${index}`}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
};

const RoutesPage: React.FC<RoutesPageProps> = ({ showNotification }) => {
    const [tabValue, setTabValue] = useState(0);
    const [routes, setRoutes] = useState<RouteDetails[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<RouteDetails | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<RouteDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Sample data for Bucharest routes
    const sampleRoutes: RouteDetails[] = [
        {
            id: 1,
            name: 'Piața Victoriei - Piața Unirii',
            code: 'Route 1',
            description: 'Main route connecting central landmarks',
            isActive: true,
            operationalCost: 5000,
            estimatedTravelTime: 25,
            busStops: [],
            buses: [],
            startPoint: 'Piața Victoriei',
            endPoint: 'Piața Unirii',
            numberOfStops: 12,
            operatingHours: { start: '05:30', end: '23:00' },
            status: 'active',
            averageDailyPassengers: 3500,
            onTimePercentage: 92,
            capacityUtilization: 85,
            frequency: 8,
            vehicleType: 'Standard Bus',
            stops: [
                {
                    id: 1,
                    stopId: 101,
                    stopName: 'Piața Victoriei',
                    location: { latitude: 44.4518, longitude: 26.0828 },
                    sequenceNumber: 1,
                    averageWaitTime: 5,
                    boardingCount: 450,
                    alightingCount: 50,
                    distanceFromPrevious: 0,
                },
                {
                    id: 2,
                    stopId: 102,
                    stopName: 'Piața Romană',
                    location: { latitude: 44.4443, longitude: 26.0959 },
                    sequenceNumber: 2,
                    averageWaitTime: 6,
                    boardingCount: 350,
                    alightingCount: 200,
                    distanceFromPrevious: 1200,
                },
                {
                    id: 3,
                    stopId: 103,
                    stopName: 'Universitate',
                    location: { latitude: 44.4361, longitude: 26.1003 },
                    sequenceNumber: 3,
                    averageWaitTime: 5,
                    boardingCount: 500,
                    alightingCount: 300,
                    distanceFromPrevious: 950,
                },
                {
                    id: 4,
                    stopId: 104,
                    stopName: 'Piața Unirii',
                    location: { latitude: 44.4268, longitude: 26.1025 },
                    sequenceNumber: 4,
                    averageWaitTime: 7,
                    boardingCount: 150,
                    alightingCount: 600,
                    distanceFromPrevious: 1100,
                },
            ],
            path: [
                [44.4518, 26.0828],
                [44.4443, 26.0959],
                [44.4361, 26.1003],
                [44.4268, 26.1025],
            ],
        },
        {
            id: 2,
            name: 'Gara de Nord - Universitate',
            code: 'Route 8',
            description: 'Connecting train station to university area',
            isActive: true,
            operationalCost: 3500,
            estimatedTravelTime: 18,
            busStops: [],
            buses: [],
            startPoint: 'Gara de Nord',
            endPoint: 'Universitate',
            numberOfStops: 8,
            operatingHours: { start: '05:00', end: '23:30' },
            status: 'active',
            averageDailyPassengers: 2800,
            onTimePercentage: 88,
            capacityUtilization: 78,
            frequency: 10,
            vehicleType: 'Standard Bus',
            stops: [
                {
                    id: 5,
                    stopId: 201,
                    stopName: 'Gara de Nord',
                    location: { latitude: 44.4458, longitude: 26.0754 },
                    sequenceNumber: 1,
                    averageWaitTime: 4,
                    boardingCount: 550,
                    alightingCount: 80,
                    distanceFromPrevious: 0,
                },
                {
                    id: 6,
                    stopId: 202,
                    stopName: 'Piața Victoriei',
                    location: { latitude: 44.4518, longitude: 26.0828 },
                    sequenceNumber: 2,
                    averageWaitTime: 5,
                    boardingCount: 300,
                    alightingCount: 250,
                    distanceFromPrevious: 950,
                },
                {
                    id: 7,
                    stopId: 203,
                    stopName: 'Universitate',
                    location: { latitude: 44.4361, longitude: 26.1003 },
                    sequenceNumber: 3,
                    averageWaitTime: 6,
                    boardingCount: 200,
                    alightingCount: 520,
                    distanceFromPrevious: 1800,
                },
            ],
            path: [
                [44.4458, 26.0754],
                [44.4518, 26.0828],
                [44.4361, 26.1003],
            ],
        },
        {
            id: 3,
            name: 'Piața Obor - Herastrau Park',
            code: 'Route 23',
            description: 'East to North route via central areas',
            isActive: true,
            operationalCost: 4200,
            estimatedTravelTime: 32,
            busStops: [],
            buses: [],
            startPoint: 'Piața Obor',
            endPoint: 'Herastrau Park',
            numberOfStops: 15,
            operatingHours: { start: '06:00', end: '22:00' },
            status: 'active',
            averageDailyPassengers: 2200,
            onTimePercentage: 85,
            capacityUtilization: 72,
            frequency: 12,
            vehicleType: 'Standard Bus',
            stops: [],
            path: [
                [44.4321, 26.1267],
                [44.4398, 26.1154],
                [44.4659, 26.0775],
            ],
        },
        {
            id: 4,
            name: 'Airport Express',
            code: 'Route 783',
            description: 'Direct connection to Henri Coandă Airport',
            isActive: true,
            operationalCost: 6500,
            estimatedTravelTime: 45,
            busStops: [],
            buses: [],
            startPoint: 'Piața Unirii',
            endPoint: 'Henri Coandă Airport',
            numberOfStops: 6,
            operatingHours: { start: '04:00', end: '00:00' },
            status: 'active',
            averageDailyPassengers: 1800,
            onTimePercentage: 94,
            capacityUtilization: 88,
            frequency: 20,
            vehicleType: 'Express Bus',
            stops: [],
            path: [
                [44.4268, 26.1025],
                [44.5711, 26.0850],
            ],
        },
        {
            id: 5,
            name: 'Băneasa Shopping - City Center',
            code: 'Route 44',
            description: 'Shopping area to downtown',
            isActive: false,
            operationalCost: 3800,
            estimatedTravelTime: 28,
            busStops: [],
            buses: [],
            startPoint: 'Băneasa Shopping City',
            endPoint: 'Piața Romana',
            numberOfStops: 11,
            operatingHours: { start: '06:30', end: '21:30' },
            status: 'maintenance',
            averageDailyPassengers: 1500,
            onTimePercentage: 79,
            capacityUtilization: 65,
            frequency: 15,
            vehicleType: 'Standard Bus',
            stops: [],
            path: [],
        },
    ];

    useEffect(() => {
        loadRoutes();
    }, []);

    const loadRoutes = async () => {
        setIsLoading(true);
        try {
            // In production, this would be an API call
            // const response = await apiService.getRoutes();
            // setRoutes(response.data);

            // For demo, use sample data
            setTimeout(() => {
                setRoutes(sampleRoutes);
                setIsLoading(false);
            }, 500);
        } catch (error: unknown) {
            console.error('Failed to load routes:', error);
            showNotification('Failed to load routes', 'error');
            setIsLoading(false);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleViewDetails = (route: RouteDetails) => {
        setSelectedRoute(route);
        setIsDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setIsDetailsOpen(false);
        setSelectedRoute(null);
    };

    const handleAddRoute = () => {
        setEditingRoute(null);
        setIsFormOpen(true);
    };

    const handleEditRoute = (route: RouteDetails) => {
        setEditingRoute(route);
        setIsFormOpen(true);
    };

    const handleDeleteRoute = async (routeId: number) => {
        try {
            // In production: await apiService.deleteRoute(routeId);
            setRoutes(routes.filter(r => r.id !== routeId));
            showNotification('Route deleted successfully', 'success');
        } catch (error: unknown) {
            console.error('Failed to delete route:', error);
            showNotification('Failed to delete route', 'error');
        }
    };

    const handleToggleRouteStatus = async (routeId: number) => {
        try {
            // In production: await apiService.toggleRouteStatus(routeId);
            setRoutes(routes.map(r =>
                r.id === routeId
                    ? { ...r, isActive: !r.isActive, status: r.isActive ? 'inactive' : 'active' } as RouteDetails
                    : r
            ));
            showNotification('Route status updated', 'success');
        } catch (error: unknown) {
            console.error('Failed to toggle route status:', error);
            showNotification('Failed to update route status', 'error');
        }
    };

    const handleSaveRoute = async (routeData: RouteDetails) => {
        try {
            if (editingRoute) {
                // Update existing route
                // In production: await apiService.updateRoute(editingRoute.id, routeData);
                setRoutes(routes.map(r => r.id === editingRoute.id ? routeData : r));
                showNotification('Route updated successfully', 'success');
            } else {
                // Create new route
                // In production: const response = await apiService.createRoute(routeData);
                const newRoute = { ...routeData, id: routes.length + 1 };
                setRoutes([...routes, newRoute]);
                showNotification('Route created successfully', 'success');
            }
            setIsFormOpen(false);
            setEditingRoute(null);
        } catch (error: unknown) {
            console.error('Failed to save route:', error);
            showNotification('Failed to save route', 'error');
        }
    };

    const handleCloseForm = () => {
        setIsFormOpen(false);
        setEditingRoute(null);
    };

    return (
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Navbar />
            <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" gutterBottom>
                        Route Management - Bucharest
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddRoute}
                        size="large"
                    >
                        Add New Route
                    </Button>
                </Box>

                {/* Tabs */}
                <Paper sx={{ mb: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="route management tabs"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab
                            icon={<ListIcon />}
                            iconPosition="start"
                            label="Route List"
                            id="route-tab-0"
                            aria-controls="route-tabpanel-0"
                        />
                        <Tab
                            icon={<MapIcon />}
                            iconPosition="start"
                            label="Map View"
                            id="route-tab-1"
                            aria-controls="route-tabpanel-1"
                        />
                    </Tabs>
                </Paper>

                {/* Tab Panels */}
                <TabPanel value={tabValue} index={0}>
                    <RouteList
                        routes={routes}
                        isLoading={isLoading}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEditRoute}
                        onDelete={handleDeleteRoute}
                        onToggleStatus={handleToggleRouteStatus}
                    />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <RouteMapView
                        routes={routes}
                        onRouteClick={handleViewDetails}
                    />
                </TabPanel>

                {/* Route Details Drawer */}
                <RouteDetailsPanel
                    route={selectedRoute}
                    open={isDetailsOpen}
                    onClose={handleCloseDetails}
                    onEdit={handleEditRoute}
                />

                {/* Route Form Dialog */}
                <RouteFormDialog
                    open={isFormOpen}
                    route={editingRoute}
                    onClose={handleCloseForm}
                    onSave={handleSaveRoute}
                />
            </Box>
        </Box>
    );
};

export default RoutesPage;
