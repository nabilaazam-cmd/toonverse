import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import HomePlaceholder from '../features/discover/HomePlaceholder.jsx';

// The list of pages in the app: each entry links an address to the screen it shows.
// This is a "data router" (createBrowserRouter), which React Router's blocker needs
// for the unsaved-work warning in task 8.12. Later tasks add their routes here.
const router = createBrowserRouter([{ path: '/', element: <HomePlaceholder /> }]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
