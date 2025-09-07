## Overview

`AtomTable` is a React component for displaying and interacting with real-time token pair data. It leverages [Jotai](https://jotai.org/) for atomic state management and [TanStack Query](https://tanstack.com/query/latest) for efficient data fetching and caching. The table is designed for high performance, modularity, and live updates.

### API notes:

You will have to use a no-cors extension from the chrome web store during development
`https://chromewebstore.google.com/detail/allow-cors-access-control/` - or any other extension with similar functionality.

## Approach

### 1. Atomic State Management

- **Jotai Atoms:** Each table row (token pair) is managed as a separate Jotai atom. This allows updates to individual rows without re-rendering the entire table.
- **splitAtom:** The `splitAtom` utility splits the array of pairs into individual atoms, enabling granular updates and efficient rendering.

### 2. Real-Time Data Fetching & Updates

- **atomWithQuery:** Data is fetched from the backend using `atomWithQuery`, which integrates TanStack Query with Jotai for reactive, cached queries.
- **Live Updates:** Custom hooks (`useScannerWatcher`, `usePairWatcher`) subscribe to real-time data sources (e.g., websockets or polling) and update the relevant atoms when new data arrives.
- **Reactivity:** Changes in filters or sorting update the query atom, which triggers a refetch and updates the table automatically.

### 3. Sorting, Filtering, and Pagination

- **Sorting:** Column headers are interactive and update a sort atom, which reorders the data in-place.
- **Filtering:** Filters are managed as atoms and passed to the query, ensuring the table always reflects the current filter state.
- **Pagination:** The table supports paginated data, with controls for navigating pages.

### 4. Animated & Responsive UI

- **AnimatedValue:** Numeric values are animated for smooth transitions when data changes.
- **Responsive Layout:** The table uses utility classes for sticky headers, alternating row colors, and responsive design.

## File Structure

- [`AtomTable.tsx`](src/compositions/AtomTable/AtomTable.tsx): Main table component, row rendering, and state management.
- [`components/Filters/Filters.tsx`](src/compositions/AtomTable/components/Filters/Filters.tsx): Filtering controls.
- [`components/Pagination/Pagination.tsx`](src/compositions/AtomTable/components/Pagination/Pagination.tsx): Pagination controls.
- [`utils/useScannerWatcher.ts`](src/compositions/AtomTable/utils/useScannerWatcher.ts), [`utils/usePairWatcher.ts`](src/compositions/AtomTable/utils/usePairWatcher.ts): Real-time update hooks.
