import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import systemConfig from '../config'


const ApiList = () => {

  const [loading, setLoading] = useState('false');
  const [apis, setApis] = useState([]);

  useEffect(() => {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json'
      }
    };

    setLoading(true);
    fetch(systemConfig.BACKEND_SERVER_URL + '/apis', requestOptions)
      .then(response => response.json())
      .then(data => {
        setApis(data);
        setLoading(false);
      })
      .catch(e => {
        console.log(e);
        setLoading(false);
      });

  }, []);

  // const rows = [
  //   ['Pizza Shack', '1.0.0', '30', '$530.64'],
  //   ['Whether report', '2.1.0', '10', '$34.50'],
  //   ['MyTaxi', '1.0.0', '109', '$3203.50'],
  // ];


  return (
    <TableContainer component={Paper}>
      {loading ? (
        <Box sx={{ display: 'flex' }}>
          <CircularProgress />
        </Box>
      )
        : (
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>API Name</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Subscriptions</TableCell>
                <TableCell>Total revanue</TableCell>
                <TableCell>Monetized</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {apis.map((api) => (
                <TableRow
                  key={api.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  hover={true}
                >
                  <TableCell>{api.name}</TableCell>
                  <TableCell>{api.version}</TableCell>
                  <TableCell>{api.subscriptions}</TableCell>
                  <TableCell>** To be implemented **</TableCell>
                  <TableCell><Checkbox defaultChecked /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
    </TableContainer>
  );
}

export default ApiList;