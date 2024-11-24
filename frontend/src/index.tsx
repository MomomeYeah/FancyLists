import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { AuthRoot } from './routes/auth-root';
import { Root } from './routes/root';
import { ListSummary, loader as listSummaryLoader } from './routes/list-summary';
import { FancyList, loader as listLoader } from './routes/list';
import { Login } from './routes/login';
import { ErrorPage } from './components/ErrorPage';
import reportWebVitals from './reportWebVitals';

const router = createBrowserRouter([
    {
        path: "/",
        element: <AuthRoot />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                element: <Root />,
                errorElement: <ErrorPage />,
                children: [
                    {
                        path: "/",
                        element: <ListSummary />,
                        errorElement: <ErrorPage />,
                        loader: listSummaryLoader
                    },
                    {
                        path: "lists/:listId",
                        element: <FancyList />,
                        errorElement: <ErrorPage />,
                        loader: listLoader
                    }
                ]
            },
            {
                path: "login",
                element: <Login mode={"login"} />,
                errorElement: <ErrorPage />
            },
            {
                path: "signup",
                element: <Login mode={"signup"} />,
                errorElement: <ErrorPage />
            }
        ]
    }
]);

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
