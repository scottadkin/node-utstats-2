"use client"
import { useRef, useEffect } from "react";
import styles from "./CustomGraph.module.css";
import Graph from "../Graph";


const CustomGraph = ({children, data, tabs, labels, info, labelsPrefix, minDataPoints, bEnableAdvanced, bSkipForceWholeYNumbers}) =>{

    const canvasRef = useRef(null);
    if(minDataPoints === undefined) minDataPoints = 2;
    if(bEnableAdvanced === undefined) bEnableAdvanced = true;
    if(bSkipForceWholeYNumbers === undefined) bSkipForceWholeYNumbers = false;

    useEffect(() =>{

        const controller = new AbortController();

        const graphData = {
            "data": data,
            "labels": labels,
            "labelsPrefix": labelsPrefix,
            "info": info
        };


        new Graph(
            canvasRef.current, 
            controller, 
            1920, 
            1080, 
            tabs,
            true,
            graphData,
            0,
            null,
            bEnableAdvanced, 
            minDataPoints,
            bSkipForceWholeYNumbers
        );
        

        return () =>{
            controller.abort();
        }

    }, [data, tabs, labels, labelsPrefix, minDataPoints, bEnableAdvanced, bSkipForceWholeYNumbers, info]);

    return <div className={`${styles.wrapper} t-width-1 center`}>
        {children}
        <canvas ref={canvasRef} width={640} height={480}></canvas>
    </div>
}

export default CustomGraph;