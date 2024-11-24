import * as React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import { ListType, updateList } from '../loaders';
import { SnackbarContextType } from '../routes/root';

export function UpdateListDialog({open, handleClose, list}: {open: boolean, handleClose: Function, list: ListType}) {
    const navigate = useNavigate();
    const context = useOutletContext() as SnackbarContextType;

    const handleCreateList = async (name: string) => {
        const APIResponse = await updateList(list.id, name);
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
                    handleCreateList(formJson.name);
                },
            }}
        >
            <DialogTitle>Update List</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    id="name"
                    name="name"
                    label="List Name"
                    type="text"
                    fullWidth
                    variant="standard"
                    defaultValue={list.name}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => handleClose()}>Cancel</Button>
                <Button type="submit">Update</Button>
            </DialogActions>
        </Dialog>
    );
}
