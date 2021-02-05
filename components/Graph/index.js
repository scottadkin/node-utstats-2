import styles from './Graph.module.css';
import {useEffect, useRef} from 'react';

class GraphCanvas{

    constructor(canvas){

        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.aspectRatio = 2;

        this.resize();
        this.render();

        this.canvas.addEventListener("click", () =>{
            this.context.fillStyle = `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`;
            this.render();
        });
    }

    resize(){

        this.canvas.height = 300;
        this.canvas.width = this.canvas.height * this.aspectRatio;
    }


    render(){

        const c = this.context;

        c.fillRect(0,0,this.canvas.width, this.canvas.height);

    }
}

const Graph = ({title}) =>{

    const canvas = useRef(null);

    useEffect(() =>{
        const g1 = new GraphCanvas(canvas.current);
    });
    

    return (<div>
        <div className="default-header">{title}</div>

        <canvas className={styles.canvas} ref={canvas} width="400" height="400"></canvas>

    </div>);
}


export default Graph;