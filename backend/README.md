# Skill Trader Hub - Python Backend

This backend executes the core "Quant Engine" logic, including data ingestion, storage, and backtesting.

## 🏗 Architecture
- **Framework:** FastAPI (High-performance Async I/O)
- **Database:** PostgreSQL (Time-series data storage)
- **Data Source:** Binance (via `ccxt`)
- **Engine:** Pandas-based Vectorized Backtester

## 🚀 Setup Instructions

### 1. Prerequisites
- Python 3.9+
- PostgreSQL (Local or Docker)

### 2. Environment Setup
Create a virtual environment:
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

### 3. Database Configuration
Ensure PostgreSQL is running. Create a database named `skilltrader`.
Update `.env` file (create one if not exists) with your credentials:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=skilltrader
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

Initialize the Database Schema:
(The `data_loader.py` script will automatically create the table/schema if it doesn't exist, provided the DB itself exists).

### 4. Ingest Historical Data
Run the data loader to fetch 1 year of 1h candles for BTC/USDT and ETH/USDT:
```bash
python data_loader.py
```
*Note: This script connects to Binance Public API. Rate limits are handled automatically.*

### 5. Run the Server
Start the FastAPI server:
```bash
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.
Docs: `http://localhost:8000/docs`

## 🔗 Frontend Integration Guide

1. **Install Axios** in your React project:
   ```bash
   npm install axios
   ```

2. **Use the `src/lib/api.ts` helper** created for you.

3. **Replace Mock Data Calls**:
   - Instead of `generateOHLCData()`, use `await fetchMarketData('BTC/USDT')`.
   - Instead of `runMockBacktest()`, use `await runBacktest(strategyConfig)`.

### Example React Component Update:
```tsx
import { useEffect, useState } from 'react';
import { fetchMarketData } from '../lib/api';

const ChartComponent = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchMarketData('BTC/USDT').then(setData);
  }, []);

  // ... render chart
}
```
