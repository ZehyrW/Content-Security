import React from 'react';
import { Box, Button, IconButton, Stack} from '@mui/material';

import logo from '../assets/logo2.png';
import { headerNameFontStyle, headerTextFontStyle } from '../styles/fontStyle';
import { headerBoxStyle } from '../styles/componentStyle';



export default function Header() {

    return (
        <>
        <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            sx={headerBoxStyle}
        >
            <Stack
                direction='row'
                alignItems='center'
            >
                <IconButton
                    aria-label='logo'
                    disableRipple={true}
                    href='/'
                >
                    <img src={logo} style={{height: 48, width: 200}} alt='logo'/>
                </IconButton>
                {/* <div style={headerNameFontStyle}>考勤系统</div> */}
            </Stack>

            <Stack
                direction='row'
                alignItems='center'
                gap={1}
            >
                <div style={headerTextFontStyle}>内容安全实验课程作业</div>
            </Stack>
        </Box>
        </>
    );
}