import { Container, Tabs, Tab, Box, Stack, Button } from "@mui/material";
import { useEffect, useState } from "react";
import { contentCamBoxStyle, contentResultBoxStyle, tabBoxStyle, tabBox2Style, tabStyle } from "../styles/componentStyle";
import { contentTitleStyle, contentStyle, identifyFontStyle } from "../styles/fontStyle";
import io from 'socket.io-client';

import tab0Src from '../assets/tab/API.png';
import tab1Src from '../assets/tab/model.png';
import tab2Src from '../assets/tab/model_2.png';
import process from '../assets/process.png';
import errorSrc from '../assets/错误.png';
import successSrc from '../assets/成功.png';

let socket = null;
const TabIcon = ({src}) => (
    <img src={src} style={{height: 48, width: 48}} alt='image-icon'/>
);

const TabIcon2 = ({src}) => (
    <img src={src} style={{height: 430, width: 4800}} alt='image-icon'/>
);

const tabItems = [
    {
        label: '基于API的人脸活体检测',
        iconSrc: tab0Src,
    },
    {
        label: '基于模型的人脸活体检测1',
        iconSrc: tab1Src,
    },
    {
        label: '基于模型的人脸活体检测2',
        iconSrc: tab2Src,
    }
]


const tab0Intro = '本方案使用的是虹软的API接口来实现人脸活体检测！';
const tab1Intro = '本方案使用的是开源模型来实现人脸活体检测！';
const tab2Intro = '本方案使用的是开源模型来实现人脸活体检测！';
export default function Content() {
    const [selectedTab, setSelectedTab] = useState(0);
    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const [isCapturing, setIsCapturing] = useState(false);
    return (
        <>
        <Container
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 2,
                marginTop: 2
            }}
        >
            <div style={contentTitleStyle}>实现流程</div>
            <Box
                display='flex'
                justifyContent='center'
                sx={tabBox2Style}
                className='gradient-border'
                id='box'
            >
                <TabIcon2 src={process} />
            </Box>

            <div style={contentTitleStyle}>功能演示</div>
            <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                centered
            >
                {
                    tabItems.map((item, index) => (
                        <Tab
                            key={index}
                            label={item.label}
                            sx={tabStyle}
                            disableFocusRipple={true}
                            disableRipple={true}
                            icon={<TabIcon src={item.iconSrc}/>}
                            disabled={isCapturing}
                        />
                    ))
                }
            </Tabs>
            <Box
                display='flex'
                //justifyContent='center'
                sx={tabBoxStyle}
                className='gradient-border'
                id='box'
            >
                {/* 根据实际的tab数量调整 */}
                {selectedTab === 0 && <Tab0Item isCapturing={isCapturing} setIsCapturing={setIsCapturing} selectedTab={selectedTab}/>}
                {selectedTab === 1 && <Tab1Item isCapturing={isCapturing} setIsCapturing={setIsCapturing} selectedTab={selectedTab}/>}
                {selectedTab === 2 && <Tab2Item isCapturing={isCapturing} setIsCapturing={setIsCapturing} selectedTab={selectedTab}/>}
            </Box>
        </Container>
        </>
    );
};

function Tab0Item({selectedTab}) {
    const [captureSrc, setCaptureSrc] = useState(null);

    /*读取face_info结果*/
    const [faceInfo, setFaceInfo] = useState(null);
    const [studentPicSrc, setStudentPicSrc] = useState(null);

    const [isVaild, setIsVaild] = useState(false);

    const handleStartCapture = () => {
        console.log('start to capture');
        socket = io('ws://localhost:5000/capture');
        const captureInfo = {
            'type_info': selectedTab,
        };
        socket.emit('handle_connect', captureInfo);
        socket.on('handle_capture', (base64Data) => {
            var byteCharacters = atob(base64Data);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);

            // 创建Blob对象
            var blob = new Blob([byteArray], { type: "image/jpeg" });
            var blobURL = URL.createObjectURL(blob);
            setCaptureSrc(blobURL);
            //console.log(blob);
        });  
        socket.on('face_info_data', (face_info_data) => {
            console.log('start to face_info');
            setFaceInfo(face_info_data);
            const liveness = face_info_data.liveness;
            console.log(face_info_data.pic);
            var byteCharacters = atob(face_info_data.pic);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            //console.log(faceInfo.pic)
            var blob = new Blob([byteArray], { type: "image/jpeg" });
            var blobURL = URL.createObjectURL(blob);
            setStudentPicSrc(blobURL);
            if (liveness=='真') {
                setIsVaild(true);
            }
            else {
                setIsVaild(false);
            };
        });
    };
    

    return (
        <>
        <Box
            display='flex'
            // alignItems='center'
            flexDirection='column'
            gap={2}
            sx={{width: '100%'}}
        >
            <Stack
                direction='row'
                gap={1}
            >
            <div style={{color: '#0052D9', fontWeight: 900}}>|</div>
            <div style={contentStyle}>方案说明</div>
            </Stack>
            <div style={{color: '#bdc3c7', fontFamily:'hanyi', fontSize: 18}}>{tab0Intro}</div>
            <Stack
                direction='row'
                justifyContent='space-between'
            >
                <Box
                    sx={contentCamBoxStyle}
                >
                    <img src={captureSrc} style={{width: '100%', height: '100%'}}/>
                </Box>
                <Box
                    sx={contentResultBoxStyle}
                    display='flex'
                    flexDirection='column'
                    justifyContent='center'
                    alignItems='center'
                    gap={1}
                >
                    <Stack
                        direction='row'
                        alignItems='center'
                        gap={1}
                    >
                    <div style={identifyFontStyle}>身份验证结果:</div>
                    {
                        isVaild && 
                        <>
                        <div style={{color: '#0052D9', fontFamily:'hanyi', fontSize: 24}}>验证通过 打卡成功</div>
                        { <img src={successSrc} style={{height: 32, width: 32}}/> }
                        </>
                    }
                    {
                        !isVaild && 
                        <>
                        <div style={{color: '#0052D9', fontFamily:'hanyi', fontSize: 24}}>验证未通过 打卡失败</div>
                        { <img src={errorSrc} style={{height: 32, width: 32}}/> }
                        </>
                    }
                    </Stack>
                    {faceInfo && (
                            <>
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>姓名：{faceInfo.name}</div>
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>学号：{faceInfo.id}</div>
                                {/* <div style={{color: '#0052D9', fontWeight: 500, fontFamily:'hanyi', fontSize: 18, marginBottom: '8px'}}>姓名：{faceInfo.name}</div> */}
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>性别：{faceInfo.gender}</div>
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>预测年龄：{faceInfo.age}</div>
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>活体预测阈值：{faceInfo.threshold}</div>
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>活体检测结果：{faceInfo.liveness}</div>
                            </>
                    )}
                    
                     <img src={studentPicSrc} style={{height: '50%', width: '40%'}}/>
                </Box>
            </Stack>
            <Button variant="contained" onClick={handleStartCapture}>
                <div style={{color: '#fffafa', fontFamily:'hanyi', fontSize: 18}}>点击按钮开始检测</div>
            </Button>

        </Box>
        </>
    );
}

function Tab1Item({selectedTab}) {
    const [captureSrc, setCaptureSrc] = useState(null);

    /*读取face_info结果*/
    const [faceInfo, setFaceInfo] = useState(null);
    const [studentPicSrc, setStudentPicSrc] = useState(null);

    const [isVaild, setIsVaild] = useState(false);

    const handleStartCapture = () => {
        console.log('start to capture');
        socket = io('ws://localhost:5000/capture');
        const captureInfo = {
            'type_info': selectedTab,
        };
        socket.emit('handle_connect', captureInfo);
        socket.on('handle_capture', (base64Data) => {
            var byteCharacters = atob(base64Data);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);

            // 创建Blob对象
            var blob = new Blob([byteArray], { type: "image/jpeg" });
            var blobURL = URL.createObjectURL(blob);
            setCaptureSrc(blobURL);
            //console.log(blob);
        });  
        socket.on('face_info_data2', (face_info_data2) => {
            console.log('start to face_info');
            setFaceInfo(face_info_data2);
            const liveness = face_info_data2.liveness;
            console.log(face_info_data2.picture);
            var byteCharacters = atob(face_info_data2.picture);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            //console.log(faceInfo.pic)
            var blob = new Blob([byteArray], { type: "image/jpeg" });
            var blobURL = URL.createObjectURL(blob);
            setStudentPicSrc(blobURL);
            if (liveness=='真') {
                setIsVaild(true);
            }
            else {
                setIsVaild(false);
            };
        });
    };
    

    return (
        <>
        <Box
            display='flex'
            // alignItems='center'
            flexDirection='column'
            gap={2}
            sx={{width: '100%'}}
        >
            <Stack
                direction='row'
                gap={1}
            >
            <div style={{color: '#0052D9', fontWeight: 900}}>|</div>
            <div style={contentStyle}>方案说明</div>
            </Stack>
            <div style={{color: '#bdc3c7', fontFamily:'hanyi', fontSize: 18}}>{tab1Intro}</div>
            <Stack
                direction='row'
                justifyContent='space-between'
            >
                <Box
                    sx={contentCamBoxStyle}
                >
                    <img src={captureSrc} style={{width: '100%', height: '100%'}}/>
                </Box>
                <Box
                    sx={contentResultBoxStyle}
                    display='flex'
                    flexDirection='column'
                    justifyContent='center'
                    alignItems='center'
                    gap={1}
                >
                    <Stack
                        direction='row'
                        alignItems='center'
                        gap={1}
                    >
                    <div style={identifyFontStyle}>身份验证结果:</div>
                    {
                        isVaild && 
                        <>
                        <div style={{color: '#0052D9', fontFamily:'hanyi', fontSize: 24}}>验证通过 打卡成功</div>
                        { <img src={successSrc} style={{height: 32, width: 32}}/> }
                        </>
                    }
                    {
                        !isVaild && 
                        <>
                        <div style={{color: '#0052D9', fontFamily:'hanyi', fontSize: 24}}>验证未通过 打卡失败</div>
                        { <img src={errorSrc} style={{height: 32, width: 32}}/> }
                        </>
                    }
                    </Stack>
                    {faceInfo && (
                            <>
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>姓名：{faceInfo.name}</div>
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>学号：{faceInfo.student_id}</div>
                                {/* <div style={{color: '#0052D9', fontWeight: 500, fontFamily:'hanyi', fontSize: 18, marginBottom: '8px'}}>姓名：{faceInfo.name}</div> */}
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>性别：男</div>
                                {/* <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>预测年龄：{faceInfo.age}</div> */}
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>活体预测阈值：{faceInfo.threshold}</div>
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>活体检测结果：{faceInfo.liveness}</div>
                            </>
                    )}
                    
                     <img src={studentPicSrc} style={{height: '50%', width: '40%'}}/>
                </Box>
            </Stack>
            <Button variant="contained" onClick={handleStartCapture}>
                <div style={{color: '#fffafa', fontFamily:'hanyi', fontSize: 18}}>点击按钮开始检测</div>
            </Button>

        </Box>
        </>
    );
}

function Tab2Item({selectedTab}) {
    const [captureSrc, setCaptureSrc] = useState(null);

    /*读取face_info结果*/
    const [faceInfo, setFaceInfo] = useState(null);
    const [studentPicSrc, setStudentPicSrc] = useState(null);

    const [isVaild, setIsVaild] = useState(false);

    const handleStartCapture = () => {
        console.log('start to capture');
        socket = io('ws://localhost:5000/capture');
        const captureInfo = {
            'type_info': selectedTab,
        };
        socket.emit('handle_connect', captureInfo);
        socket.on('handle_capture', (base64Data) => {
            var byteCharacters = atob(base64Data);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);

            // 创建Blob对象
            var blob = new Blob([byteArray], { type: "image/jpeg" });
            var blobURL = URL.createObjectURL(blob);
            setCaptureSrc(blobURL);
            // console.log(blob);
        });  
        socket.on('face_info_data3', (face_info_data3) => {
            console.log('start to face_info');
            setFaceInfo(face_info_data3);
            const liveness = face_info_data3.liveness;
            console.log(face_info_data3.picture);
            var byteCharacters = atob(face_info_data3.picture);
            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            // console.log(faceInfo.picture)
            var blob = new Blob([byteArray], { type: "image/jpeg" });
            var blobURL = URL.createObjectURL(blob);
            setStudentPicSrc(blobURL);
            if (liveness=='真') {
                setIsVaild(true);
            }
            else {
                setIsVaild(false);
            };
        });
    };
    

    return (
        <>
        <Box
            display='flex'
            // alignItems='center'
            flexDirection='column'
            gap={2}
            sx={{width: '100%'}}
        >
            <Stack
                direction='row'
                gap={1}
            >
            <div style={{color: '#0052D9', fontWeight: 900}}>|</div>
            <div style={contentStyle}>方案说明</div>
            </Stack>
            <div style={{color: '#bdc3c7', fontFamily:'hanyi', fontSize: 18}}>{tab2Intro}</div>
            <Stack
                direction='row'
                justifyContent='space-between'
            >
                <Box
                    sx={contentCamBoxStyle}
                >
                    <img src={captureSrc} style={{width: '100%', height: '100%'}}/>
                </Box>
                <Box
                    sx={contentResultBoxStyle}
                    display='flex'
                    flexDirection='column'
                    justifyContent='center'
                    alignItems='center'
                    gap={1}
                >
                    <Stack
                        direction='row'
                        alignItems='center'
                        gap={1}
                    >
                    <div style={identifyFontStyle}>身份验证结果:</div>
                    {
                        isVaild && 
                        <>
                        <div style={{color: '#0052D9', fontFamily:'hanyi', fontSize: 24}}>验证通过 打卡成功</div>
                        { <img src={successSrc} style={{height: 32, width: 32}}/> }
                        </>
                    }
                    {
                        !isVaild && 
                        <>
                        <div style={{color: '#0052D9', fontFamily:'hanyi', fontSize: 24}}>验证未通过 打卡失败</div>
                        { <img src={errorSrc} style={{height: 32, width: 32}}/> }
                        </>
                    }
                    </Stack>
                    {faceInfo && (
                            <>
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>姓名：{faceInfo.name}</div>
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>学号：{faceInfo.student_id}</div>
                                {/* <div style={{color: '#0052D9', fontWeight: 500, fontFamily:'hanyi', fontSize: 18, marginBottom: '8px'}}>姓名：{faceInfo.name}</div> */}
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>性别：男</div>
                                {/* <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>预测年龄：{faceInfo.age}</div> */}
                                {/* <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>活体预测阈值：{faceInfo.threshold}</div> */}
                                <div style={{fontWeight: 500, fontFamily:'hanyi', fontSize: 16, marginBottom: '8px'}}>活体检测结果：{faceInfo.liveness}</div>
                            </>
                    )}
                    
                     <img src={studentPicSrc} style={{height: '50%', width: '40%'}}/>
                </Box>
            </Stack>
            <Button variant="contained" onClick={handleStartCapture}>
                <div style={{color: '#fffafa', fontFamily:'hanyi', fontSize: 18}}>点击按钮开始检测</div>
            </Button>

        </Box>
        </>
    );
}
