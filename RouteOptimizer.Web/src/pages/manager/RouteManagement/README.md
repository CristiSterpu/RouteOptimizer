# Route Management Components

This directory contains all components for the Routes Management feature of the RouteOptimizer application.

## Components Overview

### RoutesPage.tsx
The main container component that orchestrates all route management functionality.

**Props**:
- `showNotification`: Function to display notifications

**State Management**:
- Routes list
- Selected route for details
- Form dialog state
- Tab navigation state

**Key Features**:
- Tab-based navigation between list and map views
- Handles all CRUD operations for routes
- Sample data for Bucharest routes

### RouteList.tsx
Table view component displaying all routes with filters and actions.

**Props**:
- `routes`: Array of route details
- `isLoading`: Loading state
- `onViewDetails`: Callback for viewing route details
- `onEdit`: Callback for editing a route
- `onDelete`: Callback for deleting a route
- `onToggleStatus`: Callback for toggling route active status

**Features**:
- Search by route name, code, or location
- Filter by status (active, inactive, maintenance)
- Sort by multiple fields (name, passengers, performance, stops)
- Color-coded performance indicators
- Pagination with configurable rows per page

### RouteMapView.tsx
Map visualization component showing routes and real-time bus positions.

**Props**:
- `routes`: Array of route details
- `onRouteClick`: Callback when a route is clicked

**Features**:
- Toggle layers (routes, stops, real-time buses)
- Route selection checkboxes
- Color-coded routes
- Simulated real-time bus positions (updates every 5s)
- Legend
- Ready for Leaflet integration

**Note**: Currently uses a simulated map. To enable full map functionality:
```bash
npm install leaflet react-leaflet @types/leaflet
```

### RouteDetailsPanel.tsx
Drawer component showing comprehensive route information.

**Props**:
- `route`: Route details object or null
- `open`: Boolean to control drawer visibility
- `onClose`: Callback to close the drawer
- `onEdit`: Callback to edit the route

**Displays**:
- Basic route information
- Operating hours and frequency
- Performance metrics (passengers, on-time %, capacity)
- Detailed stops list with statistics
- Quick actions (Edit, Close)

### RouteFormDialog.tsx
Multi-step wizard dialog for creating and editing routes.

**Props**:
- `open`: Boolean to control dialog visibility
- `route`: Route to edit (null for new route)
- `onClose`: Callback to close the dialog
- `onSave`: Callback with route data when saved

**Steps**:
1. **Basic Information**: Name, code, status, description
2. **Operating Details**: Hours, frequency, vehicle type
3. **Route Stops**: Interactive builder to add/reorder stops
4. **Review**: Summary before saving

**Features**:
- Step validation
- Add/remove/reorder stops
- Automatic travel time calculation
- Coordinate input for stop locations
- Preview of route path

## Usage Examples

### Basic Usage
```tsx
import { RoutesPage } from './RouteManagement';

function App() {
  const handleNotification = (message: string, severity: 'success' | 'error') => {
    console.log(message);
  };

  return <RoutesPage showNotification={handleNotification} />;
}
```

### Using Individual Components
```tsx
import { RouteList, RouteDetailsPanel } from './RouteManagement';

function MyRouteView() {
  const [routes, setRoutes] = useState<RouteDetails[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  return (
    <>
      <RouteList
        routes={routes}
        isLoading={false}
        onViewDetails={(route) => {
          setSelectedRoute(route);
          setIsDetailsOpen(true);
        }}
        onEdit={(route) => console.log('Edit', route)}
        onDelete={(id) => console.log('Delete', id)}
        onToggleStatus={(id) => console.log('Toggle', id)}
      />

      <RouteDetailsPanel
        route={selectedRoute}
        open={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={(route) => console.log('Edit', route)}
      />
    </>
  );
}
```

## Sample Data Structure

```typescript
const sampleRoute: RouteDetails = {
  id: 1,
  name: 'Piața Victoriei - Piața Unirii',
  code: 'Route 1',
  description: 'Main route connecting central landmarks',
  isActive: true,
  operationalCost: 5000,
  estimatedTravelTime: 25,
  startPoint: 'Piața Victoriei',
  endPoint: 'Piața Unirii',
  numberOfStops: 4,
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
    // ... more stops
  ],
  path: [
    [44.4518, 26.0828],
    [44.4443, 26.0959],
    // ... more coordinates
  ],
  busStops: [],
  buses: [],
};
```

## Customization

### Changing Colors
Update the color helper functions in each component:
```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'default';
    case 'maintenance': return 'warning';
    default: return 'default';
  }
};
```

### Modifying Performance Thresholds
```typescript
const getPerformanceColor = (percentage: number) => {
  if (percentage >= 90) return 'success'; // Change threshold here
  if (percentage >= 75) return 'warning';
  return 'error';
};
```

### Adding New Filters
Add to the `RouteListFilters` type in `types/index.ts`:
```typescript
export interface RouteListFilters {
  status?: 'active' | 'inactive' | 'maintenance' | 'all';
  searchTerm?: string;
  sortBy?: 'name' | 'passengers' | 'performance' | 'stops';
  sortOrder?: 'asc' | 'desc';
  // Add new filters:
  vehicleType?: string;
  minPassengers?: number;
}
```

## API Integration

Replace sample data with real API calls:

```typescript
// In RoutesPage.tsx
const loadRoutes = async () => {
  setIsLoading(true);
  try {
    const response = await fetch('/api/routes');
    const data = await response.json();
    setRoutes(data);
  } catch (error) {
    console.error('Failed to load routes:', error);
    showNotification('Failed to load routes', 'error');
  } finally {
    setIsLoading(false);
  }
};

const handleSaveRoute = async (routeData: RouteDetails) => {
  try {
    const url = editingRoute
      ? `/api/routes/${editingRoute.id}`
      : '/api/routes';
    const method = editingRoute ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routeData),
    });

    if (!response.ok) throw new Error('Failed to save route');

    await loadRoutes(); // Refresh list
    showNotification('Route saved successfully', 'success');
  } catch (error) {
    console.error('Failed to save route:', error);
    showNotification('Failed to save route', 'error');
  }
};
```

## Performance Tips

1. **Memoization**: Use `useMemo` for filtered/sorted data
```tsx
const filteredRoutes = useMemo(() =>
  routes.filter(/* ... */),
  [routes, filters]
);
```

2. **Virtual Scrolling**: For large datasets, consider `react-window`
```bash
npm install react-window
```

3. **Debounced Search**: Implement debouncing for search input
```tsx
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((term) => setFilters({ ...filters, searchTerm: term }), 300),
  []
);
```

## Testing

Example test for RouteList component:
```tsx
import { render, screen } from '@testing-library/react';
import RouteList from './RouteList';

test('renders route list with routes', () => {
  const routes = [/* sample routes */];
  render(
    <RouteList
      routes={routes}
      isLoading={false}
      onViewDetails={() => {}}
      onEdit={() => {}}
      onDelete={() => {}}
      onToggleStatus={() => {}}
    />
  );

  expect(screen.getByText('Route 1')).toBeInTheDocument();
});
```

## Troubleshooting

### Routes not displaying
- Check that routes array is properly populated
- Verify TypeScript types match the data structure
- Check console for errors

### Map not showing
- Ensure RouteMapView component is rendered in the Map View tab
- Check that routes have valid path coordinates
- For full map functionality, install Leaflet

### Form validation errors
- Ensure all required fields are filled in each step
- Check that coordinates are valid numbers
- Verify that at least 2 stops are added before proceeding

## Contributing

When adding new features:
1. Update type definitions in `types/index.ts`
2. Add new props with proper TypeScript types
3. Update this README with usage examples
4. Add comments for complex logic
5. Follow existing code style and conventions
