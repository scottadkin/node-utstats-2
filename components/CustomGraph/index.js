import { useRef, useEffect } from "react";
import styles from "./CustomGraph.module.css";
import Graph from "../../lib/Graph";


const CustomGraph = ({children, data, tabs, labels, labelsPrefix}) =>{

    const canvasRef = useRef(null);

    
    

    useEffect(() =>{

        const controller = new AbortController();

        const graphData = {
            "data": data,
            "labels": labels,
            "labelsPrefix": labelsPrefix
        };

        const g = new Graph(
            canvasRef.current, 
            controller, 
            1920, 
            1080, 
            tabs,
            graphData
        );
        

        return () =>{
            controller.abort();
        }

    }, [data, tabs, labels, labelsPrefix]);

    return <div className={styles.wrapper}>
        {children}
        <canvas ref={canvasRef} width={640} height={480} style={{"maxWidth": "90%"}}></canvas>
    </div>
}

export default CustomGraph;