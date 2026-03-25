import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

import { NavLink } from 'react-router-dom'
import ArticleIcon from '@mui/icons-material/Article';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MenuBookTwoToneIcon from '@mui/icons-material/MenuBookTwoTone';
import AnalyticsSharpIcon from '@mui/icons-material/AnalyticsSharp';

export default function SeriesHeaderNavi() {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' ||
        (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setIsOpen(open);
  };

  const menuItems = [
    //{ text: '週刊少年ジャンプ順位分析', path: '/jumprank', icon: <AnalyticsSharpIcon />,color:'black' },
    //{ text: '週刊少年ジャンプ連載中の作品', path: '/series', icon: <MenuBookTwoToneIcon /> ,color:'blue' },
    //{ text: 'お知らせ', path: '/news', icon: <ArticleIcon />,color:'black'  }
    { text: '週刊少年ジャンプ順位分析', path: '/jumprank', icon: <AnalyticsSharpIcon />,color:'black' },
    { text: '週刊少年ジャンプ連載中の作品', path: '/jumprank/series', icon: <MenuBookTwoToneIcon /> ,color:'blue' },
    { text: 'お知らせ', path: '/jumprank/news', icon: <ArticleIcon />,color:'black'  }
  ];

  const MenuList = () => (
    <Box
      sx={{ width: isMobile ? '100vw' : 250 }}
      role="presentation"
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 1 }}>
        <IconButton onClick={toggleDrawer(false)}>
          <CloseIcon />
        </IconButton>
      </Box>
      <List>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={{ textDecoration: 'none', color: item.color }} // アイコンの色を適用
          >
            <ListItemButton>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: 500
                  }
                }}
              />
            </ListItemButton>
          </NavLink>
        ))}
      </List>
      <Divider />
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            aria-label="menu"
            onClick={toggleDrawer(true)}
            sx={{ color: 'black' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              color: 'black',
              textAlign: 'left',
              paddingLeft: 2,
              fontWeight: 'bold'
            }}
          >
            週刊少年ジャンプ連載作品
          </Typography>
          <Box
            component="img"
            //src="/jumpicon.png"
            src='/jumprank/jumpicon.png'
            alt="Jump Icon"
            sx={{
              height: 40,
              width: 'auto',
              marginLeft: 2,
              borderRadius: '50%',
            }}
          />
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* スペーサー */}

      <Drawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer(false)}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: '#f8f9fa',
          }
        }}
      >
        <MenuList />
      </Drawer>
    </>
  );
};

/**三項演算
 * {!isauth?(処理1):(処理２)}
 * 条件式(!isauth)がtrueの時に処理１が実行され、falseの時に処理2が実行される
 */
