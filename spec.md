# Legion Services

## Current State
Full-stack app with Motoko backend and React frontend. Backend stores services and orders. Services section is broken — `getAvailableServices()` and `getAllServices()` call `.sort()` without a comparator argument, causing a runtime trap. The frontend falls back to hardcoded services when the backend fails, but services never load from the live backend.

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- Fix `getAllServices()`, `getAvailableServices()`, `getServicesByCategory()`, `getAllOrders()`, `getOrdersByStatus()` to pass the correct comparator to `.sort()` so queries succeed and services load from the live backend.

### Remove
- Nothing

## Implementation Plan
1. Regenerate Motoko backend with correct `.sort(Service.compare)` and `.sort(OrderCompare.compare)` calls in all query functions.
