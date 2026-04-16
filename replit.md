# SpeedUp Delivery Platform

## Overview
A mobile-first delivery platform built for Ghana (Accra and other cities). The app supports multiple user roles: customers, riders, merchants, ambassadors, and admins. It includes local delivery ordering, international DHL shipping, Paystack payments, real-time order tracking, and a wallet/earnings system.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite (port 5000)
- **Backend/Auth/Database**: Supabase (external hosted at `stvceqozldcoeaotsinf.supabase.co`)
- **Mobile**: Capacitor (Android target)
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query (server state) + React Context (auth, country)
- **Routing**: React Router DOM v6

## Key Features
- Customer ordering from local stores (food, groceries, electronics, pharmacy)
- Rider delivery management with bidding system
- Merchant store/product management
- International DHL shipping integration
- Paystack payment processing (MoMo, card, wallet)
- Real-time order tracking with Mapbox
- Ambassador referral program
- In-app messaging between customers and riders
- Push notifications via Capacitor

## Environment Variables
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` — Supabase anon/public key
- `VITE_SUPABASE_PROJECT_ID` — Supabase project ID

## Supabase Edge Functions (hosted on Supabase)
The following edge functions are deployed to Supabase and called from the frontend:
- `process-payment` — Paystack payment initialization
- `verify-payment` — Paystack payment verification
- `paystack-webhook` — Paystack webhook handler
- `create-subaccount` — Create Paystack rider subaccount
- `list-banks` — List Ghana banks via Paystack
- `verify-bank-account` — Verify bank account via Paystack
- `dhl-rate-quote` — DHL shipping rate quotes
- `dhl-create-shipment` — Create DHL shipment
- `dhl-service-points` — Find DHL service points
- `dhl-tracking` — Track DHL shipments
- `get-mapbox-token` — Serve Mapbox token securely
- `mapbox-geocode` — Geocoding via Mapbox
- `merchant-ai` — AI assistant for merchants

## Running the App
```bash
npm run dev
```
App runs on port 5000.

## Database
The app uses Supabase (PostgreSQL) with Row Level Security (RLS). All migrations are in `supabase/migrations/`. The schema includes: profiles, stores, products, orders, order_items, wallets, transactions, rider_locations, notifications, ratings, withdrawal_requests, shipments, bids, messages, and ambassador tables.

## User Roles
- `customer` — Place orders, track deliveries
- `rider` — Accept/complete deliveries, manage earnings  
- `merchant` — Manage stores and products
- `ambassador` — Referral program, earn commissions
- `admin` — Full platform management
