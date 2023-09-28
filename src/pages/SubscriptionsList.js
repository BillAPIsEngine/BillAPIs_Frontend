import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import systemConfig from '../config'

const SubscriptionsList = () => {

  const [loading, setLoading] = useState('false');
  const [subscriptions, SetSubscriptions] = useState([]);

  useEffect(() => {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json'
      }
    };

    setLoading(true);
    fetch(systemConfig.BACKEND_SERVER_URL + '/subscriptions', requestOptions)
      .then(response => response.json())
      .then(data => {
        SetSubscriptions(data);
        setLoading(false);
      })
      .catch(e => {
        console.log(e);
        setLoading(false);
      });

  }, []);

  // const rows = [
  //     ['Little Pizza Shop', 'MyPizza App', '123123123', 'Pizza Shack', 'Basic', '$500.00'],
  //     ['Local News Ltd', 'LocalWether', '456456456', 'Whether report', 'Business', '$1200.00'],
  //   ];


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
                <TableCell>Application</TableCell>
                <TableCell>Subscriber</TableCell>
                <TableCell>API Name</TableCell>
                <TableCell>API Version</TableCell>
                <TableCell>Pricing plan</TableCell>
                <TableCell>Total revenue</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subscriptions.map((subscription) => (
                <TableRow
                  key={subscription['subscriptionId']}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  hover={true}
                >
                  <TableCell>{subscription.applicationInfo.name}</TableCell>
                  <TableCell>{subscription.applicationInfo.subscriber}</TableCell>
                  <TableCell>{subscription.apiInfo.name}</TableCell>
                  <TableCell>{subscription.apiInfo.version}</TableCell>
                  <TableCell>{subscription.throttlingPolicy}</TableCell>
                  <TableCell>** To be impl **</TableCell>
                  <TableCell>{subscription.subscriptionStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        )}
    </TableContainer>
  );
}

export default SubscriptionsList;