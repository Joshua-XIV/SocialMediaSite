import { Route, RouterProvider, createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage.tsx'
import MainLayout from '../layouts/MainLayout.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {index: true,element: <HomePage />}
    ]
  }
]);

const App = () => {
  return (
    <RouterProvider router={router}/>
  )
}

export default App