import * as React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { addItem } from '../loaders';
import { SnackbarContextType } from '../routes/root';

export function CreateItemDialog({open, handleClose, category}: {open: boolean, handleClose: Function, category: number}) {
    const navigate = useNavigate();
    const context = useOutletContext() as SnackbarContextType;

    const handleCreateItem = async (name: string) => {
        const APIResponse = await addItem(category, name);
        if ( APIResponse.success ) {
            navigate(0);
        } else {
            context.setSnackBarError(APIResponse.error);
        }
    }

    return (
        <Dialog
            open={open}
            onClose={() => handleClose()}
            disableRestoreFocus={true}
            PaperProps={{
                component: 'form',
                onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const formJson = Object.fromEntries((formData as any).entries());
                    handleCreateItem(formJson.name);
                },
            }}
        >
            <DialogTitle>Create Item</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Enter a name for the item
                </DialogContentText>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="name"
                    label="Item Name"
                    type="text"
                    fullWidth
                    variant="standard"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose()}>Cancel</Button>
                <Button type="submit">Create</Button>
            </DialogActions>
        </Dialog>
    );
}
