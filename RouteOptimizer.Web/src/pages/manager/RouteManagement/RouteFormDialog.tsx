import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    IconButton,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Stepper,
    Step,
    StepLabel,
    Alert,
    Divider,
} from '@mui/material';
import {
    Close as CloseIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    ArrowUpward as ArrowUpIcon,
    ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import type { RouteDetails, RouteStop, Location } from '../../../types';

interface RouteFormDialogProps {
    open: boolean;
    route: RouteDetails | null;
    onClose: () => void;
    onSave: (route: RouteDetails) => void;
}

const RouteFormDialog: React.FC<RouteFormDialogProps> = ({
    open,
    route,
    onClose,
    onSave,
}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<Partial<RouteDetails>>({
        name: '',
        code: '',
        description: '',
        startPoint: '',
        endPoint: '',
        operatingHours: { start: '05:00', end: '23:00' },
        frequency: 10,
        vehicleType: 'Standard Bus',
        isActive: true,
        status: 'active',
        numberOfStops: 0,
        averageDailyPassengers: 0,
        onTimePercentage: 100,
        capacityUtilization: 0,
        estimatedTravelTime: 0,
        operationalCost: 0,
        stops: [],
        path: [],
        busStops: [],
        buses: [],
    });
    const [newStop, setNewStop] = useState<Partial<RouteStop>>({
        stopName: '',
        location: { latitude: 44.4268, longitude: 26.1025 },
        averageWaitTime: 5,
        boardingCount: 0,
        alightingCount: 0,
    });

    const steps = ['Basic Information', 'Operating Details', 'Route Stops', 'Review & Save'];

    useEffect(() => {
        if (route) {
            setFormData(route);
        } else {
            // Reset form for new route
            setFormData({
                name: '',
                code: '',
                description: '',
                startPoint: '',
                endPoint: '',
                operatingHours: { start: '05:00', end: '23:00' },
                frequency: 10,
                vehicleType: 'Standard Bus',
                isActive: true,
                status: 'active',
                numberOfStops: 0,
                averageDailyPassengers: 0,
                onTimePercentage: 100,
                capacityUtilization: 0,
                estimatedTravelTime: 0,
                operationalCost: 0,
                stops: [],
                path: [],
                busStops: [],
                buses: [],
            });
        }
        setActiveStep(0);
    }, [route, open]);

    const handleNext = () => {
        setActiveStep((prevStep) => prevStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleInputChange = (field: string, value: unknown) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleOperatingHoursChange = (field: 'start' | 'end', value: string) => {
        setFormData({
            ...formData,
            operatingHours: {
                ...formData.operatingHours!,
                [field]: value,
            },
        });
    };

    const handleAddStop = () => {
        if (!newStop.stopName) return;

        const stops = formData.stops || [];
        const newStopData: RouteStop = {
            id: stops.length + 1,
            stopId: stops.length + 100,
            stopName: newStop.stopName!,
            location: newStop.location || { latitude: 44.4268, longitude: 26.1025 },
            sequenceNumber: stops.length + 1,
            averageWaitTime: newStop.averageWaitTime || 5,
            boardingCount: newStop.boardingCount || 0,
            alightingCount: newStop.alightingCount || 0,
            distanceFromPrevious: stops.length > 0 ? 1000 : 0, // Default 1km
        };

        const updatedStops = [...stops, newStopData];
        setFormData({
            ...formData,
            stops: updatedStops,
            numberOfStops: updatedStops.length,
            path: updatedStops.map(s => [s.location.latitude, s.location.longitude] as [number, number]),
        });

        // Update start/end points
        if (updatedStops.length === 1) {
            setFormData(prev => ({ ...prev, startPoint: newStopData.stopName }));
        }
        setFormData(prev => ({ ...prev, endPoint: newStopData.stopName }));

        // Reset new stop form
        setNewStop({
            stopName: '',
            location: { latitude: 44.4268, longitude: 26.1025 },
            averageWaitTime: 5,
            boardingCount: 0,
            alightingCount: 0,
        });
    };

    const handleDeleteStop = (stopId: number) => {
        const stops = formData.stops || [];
        const updatedStops = stops
            .filter(s => s.id !== stopId)
            .map((s, index) => ({ ...s, sequenceNumber: index + 1 }));

        setFormData({
            ...formData,
            stops: updatedStops,
            numberOfStops: updatedStops.length,
            path: updatedStops.map(s => [s.location.latitude, s.location.longitude] as [number, number]),
            startPoint: updatedStops.length > 0 ? updatedStops[0].stopName : '',
            endPoint: updatedStops.length > 0 ? updatedStops[updatedStops.length - 1].stopName : '',
        });
    };

    const handleMoveStop = (stopId: number, direction: 'up' | 'down') => {
        const stops = formData.stops || [];
        const index = stops.findIndex(s => s.id === stopId);

        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === stops.length - 1)
        ) {
            return;
        }

        const newStops = [...stops];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newStops[index], newStops[targetIndex]] = [newStops[targetIndex], newStops[index]];

        // Update sequence numbers
        const updatedStops = newStops.map((s, i) => ({ ...s, sequenceNumber: i + 1 }));

        setFormData({
            ...formData,
            stops: updatedStops,
            startPoint: updatedStops[0].stopName,
            endPoint: updatedStops[updatedStops.length - 1].stopName,
        });
    };

    const calculateEstimatedTime = () => {
        const stops = formData.stops || [];
        if (stops.length === 0) return 0;

        const totalDistance = stops.reduce((sum, stop) => sum + stop.distanceFromPrevious, 0);
        const avgSpeed = 25; // km/h in city traffic
        const travelTime = (totalDistance / 1000) / avgSpeed * 60; // minutes
        const stopTime = stops.length * 2; // 2 minutes per stop

        return Math.round(travelTime + stopTime);
    };

    const handleSubmit = () => {
        const estimatedTime = calculateEstimatedTime();
        const routeData: RouteDetails = {
            ...(route || {}),
            ...formData,
            estimatedTravelTime: estimatedTime,
        } as RouteDetails;

        onSave(routeData);
    };

    const isStepValid = (step: number): boolean => {
        switch (step) {
            case 0:
                return !!(formData.name && formData.code && formData.description);
            case 1:
                return !!(
                    formData.operatingHours?.start &&
                    formData.operatingHours?.end &&
                    formData.frequency &&
                    formData.vehicleType
                );
            case 2:
                return (formData.stops?.length || 0) >= 2;
            default:
                return true;
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label="Route Name"
                                fullWidth
                                required
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="e.g., Piața Victoriei - Piața Unirii"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Route Code"
                                fullWidth
                                required
                                value={formData.code}
                                onChange={(e) => handleInputChange('code', e.target.value)}
                                placeholder="e.g., Route 1"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={formData.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    label="Status"
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                    <MenuItem value="maintenance">Under Maintenance</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                fullWidth
                                required
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                placeholder="Describe the route and its purpose"
                            />
                        </Grid>
                    </Grid>
                );
            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Start Time"
                                type="time"
                                fullWidth
                                required
                                value={formData.operatingHours?.start}
                                onChange={(e) => handleOperatingHoursChange('start', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="End Time"
                                type="time"
                                fullWidth
                                required
                                value={formData.operatingHours?.end}
                                onChange={(e) => handleOperatingHoursChange('end', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Frequency (minutes)"
                                type="number"
                                fullWidth
                                required
                                value={formData.frequency}
                                onChange={(e) => handleInputChange('frequency', parseInt(e.target.value))}
                                inputProps={{ min: 1, max: 60 }}
                                helperText="How often buses run on this route"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Vehicle Type</InputLabel>
                                <Select
                                    value={formData.vehicleType}
                                    onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                                    label="Vehicle Type"
                                >
                                    <MenuItem value="Standard Bus">Standard Bus</MenuItem>
                                    <MenuItem value="Express Bus">Express Bus</MenuItem>
                                    <MenuItem value="Articulated Bus">Articulated Bus</MenuItem>
                                    <MenuItem value="Mini Bus">Mini Bus</MenuItem>
                                    <MenuItem value="Electric Bus">Electric Bus</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Alert severity="info">
                                Based on your settings, buses will run every {formData.frequency} minutes
                                from {formData.operatingHours?.start} to {formData.operatingHours?.end}.
                            </Alert>
                        </Grid>
                    </Grid>
                );
            case 2:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Add Route Stops
                        </Typography>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Add at least 2 stops to create a route. The route will be drawn on the map
                            connecting these stops in order.
                        </Alert>

                        {/* Add Stop Form */}
                        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Stop Name"
                                        fullWidth
                                        size="small"
                                        value={newStop.stopName}
                                        onChange={(e) => setNewStop({ ...newStop, stopName: e.target.value })}
                                        placeholder="e.g., Piața Victoriei"
                                    />
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <TextField
                                        label="Latitude"
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={newStop.location?.latitude}
                                        onChange={(e) =>
                                            setNewStop({
                                                ...newStop,
                                                location: {
                                                    ...newStop.location!,
                                                    latitude: parseFloat(e.target.value),
                                                },
                                            })
                                        }
                                        inputProps={{ step: 0.0001 }}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <TextField
                                        label="Longitude"
                                        fullWidth
                                        size="small"
                                        type="number"
                                        value={newStop.location?.longitude}
                                        onChange={(e) =>
                                            setNewStop({
                                                ...newStop,
                                                location: {
                                                    ...newStop.location!,
                                                    longitude: parseFloat(e.target.value),
                                                },
                                            })
                                        }
                                        inputProps={{ step: 0.0001 }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={2}>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleAddStop}
                                        fullWidth
                                        disabled={!newStop.stopName}
                                    >
                                        Add
                                    </Button>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* Stops List */}
                        <Typography variant="subtitle2" gutterBottom>
                            Route Stops ({formData.stops?.length || 0})
                        </Typography>
                        {(formData.stops?.length || 0) === 0 ? (
                            <Alert severity="warning">No stops added yet. Add at least 2 stops.</Alert>
                        ) : (
                            <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                                {formData.stops?.map((stop, index) => (
                                    <React.Fragment key={stop.id}>
                                        <ListItem>
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
                                                    mr: 2,
                                                }}
                                            >
                                                {stop.sequenceNumber}
                                            </Box>
                                            <ListItemText
                                                primary={stop.stopName}
                                                secondary={`Lat: ${stop.location.latitude.toFixed(4)}, Lng: ${stop.location.longitude.toFixed(4)}`}
                                            />
                                            <ListItemSecondaryAction>
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    onClick={() => handleMoveStop(stop.id, 'up')}
                                                    disabled={index === 0}
                                                >
                                                    <ArrowUpIcon />
                                                </IconButton>
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    onClick={() => handleMoveStop(stop.id, 'down')}
                                                    disabled={index === (formData.stops?.length || 0) - 1}
                                                >
                                                    <ArrowDownIcon />
                                                </IconButton>
                                                <IconButton
                                                    edge="end"
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDeleteStop(stop.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItemSecondaryAction>
                                        </ListItem>
                                        {index < (formData.stops?.length || 0) - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </Box>
                );
            case 3:
                const estimatedTime = calculateEstimatedTime();
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Review Route Information
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                        Route Details
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Name:</strong> {formData.name}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Code:</strong> {formData.code}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Status:</strong> {formData.status}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Description:</strong> {formData.description}
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                        Operating Hours
                                    </Typography>
                                    <Typography variant="body2">
                                        {formData.operatingHours?.start} - {formData.operatingHours?.end}
                                    </Typography>
                                    <Typography variant="body2">
                                        Frequency: Every {formData.frequency} minutes
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                        Route Information
                                    </Typography>
                                    <Typography variant="body2">
                                        Vehicle Type: {formData.vehicleType}
                                    </Typography>
                                    <Typography variant="body2">
                                        Number of Stops: {formData.stops?.length || 0}
                                    </Typography>
                                    <Typography variant="body2">
                                        Estimated Time: {estimatedTime} minutes
                                    </Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 2 }}>
                                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                        Route Path
                                    </Typography>
                                    <Typography variant="body2">
                                        {formData.stops?.map(s => s.stopName).join(' → ')}
                                    </Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { minHeight: '600px' } }}
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                        {route ? 'Edit Route' : 'Create New Route'}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {renderStepContent(activeStep)}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'space-between', px: 3, py: 2 }}>
                <Button disabled={activeStep === 0} onClick={handleBack}>
                    Back
                </Button>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onClose}>Cancel</Button>
                    {activeStep === steps.length - 1 ? (
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!isStepValid(activeStep)}
                        >
                            {route ? 'Update Route' : 'Create Route'}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            disabled={!isStepValid(activeStep)}
                        >
                            Next
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default RouteFormDialog;
