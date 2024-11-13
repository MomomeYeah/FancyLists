import * as React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { addCategory } from '../loaders';
import { SnackbarContextType } from '../routes/root';

export function CreateCategoryDialog({open, handleClose, list}: {open: boolean, handleClose: Function, list: number}) {
    const navigate = useNavigate();
    const context = useOutletContext() as SnackbarContextType;

    const handleCreateCategory = async (name: string) => {
        const APIResponse = await addCategory(list, name);
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
                    handleCreateCategory(formJson.name);
                },
            }}
        >
            <DialogTitle>Create Category</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Enter a name for the category
                </DialogContentText>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="name"
                    label="Category Name"
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
