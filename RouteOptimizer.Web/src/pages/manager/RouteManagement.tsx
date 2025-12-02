import React from 'react';
import type {NotificationState} from '../../types';
import RoutesPage from './RouteManagement/RoutesPage';

interface RouteManagementProps {
    showNotification: (message: string, severity: NotificationState['severity']) => void;
}

const RouteManagement: React.FC<RouteManagementProps> = ({ showNotification }) => {
    return <RoutesPage showNotification={showNotification} />;
};

export default RouteManagement;