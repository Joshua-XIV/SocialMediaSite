import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage.tsx";
import MainLayout from "./layouts/MainLayout.tsx";
import PostPage from "./pages/PostPage.tsx"
import { Toaster } from 'sonner';

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '/post/:id',element: <PostPage/>}],
  },
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors toastOptions={{style: {marginTop : '2rem'}}}/>
    </>
  )
};

export default App;
