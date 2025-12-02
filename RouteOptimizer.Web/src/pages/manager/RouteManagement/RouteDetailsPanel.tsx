import React from 'react';
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    Divider,
    Chip,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Grid,
    Card,
    CardContent,
    Paper,
} from '@mui/material';
import {
    Close as CloseIcon,
    Edit as EditIcon,
    LocationOn as LocationIcon,
    AccessTime as TimeIcon,
    People as PeopleIcon,
    Schedule as ScheduleIcon,
    TrendingUp as TrendingUpIcon,
    DirectionsBus as BusIcon,
} from '@mui/icons-material';
import type { RouteDetails } from '../../../types';

interface RouteDetailsPanelProps {
    route: RouteDetails | null;
    open: boolean;
    onClose: () => void;
    onEdit: (route: RouteDetails) => void;
}

const RouteDetailsPanel: React.FC<RouteDetailsPanelProps> = ({
    route,
    open,
    onClose,
    onEdit,
}) => {
    if (!route) return null;

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

    const getPerformanceColor = (percentage: number) => {
        if (percentage >= 90) return 'success';
        if (percentage >= 75) return 'warning';
        return 'error';
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 600 } },
            }}
        >
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box
                    sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: 1,
                        borderColor: 'divider',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6">Route Details</Typography>
                        <Chip
                            label={route.code}
                            color="primary"
                            size="small"
                        />
                        <Chip
                            label={route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                            color={getStatusColor(route.status)}
                            size="small"
                        />
                    </Box>
                    <Box>
                        <IconButton onClick={() => onEdit(route)} color="primary">
                            <EditIcon />
                        </IconButton>
                        <IconButton onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </Box>

                {/* Content */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
                    {/* Basic Information */}
                    <Typography variant="h5" gutterBottom>
                        {route.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        {route.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {/* Route Overview */}
                    <Typography variant="h6" gutterBottom>
                        Route Overview
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <LocationIcon color="action" />
                                        <Typography variant="caption" color="textSecondary">
                                            Start Point
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="medium">
                                        {route.startPoint}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <LocationIcon color="action" />
                                        <Typography variant="caption" color="textSecondary">
                                            End Point
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="medium">
                                        {route.endPoint}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <TimeIcon color="action" />
                                        <Typography variant="caption" color="textSecondary">
                                            Travel Time
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="medium">
                                        {route.estimatedTravelTime} minutes
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <BusIcon color="action" />
                                        <Typography variant="caption" color="textSecondary">
                                            Vehicle Type
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight="medium">
                                        {route.vehicleType}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Operating Hours */}
                    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <ScheduleIcon color="action" />
                            <Typography variant="subtitle2">Operating Hours</Typography>
                        </Box>
                        <Typography variant="body2">
                            {route.operatingHours.start} - {route.operatingHours.end}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            Frequency: Every {route.frequency} minutes
                        </Typography>
                    </Paper>

                    <Divider sx={{ my: 2 }} />

                    {/* Performance Metrics */}
                    <Typography variant="h6" gutterBottom>
                        Performance Metrics
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <PeopleIcon color="action" />
                                        <Typography variant="caption" color="textSecondary">
                                            Avg Daily Passengers
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        {route.averageDailyPassengers.toLocaleString()}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <TimeIcon color="action" />
                                        <Typography variant="caption" color="textSecondary">
                                            On-Time Performance
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        <Chip
                                            label={`${route.onTimePercentage}%`}
                                            color={getPerformanceColor(route.onTimePercentage)}
                                            size="small"
                                        />
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <TrendingUpIcon color="action" />
                                        <Typography variant="caption" color="textSecondary">
                                            Capacity Utilization
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        <Chip
                                            label={`${route.capacityUtilization}%`}
                                            color={getPerformanceColor(route.capacityUtilization)}
                                            size="small"
                                        />
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={6}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <LocationIcon color="action" />
                                        <Typography variant="caption" color="textSecondary">
                                            Number of Stops
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        {route.numberOfStops}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* Stops List */}
                    <Typography variant="h6" gutterBottom>
                        Stops ({route.stops.length})
                    </Typography>
                    {route.stops.length > 0 ? (
                        <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                            {route.stops.map((stop, index) => (
                                <React.Fragment key={stop.id}>
                                    <ListItem
                                        sx={{
                                            flexDirection: 'column',
                                            alignItems: 'flex-start',
                                            py: 2,
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', width: '100%', alignItems: 'flex-start', gap: 2 }}>
                                            <ListItemIcon sx={{ minWidth: 40 }}>
                                                <Box
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        borderRadius: '50%',
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.875rem',
                                                    }}
                                                >
                                                    {stop.sequenceNumber}
                                                </Box>
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {stop.stopName}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box sx={{ mt: 1 }}>
                                                        <Typography variant="caption" display="block">
                                                            Avg Wait Time: {stop.averageWaitTime} min
                                                        </Typography>
                                                        <Typography variant="caption" display="block">
                                                            Boarding: {stop.boardingCount} | Alighting: {stop.alightingCount}
                                                        </Typography>
                                                        {stop.distanceFromPrevious > 0 && (
                                                            <Typography variant="caption" display="block" color="textSecondary">
                                                                Distance from previous: {(stop.distanceFromPrevious / 1000).toFixed(2)} km
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </Box>
                                    </ListItem>
                                    {index < route.stops.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="textSecondary">
                            No stop details available
                        </Typography>
                    )}
                </Box>

                {/* Footer Actions */}
                <Box
                    sx={{
                        p: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        gap: 2,
                    }}
                >
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => onEdit(route)}
                        fullWidth
                    >
                        Edit Route
                    </Button>
                    <Button variant="outlined" onClick={onClose} fullWidth>
                        Close
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
};

export default RouteDetailsPanel;
