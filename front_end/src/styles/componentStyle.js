import '../App.css';

// hero2背景
//import heroBg from '../assets/Jz_i8FcFFMdyIFNPgTxGk.jpg';

// hero4背景
import heroBg from '../assets/350.jpg';

export const headerBoxStyle = {
    backgroundColor: '#FFFFFF',
    borderBottom: '2px solid #ECEEF4',
    height: 54,
    paddingLeft: 4,
    paddingRight: 4,
};

export const hero1BoxStyle = {
    height: 640,
    backgroundColor: '#f0f5f9'
};

export const hero2BoxStyle = {
    height: 640,
    backgroundImage: `url(${heroBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    paddingLeft: 16
};

export const hero2IntroBoxStyle = {
    backgroundColor: '#F8F9FB',
    height: 120,
    width: '60%',
    position: 'relative',
    top: '-64px',
    borderRadius: 2,
};

export const hero3BoxStyle = {
    height: 640,
    // backgroundColor: '#f0f5f9'
};


export const hero4BoxStyle = {
    height: 640,
    backgroundImage: `url(${heroBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
};

export const hero4IntroBoxStyle = {
    backgroundColor: '#DCE8F4',
    height: 120,
    marginTop: 6,
    padding: 2,
    borderRadius: 2,
};

export const tabStyle = {
    fontSize: 20,
    width: 300,
    fontFamily: 'hanyi',
};

export const tabBoxStyle = {
    padding: 5,
    height: 650,
    width: 1400,
};

export const tabBox2Style = {
    padding: 5,
    height: 400,
    width: 1400,
};

export const contentCamBoxStyle = {
    height: 500,
    width: 700,
    border: '2px solid #0b7ffe',
    padding: 2,
    borderRadius: 10,
    // backgroundColor: '#f0f5f9',
};

export const contentResultBoxStyle = {
    height: 500,
    width: 600,
    border: '2px solid #0b7ffe',
    padding: 2,
    borderRadius: 10,
    backgroundColor: '#f0f5f9',
};