import styles from "./HeatMapBlock.module.css";
import { useState } from "react";


const renderMouseOver = (bDisplay, setbDisplay, title, text) =>{

    if(!bDisplay) return null;

    return <div className={styles.mo} onMouseMove={() => {setbDisplay(false)}}>
        <div className={styles.title}>{title}</div>
        <div className={styles.text}>{text}</div>
    </div>
}

export default function HeatMapBlock({value, maxValue, children, bHighlight, mTitle, mText}){

    const [bDisplay, setbDisplay] = useState(false);

    if(bHighlight === undefined) bHighlight = false;

    let bit = 0;

    if(maxValue > 0){
        bit = 1 / maxValue;
    }


    let className = `${styles.wrapper}`;
    if(bHighlight) className += ` ${styles.highlight}`;

    let style = {"backgroundColor": "var(--color-2)"};

    if(bit * value > 0){
        style = {"backgroundColor": `rgba(255,0,0,${bit * value})`};
    }

    return <div 
            onMouseOver={() =>{ setbDisplay(true)}} 
            onMouseLeave={() =>{ setbDisplay(false)}}
            className={className} 
            //style={{"opacity": bit * value}}
            style={style}
        >
            
            {children}
            {renderMouseOver(bDisplay, setbDisplay, mTitle, mText)}
        </div>;
}
