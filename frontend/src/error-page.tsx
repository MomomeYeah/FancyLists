import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import Container from '@mui/material/Container';

export default function ErrorPage() {
    const error = useRouteError();
    if (isRouteErrorResponse(error)) {
        return (
            <Container maxWidth="sm">
                <div id="error-page">
                    <h1>Oops</h1>
                    <p>Sorry, an unexpected error has occurred.</p>
                    <p>
                        <i>{error.statusText}</i>
                    </p>
                </div>
            </Container>
        );
    } else {
        console.log(error);
        return  (
            <Container maxWidth="sm">
                <div>Oops</div>
            </Container>
        )
    }
}