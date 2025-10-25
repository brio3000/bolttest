// App.tsx
import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Lazy-load your Management screen (or replace with a direct import)
const Management = lazy(() => import("./screens/Management"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-4">Loading…</div>}>
        <Routes>
          {/* Redirect root to /management */}
          <Route path="/" element={<Navigate to="/management" replace />} />

          {/* Management screen */}
          <Route path="/management" element={<Management />} />

          {/* Optional: catch-all -> Management (or a 404 page if you prefer) */}
          <Route path="*" element={<Navigate to="/management" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}