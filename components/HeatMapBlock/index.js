import styles from "./HeatMapBlock.module.css";
import { useState } from "react";


const renderMouseOver = (bDisplay, setbDisplay, title, text) =>{

    if(!bDisplay) return null;

    return <div className={styles.mo} onMouseMove={() => {setbDisplay(false)}}>
        <div className={styles.title}>{title}</div>
        <div className={styles.text}>{text}</div>
    </div>
}

const HeatMapBlock = ({value, maxValue, children, bHighlight, mTitle, mText}) =>{

    const [bDisplay, setbDisplay] = useState(false);

    if(bHighlight === undefined) bHighlight = false;

    let bit = 0;

    if(maxValue > 0){
        bit = 255 / maxValue;
    }


    let className = `${styles.wrapper}`;
    if(bHighlight) className += ` ${styles.highlight}`;

    return <div 
            onMouseOver={() =>{ setbDisplay(true)}} 
            onMouseLeave={() =>{ setbDisplay(false)}}
            className={className} 
            style={{"backgroundColor": `rgb(${bit * value},0,0)`}}
        >
            
            {children}
            {renderMouseOver(bDisplay, setbDisplay, mTitle, mText)}
        </div>;
}


export default HeatMapBlock;