import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import HomePage from "./pages/HomePage.tsx";
import MainLayout from "./layouts/MainLayout.tsx";
import PostPage from "./pages/PostPage.tsx";
import CommentPage from "./pages/CommentPage.tsx";
import JobPage from "./pages/JobPage.tsx";
import CreateJobPage from "./pages/CreateJobPage.tsx";
import SearchPage from "./pages/SearchPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/post/:id", element: <PostPage /> },
      { path: "/comment/:id", element: <CommentPage /> },
      { path: "/jobs", element: <JobPage /> },
      { path: "/jobs/create", element: <CreateJobPage /> },
      { path: "/search", element: <SearchPage /> },
    ],
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        richColors
        toastOptions={{ style: { marginTop: "2rem" } }}
      />
    </>
  );
};

export default App;
