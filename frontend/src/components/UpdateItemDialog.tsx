import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { ItemType } from '../loaders';

export function UpdateItemDialog({open, handleClose, handleUpdate, item}: {open: boolean, handleClose: Function, handleUpdate: Function, item: ItemType}) {
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
            <DialogTitle>Update Item</DialogTitle>
            <DialogContent>
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
                    defaultValue={item.name}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose()}>Cancel</Button>
                <Button type="submit">Update</Button>
            </DialogActions>
        </Dialog>
    );
}
