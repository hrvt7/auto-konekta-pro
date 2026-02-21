

# AutoDok — Phase 2-6: All Remaining Pages

## Overview
Build all remaining pages: Vehicles (CRUD), Customers (CRUD), Sales (6-step wizard + list + detail), Documents list, and Settings. This builds on the existing auth, onboarding, dashboard, and layout.

---

## New Files to Create

### Phase 2: Vehicles (6 files)
1. **`src/pages/Vehicles.tsx`** — List page with filter bar (brand search, status dropdown, price min/max, km max), vehicle card grid (3/2/1 cols), status badges, action menus (details, sell, edit, status change, delete), empty state
2. **`src/pages/VehicleNew.tsx`** — Multi-section form (identifiers, basics, pricing, description, image upload to Supabase storage), INSERT on save, redirect to detail
3. **`src/pages/VehicleDetail.tsx`** — Image gallery, two-column data layout, status change dropdown (with vehicle_status_log insert), "Eladas inditasa" button, tabs for status log and documents, edit link
4. **`src/pages/VehicleEdit.tsx`** — Same form as VehicleNew pre-filled, UPDATE on save
5. **`src/components/VehicleForm.tsx`** — Shared form component used by both VehicleNew and VehicleEdit (sections: identifiers, basics, price, description, images)
6. **`src/components/VehicleCard.tsx`** — Reusable vehicle card for the grid display

### Phase 3: Customers (4 files)
7. **`src/pages/Customers.tsx`** — List with name search, table (name, type badge, phone, email, purchase count, date, actions), empty state
8. **`src/pages/CustomerNew.tsx`** — Individual/company toggle form, INSERT on save
9. **`src/pages/CustomerDetail.tsx`** — Data card, purchase history table, edit button
10. **`src/pages/CustomerEdit.tsx`** — Pre-filled form, UPDATE on save
11. **`src/components/CustomerForm.tsx`** — Shared form component for new/edit

### Phase 4: Sales (3 files)
12. **`src/pages/Sales.tsx`** — List with date/status filters, table with document count column
13. **`src/pages/SaleNew.tsx`** — 6-step wizard with step indicator:
    - Step 1: Vehicle selection (searchable, or pre-selected from URL param)
    - Step 2: Customer selection (search existing or inline create)
    - Step 3: Operator checkbox + optional form
    - Step 4: Transaction data (price, price text, payment, dates, mileage, trust)
    - Step 5: Two witness forms
    - Step 6: Summary cards + document checkboxes + "Szerzodes generálása" button
    - On submit: INSERT sales + witnesses, UPDATE vehicle status, INSERT documents, POST webhook, redirect
14. **`src/pages/SaleDetail.tsx`** — Vehicle/customer/transaction cards, documents list with download, regenerate button, cancel button

### Phase 5: Documents (1 file)
15. **`src/pages/Documents.tsx`** — List all documents, filters by type and date, status badges, download buttons

### Phase 6: Settings (1 file)
16. **`src/pages/Settings.tsx`** — Dealership data edit form (same toggle as onboarding, pre-filled), UPDATE on save

### Updated Files
17. **`src/App.tsx`** — Add all new routes inside the DashboardLayout protected wrapper
18. **`src/lib/format.ts`** — Update doc_type keys to match db values ('adasveteli', 'uzembentartoi', 'meghatalmazas', 'atadas_atveteli'), add `formatDate()` helper for Hungarian date format
19. **`.env`** — Add `VITE_MAKE_WEBHOOK_URL`

---

## Technical Details

### Routing (App.tsx changes)
All new routes nested inside the existing `ProtectedRoute > DashboardLayout` wrapper:
- `/vehicles`, `/vehicles/new`, `/vehicles/:id`, `/vehicles/:id/edit`
- `/customers`, `/customers/new`, `/customers/:id`, `/customers/:id/edit`
- `/sales`, `/sales/new`, `/sales/:id`
- `/documents`
- `/settings`

### Image Upload (VehicleForm)
- Drag & drop zone using native file input with drag events
- Upload to Supabase Storage bucket `vehicle-images` (already exists, public)
- Path: `{dealership_id}/{vehicle_id}/{filename}`
- After upload, INSERT into `vehicle_images` table
- Display thumbnails with delete capability
- First uploaded image marked as `is_primary = true`

### Vehicle Status Changes
- On status change via dropdown: UPDATE `vehicles.status` + INSERT into `vehicle_status_log` with old_status, new_status, changed_by (user id), timestamp

### Sales Wizard State Management
- Local React state (useState) for all 6 steps
- Step validation before proceeding (required fields checked per step)
- On final submit (Step 6):
  1. INSERT into `sales` table
  2. INSERT 2 rows into `witnesses`
  3. UPDATE `vehicles` status to 'sold' + log entry
  4. INSERT into `documents` for each selected doc type (status='pending')
  5. POST to `import.meta.env.VITE_MAKE_WEBHOOK_URL` with `{ sale_id }`
  6. Toast + redirect to `/sales/:id`

### Document Type Keys
Updating `format.ts` to use these db-stored values:
- `adasveteli` = "Adasveteli szerzodes"
- `uzembentartoi` = "Uzembentartoi szerzodes"
- `meghatalmazas` = "Meghatalmazas"
- `atadas_atveteli` = "Atadas-atveteli elismerveny"

### Consistent Patterns
- All list pages: skeleton loading, empty states with icon + CTA, toast on errors
- All forms: loading state on submit button, success toast, error toast
- All detail pages: back link, skeleton loading
- Hungarian formatting for all numbers, dates, and status labels
- Mobile responsive: cards stack, tables scroll horizontally
- Bottom nav padding (`pb-20 lg:pb-0`) on all pages

### Webhook Integration
- Store `VITE_MAKE_WEBHOOK_URL=https://hook.eu1.make.com/1a4nzs1tdtnx67lq7nl2g4lp7prlevfv` in `.env`
- Called from the SaleNew page on final submission
- Also callable from SaleDetail "Dokumentumok ujrageneralasa" button

### No Database Changes Required
All tables already exist with the correct schema. No migrations needed.

