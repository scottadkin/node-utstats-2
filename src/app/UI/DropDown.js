"use client"
import styles from "./DropDown.module.css";
import { useRef, useState } from "react";
import useScreenInfo from "../hooks/useScreenInfo";

function createOptions(options, selectedValue){

    const elems = options.map((o) =>{
        return <div className={styles.option} key={o.value}>{o.display}</div>
    });

    return elems;
}

export default function DropDown({selectedValue, options}){

    const wrapperRef = useRef(null);
    const [bHide, setBHide] = useState(true);
    const test = useScreenInfo();
    console.log(test);

    if(selectedValue === undefined) selectedValue = null;


    return <div className={styles.wrapper} ref={wrapperRef} onMouseOver={() =>{
                setBHide(true);
                console.log(wrapperRef.current.getBoundingClientRect());
            }}
            onMouseLeave={() =>{
                setBHide(false);
            }}>
        <div className={styles.current}>
            Selected value ({bHide.toString()})
        </div>
        <div className={styles.options}>
            {createOptions(options, selectedValue)}
        </div>
    </div>
}