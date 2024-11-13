import { useRouteError } from "react-router-dom";
import { Card, CardContent, Typography } from "@mui/material";

export function ErrorPage() {
    const error: any = useRouteError();

    return (
        <Card>
            <CardContent>
                <Typography variant="h3" component="div">
                    Oops
                </Typography>
                <Typography variant="h6" component="div">
                    Sorry, an unexpected error has occurred:
                </Typography>
                <Typography variant="body1" component="div">
                    <i>{error.statusText || error.message}</i>
                </Typography>
            </CardContent>
        </Card>
    );
}