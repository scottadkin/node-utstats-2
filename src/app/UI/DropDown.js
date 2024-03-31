"use client"
import styles from "./DropDown.module.css";
import { useRef, useState, useEffect } from "react";
import useScreenInfo from "../hooks/useScreenInfo";

function createOptions(options, selectedValue){

    const elems = options.map((o) =>{
        return <div className={styles.option} key={o.value}>{o.display}</div>
    });

    return elems;
}

export default function DropDown({selectedValue, options, maxHeight}){

    if(maxHeight !== undefined){

        maxHeight = parseInt(maxHeight);
        if(maxHeight !== maxHeight) maxHeight = 9999;
    }else{
        maxHeight = 9999;
    }

    const wrapperRef = useRef(null);
    const optionsRef = useRef(null);
    const [bHide, setBHide] = useState(true);
    const {screenWidth, screenHeight} = useScreenInfo();
    const [maxOptionsHeight, setMaxOptionsHeight] = useState(maxHeight);

    useEffect(() =>{

        const bounds = optionsRef.current.getBoundingClientRect();
        const startY = bounds.y;
        const offset = startY - screenHeight;

        //console.log("offset", offset);

        if(offset >= 0){
            setMaxOptionsHeight(maxHeight);
        }else{

            let newHeight = screenHeight - startY;
            if(newHeight > maxHeight) newHeight = maxHeight;

            console.log(`amxHeight = ${newHeight}`);
            setMaxOptionsHeight(newHeight - 5);
        }
        //setMaxHeight(300);
    },[bHide]);

    if(selectedValue === undefined) selectedValue = null;


    return <div className={styles.wrapper} ref={wrapperRef} onMouseOver={() =>{
                setBHide(false);
            }}
            onMouseLeave={() =>{
                setBHide(true);
            }}>
        <div className={styles.current}>
            Selected value bHide = ({bHide.toString()})
        </div>
        <div className={`${styles.options} ${(!bHide) ? "" : styles.hidden}`} ref={optionsRef} style={{"maxHeight": `${maxOptionsHeight}px`}}>
            {createOptions(options, selectedValue)}
        </div>
    </div>
}