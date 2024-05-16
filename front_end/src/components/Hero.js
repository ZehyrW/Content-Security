import { Box, Stack } from '@mui/material';
import { hero3BoxStyle} from '../styles/componentStyle';

import heroImg from '../assets/top-modified.jpeg';
import { heroInfoFontStyle, heroSubTitleFontStyle, heroTechIntroFontStyle, heroTitleFontStyle} from '../styles/fontStyle';

import serverSrc from '../assets/techIntro/flask.png';
import clientSrc from '../assets/techIntro/react.png';
import detectSrc from '../assets/techIntro/model.png';

const heroID = 3;
const studentName = '王卓';
const studentID = '2021302191791';
const studentMajor = '网络空间安全';
const studentTutor = '熊翘楚';
const techIntroItems = [
    {
        iconSrc: serverSrc,
        tech: '后端框架：Flask',
    },
    {
        iconSrc: clientSrc,
        tech: '前端框架：React',
    },
    {
        iconSrc: detectSrc,
        tech: '活体检测模型：Saas API & Model',
    },
];
const ImageIcon = ({src}) => (
    <img src={src} style={{height: 48, width: 48}} alt='image-icon'/>
);

export default function Hero() {
    return (
        <>
        {
            heroID === 1 &&
            <Hero1/>
        }
        {
            heroID === 2 &&
            <Hero2/>
        }
        {
            heroID === 3 &&
            <Hero3/>
        }
        {
            heroID === 4 &&
            <Hero4/>
        }
        </>
    );
};

function Hero1() {
    // return (
    //     <>
    //     <Box
    //         sx={hero1BoxStyle}
    //         display='flex'
    //         alignItems='center'
    //         justifyContent='space-around'
    //     >
    //         <Stack
    //             direction='column'
    //             gap={2}
    //         >
    //             <div style={heroTitleFontStyle}>内容安全综合设计实验</div>
    //             <div style={heroSubTitleFontStyle}>————考勤系统设计</div>
    //             <div style={heroInfoFontStyle}>姓名：{studentName}</div>
    //             <div style={heroInfoFontStyle}>学号：{studentID}</div>
    //             <div style={heroInfoFontStyle}>专业：{studentMajor}</div>
    //             <div style={heroInfoFontStyle}>指导老师：{studentTutor}</div>
    //             <Box
    //                 display='flex'
    //                 flexDirection='column'
    //                 //alignItems='center'
    //                 gap={1}
    //             >
    //                 {
    //                     techIntroItems.map((item, inedx) => {
    //                         return (
    //                             <>
    //                             <Stack 
    //                                 direction='row'
    //                                 alignItems='center'
    //                                 gap={2}
    //                             >
    //                                 <ImageIcon src={item.iconSrc}/>
    //                                 <div style={heroTechIntroFontStyle}>{item.tech}</div>
    //                             </Stack>
    //                             </>
    //                         );
    //                     })
    //                 }
    //             </Box>
    //         </Stack>
    //         <img
    //             src={heroImg}
    //             alt='hero-image' 
    //         />

    //     </Box>
    //     </>
    // );
};

function Hero2() {
    // return (
    //     <>
    //     <Box
    //         sx={hero2BoxStyle}
    //         display='flex'
    //         alignItems='center'
    //         justifyContent='flex-start'
    //     >
    //         <Stack>
    //             <div style={heroTitleFontStyle}>内容安全综合设计实验</div>
    //             <div style={heroSubTitleFontStyle}>————考勤系统设计</div>
    //             <div style={heroInfoFontStyle}>姓名：{studentName}</div>
    //             <div style={heroInfoFontStyle}>学号：{studentID}</div>
    //             <div style={heroInfoFontStyle}>专业：{studentMajor}</div>
    //             <div style={heroInfoFontStyle}>指导老师：{studentTutor}</div>
    //         </Stack>
    //     </Box>
    //     <Box
    //         display='flex'
    //         justifyContent='center'            
    //     >
    //     <Box
    //         display='flex'
    //         flexDirection='row'
    //         alignItems='center'
    //         justifyContent='center'
    //         gap={10}
    //         sx={hero2IntroBoxStyle}
    //     >
    //         {
    //             techIntroItems.map((item, inedx) => {
    //                 return (
    //                     <>
    //                     <Stack 
    //                         direction='column'
    //                         alignItems='center'
    //                         justifyContent='center'
    //                         gap={2}
    //                     >
    //                         <ImageIcon src={item.iconSrc}/>
    //                         <div style={heroTechIntroFontStyle}>{item.tech}</div>
    //                     </Stack>
    //                     </>
    //                 );
    //             })
    //         }
    //     </Box>
    //     </Box>
    //     </>
    // );
};

function Hero3() {
    return (
        <>
        <Box
            sx={hero3BoxStyle}
            display='flex'
            alignItems='center'
            justifyContent='space-around'
        >
            <img
                src={heroImg}
                alt='hero-image' 
            />
            <Stack
                direction='column'
                gap={2}
            >
                <div style={heroTitleFontStyle}>内容安全综合设计实验</div>
                <div style={heroSubTitleFontStyle}>————考勤系统设计</div>
                <div style={heroInfoFontStyle}>姓名：{studentName}</div>
                <div style={heroInfoFontStyle}>学号：{studentID}</div>
                <div style={heroInfoFontStyle}>专业：{studentMajor}</div>
                <div style={heroInfoFontStyle}>指导老师：{studentTutor}</div>
                <Box
                    display='flex'
                    flexDirection='column'
                    // alignItems='center'
                    gap={1}
                >
                    {
                        techIntroItems.map((item, inedx) => {
                            return (
                                <>
                                <Stack 
                                    direction='row'
                                    alignItems='center'
                                    gap={2}
                                >
                                    <ImageIcon src={item.iconSrc}/>
                                    <div style={heroTechIntroFontStyle}>{item.tech}</div>
                                </Stack>
                                </>
                            );
                        })
                    }
                </Box>
            </Stack>
        </Box>
        </>
    )
};

function Hero4() {
    // return (
    //     <>
    //     <Box
    //         sx={hero4BoxStyle}
    //         display='flex'
    //         alignItems='center'
    //         justifyContent='center'
    //     >
    //         <Stack
    //             direction='column'
    //             alignItems='center'
    //             gap={2}
    //         >
    //             <div style={hero4TitleFontStyle}>内容安全综合设计实验</div>
    //             <div style={hero4SubTitleFontStyle}>考勤系统设计</div>
    //             <div style={hero4InfoFontStyle}>姓名：{studentName}</div>
    //             <div style={hero4InfoFontStyle}>学号：{studentID}</div>
    //             <div style={hero4InfoFontStyle}>专业：{studentMajor}</div>
    //             <div style={hero4InfoFontStyle}>指导老师：{studentTutor}</div>
    //             <Box
    //                 display='flex'
    //                 flexDirection='row'
    //                 alignItems='center'
    //                 justifyContent='center'
    //                 gap={10}
    //                 sx={hero4IntroBoxStyle}
    //             >
    //                 {
    //                     techIntroItems.map((item, inedx) => {
    //                         return (
    //                             <>
    //                             <Stack 
    //                                 direction='column'
    //                                 alignItems='center'
    //                                 justifyContent='center'
    //                                 gap={2}
    //                             >
    //                                 <ImageIcon src={item.iconSrc}/>
    //                                 <div style={heroTechIntroFontStyle}>{item.tech}</div>
    //                             </Stack>
    //                             </>
    //                         );
    //                     })
    //                 }
    //             </Box>
    //         </Stack>
    //     </Box>
    //     </>
    // );
}