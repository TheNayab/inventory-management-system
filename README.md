# Inventory Management System

A complete MERN stack (MongoDB, Express, React, Node.js) inventory management system with barcode scanner support.

## Features

- **Product Management**: Add, edit, delete, and view products with SKU, barcode, and category support
- **Sales Management**: Process sales with multiple items, support for barcode scanning
- **Barcode Scanner**: Integrated barcode scanning for quick product lookup
- **History & Reporting**: Complete transaction history with advanced filtering
- **Low Stock Alerts**: Automatic alerts for products below minimum quantity
- **Search & Filter**: Powerful search and filter capabilities across all modules

## Color Scheme

- White: #FFFFFF
- Off-white: #FAF9F6
- Light Grey: #D3D3D3
- Light Pink: #FFB6C1

## Project Structure

```
Inventory management system/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── server.js           # Express server
├── frontend/               # React frontend
│   ├── public/             # Static files
│   └── src/
│       ├── components/     # React components
│       ├── pages/          # Page components
│       ├── services/       # API services
│       ├── utils/          # Utility functions
│       └── styles/         # CSS files
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
- Copy `.env` file and update with your MongoDB connection string
- Default MongoDB URI: `mongodb://localhost:27017/inventory_management`
- Default PORT: `5000`

4. Start the backend server:
```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `GET /api/products/barcode/:barcode` - Get product by barcode
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/categories/all` - Get all categories

### Sales
- `GET /api/sales` - Get all sales (with filters)
- `GET /api/sales/:id` - Get single sale
- `POST /api/sales` - Create new sale
- `GET /api/sales/stats/summary` - Get sales statistics

## Usage

### Adding Products

1. Navigate to Products page
2. Click "Add Product" button
3. Fill in product details (name, SKU, barcode, price, quantity, etc.)
4. Click "Save Product"

### Editing Products

1. Navigate to Products page
2. Click "Edit" button on any product
3. Update product details including quantity to restock
4. Click "Update Product"

### Making a Sale

1. Navigate to Sales page
2. Click "New Sale" button
3. Add items by:
   - Searching by name, SKU, or barcode
   - Scanning barcode using the barcode scanner
4. Adjust quantities as needed
5. Select payment method
6. Click "Complete Sale"

### Viewing History

1. Navigate to History page
2. Select tab (Products or Sales)
3. Use filters to search specific records
4. View complete transaction details

## Barcode Scanner

The system uses Quagga.js for barcode scanning. Supported barcode formats:
- Code 128
- EAN
- UPC
- Code 39
- Codabar
- I2of5

To use the barcode scanner:
1. Click "Scan Barcode" button
2. Allow camera access
3. Position barcode within the frame
4. The product will be automatically added when detected

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- CORS
- dotenv

### Frontend
- React
- React Router
- Axios
- React Icons
- Quagga.js (barcode scanner)
- React DatePicker

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please create an issue in the repository.
