import { useRef, useEffect } from "react";
import styles from "./CustomGraph.module.css";
import Graph from "../../lib/Graph";


const CustomGraph = ({children, data, tabs, labels, labelsPrefix, minDataPoints}) =>{

    const canvasRef = useRef(null);
    if(minDataPoints === undefined) minDataPoints = 2;

    useEffect(() =>{

        const controller = new AbortController();

        const graphData = {
            "data": data,
            "labels": labels,
            "labelsPrefix": labelsPrefix
        };

        console.log(graphData);

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
            true, 
            minDataPoints
        );
        

        return () =>{
            controller.abort();
        }

    }, [data, tabs, labels, labelsPrefix, minDataPoints]);

    return <div className={`${styles.wrapper} t-width-1 center`}>
        {children}
        <canvas ref={canvasRef} width={640} height={480}></canvas>
    </div>
}

export default CustomGraph;