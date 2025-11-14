import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import type {NotificationState} from '../../types';
import Navbar from '../../components/common/Navbar';

interface RouteManagementProps {
    showNotification: (message: string, severity: NotificationState['severity']) => void;
}

const RouteManagement: React.FC<RouteManagementProps> = () => {
    return (
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Navbar />
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Route Management
                </Typography>
                <Paper sx={{ p: 3 }}>
                    <Typography variant="body1">
                        Route management functionality will be implemented here.
                    </Typography>
                </Paper>
            </Box>
        </Box>
    );
};

export default RouteManagement;