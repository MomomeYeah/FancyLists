import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { CategoryType } from '../loaders';

export function UpdateCategoryDialog({open, handleClose, handleUpdate, category}: {open: boolean, handleClose: Function, handleUpdate: Function, category: CategoryType}) {
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
                    handleUpdate(formJson.name);
                },
            }}
        >
            <DialogTitle>Update Category</DialogTitle>
            <DialogContent>
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
                    defaultValue={category.name}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose()}>Cancel</Button>
                <Button type="submit">Update</Button>
            </DialogActions>
        </Dialog>
    );
}
