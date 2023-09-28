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


const BillingPlansList = () => {
  const [loading, setLoading] = useState('false');
  const [billingPlans, setBillingPlans] = useState([]);

  useEffect(() => {
    var requestOptions = {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'Accept': 'application/json'
      }
    };

    setLoading(true);
    fetch(systemConfig.BACKEND_SERVER_URL + '/subscriptionPolicies', requestOptions)
      .then(response => response.json())
      .then(data => {
        setBillingPlans(data);
        setLoading(false);
      })
      .catch(e => {
        console.log(e);
        setLoading(false);
      });

  }, []);

  // const rows = [
  //     ['Free tier', 'Free use for everyone', '2 Tx/min', 'free', '$0'],
  //     ['Basic', 'Basic plan for small projects', '10 Tx/min', 'PAYG', '$0.01/Tx'],
  //     ['Unlimitted', 'Enterprice plan', 'Unlimited', 'Fixed', '$100/month'],
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
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Pricing model</TableCell>
                <TableCell>Quota</TableCell>
                <TableCell>Price</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {billingPlans.map((billingPlan) => (
                <TableRow
                  key={billingPlan.policyId}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  hover={true}
                >
                  <TableCell>{billingPlan.policyName}</TableCell>
                  <TableCell>{billingPlan.description}</TableCell>
                  <TableCell>{billingPlan.billingPlan}</TableCell>
                  <TableCell>** To be implemented **</TableCell>
                  <TableCell>** To be implemented **</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
    </TableContainer>
  );
}

export default BillingPlansList;