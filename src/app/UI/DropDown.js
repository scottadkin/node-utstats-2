"use client"
import styles from "./DropDown.module.css";
import { useRef, useState, useEffect } from "react";
import useScreenInfo from "../hooks/useScreenInfo";

function createOptions(options, selectedValue, setBHide, changeSelected){

    const elems = options.map((o) =>{

        let className = styles.option;

        if(o.value === selectedValue){
            className = `${className} ${styles.selected}`
        }

        return <div className={className} key={o.value} onClick={() =>{
            setBHide(true);
            changeSelected(o.value);
        }}>{o.display}</div>
    });

    return elems;
}

function getCurrentValue(options, selectedValue){

    for(let i = 0; i < options.length; i++){

        const o = options[i];

        if(o.value === selectedValue) return o.display;
    }


    return "Please select a value";
}

function renderCurrent(options, selectedValue, changeSelected, bHide){

    let onClick = null;
    let displayText = "";

    if(!bHide){

        onClick = () =>{
            changeSelected(null);
        }

        displayText = "Unselect Option";

    }else{

        displayText = getCurrentValue(options, selectedValue);
    }

    return <div className={styles.current} onClick={onClick}>
        {displayText}
    </div>
}

export default function DropDown({selectedValue, changeSelected, options, maxHeight}){

    if(maxHeight !== undefined){

        maxHeight = parseInt(maxHeight);
        if(maxHeight !== maxHeight) maxHeight = 9999;
    }else{
        maxHeight = 9999;
    }

    const wrapperRef = useRef(null);
    const optionsRef = useRef(null);
    const [bHide, setBHide] = useState(true);
    const {screenHeight} = useScreenInfo();
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

            setMaxOptionsHeight(newHeight - 5);
        }
        //setMaxHeight(300);
    },[bHide, maxHeight, screenHeight]);

    if(selectedValue === undefined) selectedValue = null;


    return <div className={styles.wrapper} ref={wrapperRef} onMouseOver={() =>{
                setBHide(false);
            }}
            onMouseLeave={() =>{
                setBHide(true);
            }}>
        {renderCurrent(options, selectedValue, changeSelected, bHide)}
        <div className={`${styles.options} ${(!bHide) ? "" : styles.hidden}`} ref={optionsRef} style={{"maxHeight": `${maxOptionsHeight}px`}}>
            {createOptions(options, selectedValue, setBHide, changeSelected)}
        </div>
    </div>
}