import React from 'react';
import { Box, Container, Typography, Divider } from '@mui/material';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt:5,
        py: 3,
        borderTop: '1px solid #e7e7e7'
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography 
            variant="body2" 
            color="inherit"
            sx={{ mb: { xs: 1, sm: 0 } }}
          >
            © {currentYear} Jump Rank Measure. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;