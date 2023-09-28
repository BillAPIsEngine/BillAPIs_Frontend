import { NavLink } from 'react-router-dom';

import { List, ListItem, ListItemText, ListItemButton, ListItemIcon } from '@mui/material';

import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';

const Sidebar = () => {
    return (
        <>
            <List>
                <ListItem>
                    <ListItemButton component={NavLink} to={'/apis'}>
                        <ListItemIcon>
                            <RocketLaunchIcon />
                        </ListItemIcon>
                        {/* <NavLink to="/apis"> */}
                            <ListItemText primary="APIs" />
                        {/* </NavLink> */}
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={NavLink} to={'/subscribers'}>
                        <ListItemIcon>
                            <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary="Subscribers" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={NavLink} to={'/subscriptions'}>
                        <ListItemIcon>
                            <SubscriptionsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Subscriptions" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={NavLink} to={'/billing-plans'}>
                        <ListItemIcon>
                            <RequestQuoteIcon />
                        </ListItemIcon>
                        <ListItemText primary="Billing plans" />
                    </ListItemButton>
                </ListItem>
                <ListItem>
                    <ListItemButton component={NavLink} to={'/invoices'}>
                        <ListItemIcon>
                            <ReceiptIcon />
                        </ListItemIcon>
                        <ListItemText primary="Invoices" />
                    </ListItemButton>
                </ListItem>
            </List>
        </>
    );
}


export default Sidebar;