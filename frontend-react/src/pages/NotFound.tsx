import React from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', py: 20 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h1" color="text.secondary" sx={{ fontSize: 120, fontWeight: 'bold' }}>
          404
        </Typography>
      </Box>
      <Typography variant="h4" gutterBottom>
        页面未找到
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        抱歉，您访问的页面不存在
      </Typography>
      <Button
        variant="contained"
        size="large"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/')}
      >
        返回首页
      </Button>
    </Container>
  );
};

export default NotFound;
