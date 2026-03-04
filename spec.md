# Legion Services

## Current State
- Full-stack ICP app with Motoko backend and React frontend
- Services: Discord Services tab (Nitro, Boosts, Decorations, Custom Bot) and Blox Fruits tab (raids, sea events, V4, leveling, etc.)
- Order form with payment options: Money, In-Game Fruits, Crypto
- Order IDs are sequential integers from the backend
- Track Order section lets users look up orders by ID
- Admin panel at /#admin

## Requested Changes (Diff)

### Add
- Random-looking order number displayed on order success screen (still backed by the real ID, but displayed with a random prefix/suffix so it looks like e.g. "LGN-4829-7X" or "#482931")
- New "Premium Services" tab/section in the services area with the following services:
  - Website Creation
  - Custom Discord Bot (already exists in Discord tab, keep there too or link)
  - Premium Role Icons
  - Server Setup & Configuration
  - Discord Server Template
  - Custom Emotes & Stickers Pack
  - Bot Hosting & Maintenance
  - Server Audit & Security Review
  - Branding Package (Logo + Banner)
  - SEO-Optimized Landing Page
- Payment methods for Premium Services: Crypto and Money only (no in-game fruits)
- Add `premiumServices` to `ServiceCategory` enum in frontend fallback data
- Update the Navbar and mobile menu to include a "Premium" nav link

### Modify
- Order success modal: display a human-friendly random order reference (e.g. "LGN-XXXX-YY") alongside or instead of the raw numeric ID
- Track order section: users still enter their numeric order ID (unchanged)
- ServicesSection: add a third tab "Premium" alongside Discord and Blox Fruits
- ServiceCard icon: use a different icon (e.g. `Gem` or `Star`) for premium services
- Fallback services array: add 10 premium services entries with IDs 18–27

### Remove
- Nothing removed

## Implementation Plan
1. Add `premiumServices` variant to `ServiceCategory` enum in frontend types (frontend only — no backend change needed since fallback is used)
2. Add 10 premium service entries (IDs 18–27) to the `fallbackServices` array in App.tsx with `acceptedPayments: [PaymentType.money, PaymentType.crypto]`
3. Generate a display order number helper: `generateDisplayId(id: bigint): string` that creates a reference like `LGN-XXXX-YY` by combining the real ID with a deterministic-but-random-looking suffix
4. Update the order success state in `OrderModal` to show the formatted display ID
5. Add "Premium Services" tab to `ServicesSection` (third tab after Discord and Blox Fruits)
6. Update `ServiceCard` to use a `Gem` icon for premium category
7. Add "Premium" nav link to `Navbar` (both desktop and mobile)
8. No backend changes required (premium services rely on fallback list)
