import { createBrowserRouter, RouterProvider, Navigate, Outlet, useRouteError, useNavigate } from "react-router-dom";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Layout from "./components/layout/Layout";
import AgentsPage from "./pages/AgentsPage";
import RoomsPage from "./pages/RoomsPage";
import RoomDetailPage from "./pages/RoomDetailPage";
import ConversationPage from "./pages/ConversationPage";

function RootLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function RouteError() {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="rounded-full bg-red-500/10 p-4 mb-6">
        <AlertTriangle className="h-10 w-10 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-star-white mb-2">Something went wrong</h2>
      <p className="text-sm text-nebula-300 max-w-md mb-2">
        {error?.message || "An unexpected error occurred."}
      </p>
      {error?.stack && (
        <pre className="text-xs text-nebula-500 max-w-lg overflow-auto max-h-32 mb-6 text-left bg-nebula-800/50 rounded-lg p-3 border border-nebula-600/20">
          {error.stack.split("\n").slice(0, 5).join("\n")}
        </pre>
      )}
      <div className="flex gap-3">
        <button
          onClick={() => navigate(0)}
          className="flex items-center gap-2 rounded-lg border border-nebula-500/30 px-4 py-2 text-sm text-nebula-200 hover:bg-nebula-600/50"
        >
          <RotateCcw className="h-4 w-4" />
          Retry
        </button>
        <button
          onClick={() => navigate("/rooms")}
          className="flex items-center gap-2 rounded-lg bg-cosmic-purple px-4 py-2 text-sm font-medium text-white hover:bg-cosmic-purple/80"
        >
          <Home className="h-4 w-4" />
          Go to Rooms
        </button>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: (
      <Layout>
        <RouteError />
      </Layout>
    ),
    children: [
      { path: "/", element: <Navigate to="/rooms" replace /> },
      { path: "/agents", element: <AgentsPage />, errorElement: <RouteError /> },
      { path: "/rooms", element: <RoomsPage />, errorElement: <RouteError /> },
      { path: "/rooms/:id", element: <RoomDetailPage />, errorElement: <RouteError /> },
      { path: "/rooms/:id/conversation", element: <ConversationPage />, errorElement: <RouteError /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
