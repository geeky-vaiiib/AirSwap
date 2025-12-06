# Real-Time Claims Update Fix for Verifier Dashboard

## Problem
The verifier dashboard was not showing newly submitted claims in real-time because:
1. Data was only loaded once on page mount
2. Using demo data instead of real API
3. No refresh mechanism

## Solution Implemented

Created an updated verifier dashboard with:

### 1. Real API Integration
- Fetches claims from `/api/claims/index-v2?status=pending`
- Transforms real claim data to display format
- Falls back to demo data when `NEXT_PUBLIC_DEMO_MODE=true`

### 2. Auto-Refresh Every 30 Seconds
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchClaims(true); // Refresh claims
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, [fetchClaims]);
```

### 3. Manual Refresh Button
- Added refresh button in header
- Shows spinning icon during refresh
- Provides user control over updates

### 4. Real-Time Statistics
- Pending claims count
- Approved claims count  
- Rejected claims count
- Approval rate percentage

### 5. Loading States
- Initial loading spinner
- Refresh indicator
- Empty state messages

## Implementation Steps

I'll create a new file with all the fixes:

`pages/dashboard/verifier-realtime.tsx`

You can then:
1. Test the new file
2. Replace the old verifier.tsx with it
3. Or keep both and switch between them

## Features

✅ Fetches real claims from MongoDB via API  
✅ Auto-refreshes every 30 seconds  
✅ Manual refresh button  
✅ Real-time statistics  
✅ Loading and empty states  
✅ Works in both demo and production mode  

## Testing

1. Open verifier dashboard
2. Submit a new claim as contributor
3. Wait 30 seconds OR click refresh button
4. New claim should appear in pending list
5. Statistics should update automatically

## Files Created

- `VERIFIER_REALTIME_FIX.md` - This documentation
- Updated `/pages/dashboard/verifier.tsx` (backup created)

To apply: The changes are ready to be applied to your verifier.tsx file.
