# Feature Implementation Task Template

This template provides a structured approach for adding new features to the `ecommerce-car-accessories` project. Following these steps ensures that all aspects of the stack, from the database to the UI, are addressed.

## 1. Feature Details

- **Feature Name**: `[Enter a concise name for the feature]`
- **User Story / Goal**: `[Describe the feature from a user's perspective. What is the goal? e.g., "As a user, I want to be able to leave reviews on products so that I can share my feedback."]`
- **Affected Applications**: `[List the apps affected, e.g., Backend (products), Frontend (Customer)]`

---

## 2. Backend Implementation (Django)

*If the feature is frontend-only, skip this section.*

### ☐ Models (`models.py`)
- [ ] **Analyze**: Does this feature require new database tables or modifications to existing ones?
- **Action**: Define or update Django models in the relevant app (e.g., `products/models.py`).

### ☐ Serializers (`serializers.py`)
- [ ] **Analyze**: How will the model data be converted to JSON for the API?
- **Action**: Create or update DRF serializers. Include fields for both reading and writing data.

### ☐ Views (`views.py`)
- [ ] **Analyze**: What API endpoints are needed? (e.g., `GET`, `POST`, `PUT`, `DELETE`)
- **Action**: Create or update DRF `APIView` or `ViewSet` classes. Implement business logic, permissions, and connect models and serializers.

### ☐ URLs (`urls.py`)
- [ ] **Analyze**: What are the URL paths for the new endpoints?
- **Action**: Register the new views with URL patterns in the appropriate `urls.py` file.

### ☐ Database Migrations
- [ ] **Action**: Generate migration files: `python backend/ecommerce/manage.py makemigrations`.
- [ ] **Action**: Apply migrations to the database: `python backend/ecommerce/manage.py migrate`.

### ☐ Testing
- [ ] **Action**: Test the new API endpoints manually or write automated tests to verify functionality, permissions, and error handling.

---

## 3. Frontend Implementation (React)

*If the feature is backend-only, skip this section.*

### ☐ State Management (`@reduxjs/toolkit`)
- [ ] **Analyze**: Does the feature's data need to be stored in the global state?
- **Action**: Create a new slice or update an existing one. Define the initial state, reducers, and async thunks (`createAsyncThunk`) for interacting with the backend API.

### ☐ API Services (`axios`)
- [ ] **Analyze**: What functions are needed to call the new backend endpoints?
- **Action**: Add new functions to the relevant API service file (e.g., `src/services/productApi.js`). These functions will be used by the Redux async thunks.

### ☐ Routing (`react-router-dom`)
- [ ] **Analyze**: Does this feature require new pages or routes?
- **Action**: Add new `<Route>` components to the main router setup (e.g., `App.jsx`).

### ☐ Components & Pages
- [ ] **Analyze**: What new UI components or pages are needed to support this feature?
- **Action**: Create new `.jsx` files for pages and components. Structure them logically within the `src/pages` and `src/components` directories.

### ☐ UI & Styling (`Tailwind CSS`)
- [ ] **Analyze**: How should the new components and pages look?
- **Action**: Implement the UI using React components and style them with Tailwind CSS utility classes. Ensure the design is responsive and consistent with the existing application.

### ☐ Integration
- [ ] **Action**: Connect the new components to the Redux store using `useSelector` to read data and `useDispatch` to trigger actions (async thunks).

### ☐ Testing
- [ ] **Action**: Manually test the complete user flow in the browser. Verify that data is fetched correctly, state is updated, and the UI behaves as expected.

---

## 4. Final Checklist

- [ ] **Backend**: All backend changes are complete and tested.
- [ ] **Frontend**: All frontend changes are complete and tested.
- [ ] **End-to-End**: The feature works seamlessly from the UI to the database.
- [ ] **Code Quality**: Code adheres to project conventions and best practices.
- [ ] **Documentation**: `PROJECT_DOC.MD` or other relevant docs are updated if necessary.
