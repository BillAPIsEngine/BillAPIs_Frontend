import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
  

  

const SubscribersList = () => {

    const rows = [
        ['John Doe', 'MyPizza', '2', '1', '1', '$100.00'],
        ['Jane Doe', 'LocalWether', '3', '6', '2', '$200.00'],
      ];


    return(
        <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Subscriber Name</TableCell>
              <TableCell align="right">Organization</TableCell>
              <TableCell align="right">APIs</TableCell>
              <TableCell align="right">Applicatios</TableCell>
              <TableCell align="right">Subscriptions</TableCell>
              <TableCell align="right">Total revenue</TableCell>
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
                <TableCell align="right">{row[5]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
}

export default SubscribersList;