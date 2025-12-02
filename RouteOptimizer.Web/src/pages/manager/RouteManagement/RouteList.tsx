import React, { useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Box,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    Tooltip,
    CircularProgress,
    Typography,
} from '@mui/material';
import {
    Visibility as VisibilityIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    PowerSettingsNew as PowerIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import type { RouteDetails, RouteListFilters } from '../../../types';

interface RouteListProps {
    routes: RouteDetails[];
    isLoading: boolean;
    onViewDetails: (route: RouteDetails) => void;
    onEdit: (route: RouteDetails) => void;
    onDelete: (routeId: number) => void;
    onToggleStatus: (routeId: number) => void;
}

const RouteList: React.FC<RouteListProps> = ({
    routes,
    isLoading,
    onViewDetails,
    onEdit,
    onDelete,
    onToggleStatus,
}) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [filters, setFilters] = useState<RouteListFilters>({
        status: 'all',
        searchTerm: '',
        sortBy: 'name',
        sortOrder: 'asc',
    });

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (key: keyof RouteListFilters, value: string) => {
        setFilters({ ...filters, [key]: value });
        setPage(0);
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

    const getPerformanceColor = (percentage: number) => {
        if (percentage >= 90) return 'success';
        if (percentage >= 75) return 'warning';
        return 'error';
    };

    const getUtilizationColor = (percentage: number) => {
        if (percentage >= 80) return 'success';
        if (percentage >= 60) return 'warning';
        return 'error';
    };

    // Filter and sort routes
    const filteredRoutes = routes
        .filter(route => {
            if (filters.status !== 'all' && route.status !== filters.status) {
                return false;
            }
            if (filters.searchTerm) {
                const searchLower = filters.searchTerm.toLowerCase();
                return (
                    route.name.toLowerCase().includes(searchLower) ||
                    route.code.toLowerCase().includes(searchLower) ||
                    route.startPoint.toLowerCase().includes(searchLower) ||
                    route.endPoint.toLowerCase().includes(searchLower)
                );
            }
            return true;
        })
        .sort((a, b) => {
            const order = filters.sortOrder === 'asc' ? 1 : -1;
            switch (filters.sortBy) {
                case 'name':
                    return order * a.name.localeCompare(b.name);
                case 'passengers':
                    return order * (a.averageDailyPassengers - b.averageDailyPassengers);
                case 'performance':
                    return order * (a.onTimePercentage - b.onTimePercentage);
                case 'stops':
                    return order * (a.numberOfStops - b.numberOfStops);
                default:
                    return 0;
            }
        });

    const paginatedRoutes = filteredRoutes.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    return (
        <Paper sx={{ width: '100%', mb: 2 }}>
            {/* Filters */}
            <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search routes..."
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    size="small"
                    sx={{ flexGrow: 1, minWidth: 200 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                        <MenuItem value="maintenance">Maintenance</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                        <MenuItem value="name">Sort by Name</MenuItem>
                        <MenuItem value="passengers">Sort by Passengers</MenuItem>
                        <MenuItem value="performance">Sort by Performance</MenuItem>
                        <MenuItem value="stops">Sort by Stops</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={filters.sortOrder}
                        onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    >
                        <MenuItem value="asc">Ascending</MenuItem>
                        <MenuItem value="desc">Descending</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Table */}
            <TableContainer>
                <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
                    <TableHead>
                        <TableRow>
                            <TableCell>Route ID</TableCell>
                            <TableCell>Route Name</TableCell>
                            <TableCell>Start - End</TableCell>
                            <TableCell align="center">Stops</TableCell>
                            <TableCell>Operating Hours</TableCell>
                            <TableCell align="center">Status</TableCell>
                            <TableCell align="right">Avg Daily Passengers</TableCell>
                            <TableCell align="center">On-Time %</TableCell>
                            <TableCell align="center">Capacity %</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedRoutes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center">
                                    <Typography variant="body1" color="textSecondary" sx={{ py: 4 }}>
                                        No routes found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedRoutes.map((route) => (
                                <TableRow
                                    hover
                                    key={route.id}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell>
                                        <Chip
                                            label={route.code}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {route.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>
                                                {route.startPoint}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" noWrap sx={{ maxWidth: 180 }}>
                                                → {route.endPoint}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={route.numberOfStops}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap>
                                            {route.operatingHours.start} - {route.operatingHours.end}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                                            size="small"
                                            color={getStatusColor(route.status)}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography variant="body2" fontWeight="medium">
                                            {route.averageDailyPassengers.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`${route.onTimePercentage}%`}
                                            size="small"
                                            color={getPerformanceColor(route.onTimePercentage)}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`${route.capacityUtilization}%`}
                                            size="small"
                                            color={getUtilizationColor(route.capacityUtilization)}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onViewDetails(route)}
                                                    color="primary"
                                                >
                                                    <VisibilityIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onEdit(route)}
                                                    color="info"
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={route.isActive ? "Disable" : "Enable"}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onToggleStatus(route.id)}
                                                    color={route.isActive ? "success" : "default"}
                                                >
                                                    <PowerIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDelete(route.id)}
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredRoutes.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
};

export default RouteList;
