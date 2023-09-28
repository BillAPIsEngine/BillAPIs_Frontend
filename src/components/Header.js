import { useState } from 'react';

import { AppBar, Toolbar, Typography, Button, Tooltip, Box, Menu, MenuItem } from '@mui/material';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';


const Header = () => {

    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static">
            <Toolbar sx={{ justifyContent: 'flex-start' }}>
                <Typography variant="h6" component="div" sx={{ marginRight: '1rem' }}>
                    API Monetization Engine
                </Typography>
                <Box sx={{ flexGrow: 0, marginLeft: 'auto' }}>
                    <Tooltip title="Open settings">
                        <Button color="inherit" onClick={handleClick}>
                            Admin <ArrowDropDownIcon />
                        </Button>
                    </Tooltip>

                    {/* This menu will show up when the user clicks the above button */}
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={handleClose}>Profile</MenuItem>
                        <MenuItem onClick={handleClose}>Logout</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;