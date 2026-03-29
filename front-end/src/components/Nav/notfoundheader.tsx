import React from 'react';
import { useState} from 'react';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

import Divider from '@mui/material/Divider';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import { NavLink } from 'react-router-dom'
import ArticleIcon from '@mui/icons-material/Article';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MenuBookTwoToneIcon from '@mui/icons-material/MenuBookTwoTone';
import AnalyticsSharpIcon from '@mui/icons-material/AnalyticsSharp';

export default function NotFoundNavi(){

    // ハンバーガーメニューの開閉
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);


    return(
        <>
        {/*ヘッダー*/}
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static"  sx={{background:'white'}}>
                <Toolbar>
                    {/* ハンバーガーアイコン */}
                    <IconButton
                            size="large"
                            edge="start"
                            aria-label="menu"
                            onClick={toggleMenu}
                            >
                        <MenuIcon />
                    </IconButton >
                    {/* タイトル */}
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, color:'black', textAlign:'left', paddingLeft:2}}>
                        週刊少年ジャンプ順位分析
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
            </Box>
            {/*ヘッダー終わり*/}

            {/* ハンバーガーメニューの表示 */}
                <div>
                    {isOpen && (
                        <Box sx={{ width: 250 }} role="presentation" onClick={toggleMenu}>
                            <NavLink to="/jumprank" style={{ textDecoration: "none", color: "inherit" }}>
                                <ListItemButton>
                                    <ListItemIcon>
                                    <AnalyticsSharpIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="週刊少年ジャンプ順位分析" sx={{color:'black'}}></ListItemText>
                                </ListItemButton>
                            </NavLink>
                            <NavLink to="/jumprank/series" style={{ textDecoration: "none", color: "inherit" }}>
                                <ListItemButton>
                                    <ListItemIcon>
                                    <MenuBookTwoToneIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="週刊少年ジャンプ連載中の作品" sx={{color:'blue'}} />
                                </ListItemButton>
                            </NavLink>
                            <NavLink to="/jumprank/news" style={{ textDecoration: "none", color: "inherit" }}>
                                <ListItemButton>
                                    <ListItemIcon>
                                    <ArticleIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="お知らせ" sx={{color:'black'}} />
                                </ListItemButton>
                            </NavLink>
                            <Divider />
                        </Box>
                    )}
                </div>
                {/* ハンバーガーメニューの表示の終わり */}
        </>
    );
};

/**三項演算
 * {!isauth?(処理1):(処理２)}
 * 条件式(!isauth)がtrueの時に処理１が実行され、falseの時に処理2が実行される
 */
