import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';




const InvoicesList = () => {

    const rows = [
        ['2023-06-30', 'John Doe', 'Pizza Factory', 'free', '$0'],
        ['2023-05-30', 'Robin Hood', 'MyTaxi', 'PAYG', '$100'],
        ['2023-04-30', 'Peter Pan', 'Accuwether', 'Fixed', '$500'],
    ];


    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell align="right">Subscriber name</TableCell>
                        <TableCell align="right">Company name</TableCell>
                        <TableCell align="right">Pricing model</TableCell>
                        <TableCell align="right">Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row[0]}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            hover={true}
                        >
                            <TableCell component="th" scope="row">
                                {row[0]}
                            </TableCell>
                            <TableCell align="right">{row[1]}</TableCell>
                            <TableCell align="right">{row[2]}</TableCell>
                            <TableCell align="right">{row[3]}</TableCell>
                            <TableCell align="right">{row[4]}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default InvoicesList;