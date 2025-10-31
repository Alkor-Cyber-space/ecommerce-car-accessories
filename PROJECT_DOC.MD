#Project Analysis: ecommerce-car-accessories

This document provides a comprehensive overview of the `ecommerce-car-accessories` project, including its architecture, technology stack, and setup instructions.

## 1. Project Overview

This is a full-stack e-commerce application for car accessories. It consists of a Django backend providing a RESTful API and two separate React frontend applications: one for customers and another for administrators and vendors.

- **Backend**: A Django application serves product information, manages users, handles orders, payments, and more.
- **Frontend (Customer)**: A React application located in `frontend/` for users to browse products, add to cart, and make purchases.
- **Frontend (Admin/Vendor)**: A separate React application in `frontend/admin_vendor/` for managing the platform, including products, orders, users, and vendor-specific data.

## 2. Technology Stack

### Backend
- **Framework**: Django
- **API**: Django Rest Framework (DRF)
- **Authentication**: JWT (Simple JWT)
- **Database**: SQLite (development), PostgreSQL (intended for production)
- **Asynchronous Tasks**: Celery with Redis as the message broker
- **Caching**: Redis (`django-redis`)
- **Payment Gateways**: Stripe, Razorpay
- **Notifications**: Twilio (SMS), Firebase Cloud Messaging (Push Notifications)
- **API Schema/Docs**: drf-spectacular

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Styling**:
    - Customer App: Tailwind CSS, React-Bootstrap
    - Admin/Vendor App: Tailwind CSS
- **State Management**: Redux Toolkit
- **Routing**: React Router
- **API Communication**: Axios

## 3. Project Structure

```
ecommerce-car-accessories/
├── backend/
│   └── ecommerce/         # Django project root
│       ├── manage.py
│       ├── requirements.txt
│       ├── accounts/      # User management, auth
│       ├── products/      # Product catalog
│       ├── orders/        # Order processing
│       ├── payment/       # Payment integrations
│       ├── vendors/       # Vendor management
│       └── ...            # Other Django apps
├── frontend/
│   ├── src/               # Customer-facing React app
│   ├── package.json
│   └── vite.config.js
└── frontend/admin_vendor/
    ├── src/               # Admin & Vendor React app
    ├── package.json
    └── vite.config.js
```

## 4. Backend Setup & Workflow

The backend is a standard Django project with several modular applications.

- **Configuration**: Settings are managed via a `.env` file in `backend/ecommerce/`. Key settings include database credentials, `SECRET_KEY`, and API keys for external services.
- **Running the Backend**:
    1. Navigate to `backend/ecommerce/`.
    2. Create and activate a Python virtual environment.
    3. Install dependencies: `pip install -r requirements.txt`.
    4. Run database migrations: `python manage.py migrate`.
    5. Start the development server: `python manage.py runserver`. The API will be available at `http://127.0.0.1:8000`.
- **API Endpoints**: The API is built with DRF. Key endpoints likely exist for `/api/products/`, `/api/orders/`, `/api/users/`, etc. The exact routes can be found in the `urls.py` file of each Django app.

## 5. Frontend Setup & Workflow

There are two distinct frontend applications. Their development servers run independently.

- **API Communication**: The frontend apps make direct API calls to the backend. The `vite.config.js` files do **not** use a proxy, so the full backend URL (e.g., `http://127.0.0.1:8000/api/...`) must be used in `axios` requests. The Django backend is configured with `django-cors-headers` to allow these cross-origin requests during development.

### Customer App (`frontend/`)
- **Purpose**: The main storefront for customers.
- **To Run**:
    1. Navigate to `frontend/`.
    2. Install dependencies: `npm install`.
    3. Start the dev server: `npm run dev`. The app will be available at a local port (e.g., `http://localhost:5173`).

### Admin/Vendor App (`frontend/admin_vendor/`)
- **Purpose**: A dashboard for administrators and vendors to manage the platform.
- **To Run**:
    1. Navigate to `frontend/admin_vendor/`.
    2. Install dependencies: `npm install`.
    3. Start the dev server: `npm run dev`. The app will run on its own local port.
