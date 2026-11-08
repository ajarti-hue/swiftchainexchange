# Roadmap

- [x] Rename site to Swift Trade Hub
- [x] Flight booking: confirmation step summarizing details before WhatsApp/Telegram send
- [ ] Real-time flight availability + prices via Duffel API on flight booking page
  - Needs DUFFEL_API_KEY from user (duffel.com dashboard)
  - Edge function: create offer request, return offers (price, airline, times)
  - UI: search results list on /flights, fallback to WhatsApp manual flow
