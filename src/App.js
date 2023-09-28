import './App.css';

// Import fonts
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { RouterProvider, createBrowserRouter } from "react-router-dom";

import RootLayout from './pages/RootLayout';
import Error404 from './pages/Error404';

import ApiList from './pages/ApiList';
import SubscriptionsList from './pages/SubscriptionsList';
import BillingPlansList from './pages/BillingPlansList';
import InvoicesList from './pages/InvoicesList';
import SubscribersList from './pages/SubscribersList';


const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <Error404 />,
    children: [
      { path: '/', element: <ApiList /> },
      { path: '/apis', element: <ApiList /> },
      { path: '/subscribers', element:  <SubscribersList /> },
      { path: '/subscriptions', element:  <SubscriptionsList /> },
      { path: '/billing-plans', element: <BillingPlansList /> },
      { path: '/invoices', element: <InvoicesList /> },
    ]
  }
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
