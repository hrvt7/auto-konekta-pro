

# Fix Onboarding Form Submission

## Root Cause
The `/onboarding` route is not wrapped in any auth guard. When the user reaches this page, the `useAuth()` hook may still be loading (`user` is `null`), so `handleSubmit` hits `if (!user) return;` and silently does nothing.

Additionally, there's no `console.error` logging to help diagnose silent failures.

## Changes

### 1. `src/pages/Onboarding.tsx`
- Add loading/auth guard at the top of the component: if `loading`, show a spinner; if no `session`, redirect to `/login`
- Add `console.error` logging for both the dealership insert and profile update errors
- The `as any` cast and form structure are already correct, no changes needed there

### 2. `src/App.tsx` (no change needed)
The onboarding route intentionally stays outside `ProtectedRoute` (since `ProtectedRoute` redirects users without a `dealership_id` to `/onboarding`, wrapping it would cause a redirect loop). The auth guard will be added directly inside `Onboarding.tsx`.

## Technical Details

In `Onboarding.tsx`, add before the return:

```typescript
const { user, refreshProfile, loading, session } = useAuth(); // add loading, session

if (loading) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

if (!session) {
  return <Navigate to="/login" replace />;
}
```

In `handleSubmit`, add `console.error` before toasts:

```typescript
if (dErr || !dealership) {
  console.error("Dealership insert error:", dErr);
  // ...existing toast
}

if (pErr) {
  console.error("Profile update error:", pErr);
  // ...existing toast
}
```

This is a small, focused fix -- two additions to one file.
