# Appointment Booking App

A full-stack appointment booking platform built with Next.js and Firebase, consisting of three connected applications:

- **Client App** — customers browse businesses, view services, and book appointments
- **Business Admin App** — business owners manage their listing, services, and availability
- **Store Admin App** — individual stores log in to view bookings, edit their details, and set availability

## Tech Stack
- Next.js 15
- Firebase (Firestore, Authentication-style custom login)
- TypeScript
- Tailwind CSS
- React Hook Form

## Features
- Business listings with images, services, and pricing
- Interactive map with business location (Leaflet)
- Appointment booking with date/time slot selection
- Email confirmation on booking (Resend)
- SMS confirmation (Twilio)
- Admin dashboards for managing businesses and appointments

## Setup
1. Clone the repo
2. Run `pnpm install` (or `npm install`)
3. Create a `.env.local` file with your Firebase config (see `.env.example` if provided)
4. Run `pnpm dev`
