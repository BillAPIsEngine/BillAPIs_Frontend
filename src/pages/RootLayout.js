import { Outlet } from "react-router-dom";

import { Container, Grid } from '@mui/material';

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

const RootLayout = () => {

    return (
        <>
            <Grid container spacing={2} style={{ height: '100vh' }}>
                <Grid item xs={12} >
                    <Header />
                </Grid>
                <Grid item md={2} style={{ height: '100%', backgroundColor: '#f2f2f2' }}>
                    <Sidebar />
                </Grid>
                <Grid item md={10}>
                    <Container>
                        <Outlet/>
                    </Container>
                </Grid>
            </Grid>
        </>
    );

}

export default RootLayout;