# Frontend Configuration

## Environment Variables

The frontend uses environment variables to configure the backend API base URL.

### Development (.env)
```
REACT_APP_API_BASE_URL=http://localhost:8000
```

### Production (env.production)
```
REACT_APP_API_URL=https://mhcqms-backend.onrender.com
```

## API Configuration

The application uses a centralized API configuration system:

- **`src/config/api.js`** - Contains API endpoints and base URL configuration
- **`src/utils/api.js`** - Provides utility functions for making API calls

### Usage Examples

```javascript
import {getApiUrl} from '../config/api';
import {apiCall} from '../utils/api';

// Using getApiUrl directly
const response = await axios.get(getApiUrl('/patients'));

// Using apiCall utility
const patients = await apiCall('GET', '/patients');
const newPatient = await apiCall('POST', '/patients/register', patientData);
```

## Switching Environments

- **Development**: Uses `.env` file with localhost backend
- **Production**: Uses `env.production` file with Render backend
- **Build**: Environment variables are embedded during build time

## Notes

- All API calls automatically include authentication headers if token exists
- 401 responses automatically redirect to login page
- API timeout is set to 10 seconds
- Environment variables must start with `REACT_APP_` to be accessible in React
