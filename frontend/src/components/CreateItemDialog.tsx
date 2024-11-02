import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { addItem } from '../loaders';

export function CreateItemDialog({open, handleClose, category}: {open: boolean, handleClose: Function, category: number}) {
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
                    addItem(category, formJson.name);
                    handleClose();
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
