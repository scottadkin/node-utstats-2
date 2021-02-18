import styles from './Graph.module.css';
import {useEffect, useRef} from 'react';

class GraphCanvas{

    constructor(canvas, title){

        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.aspectRatio = 2;
        this.title = title;

        this.data = [
            {"name": "test 1", "data": [0,1,2,3,4,5,6]},
            {"name": "test 2", "data": [5,1,2,6,4,15,6]},
            {"name": "test 3", "data": [2,1,2,0,0,0,6]},
        ];

        this.calcMinMax();

        this.graphWidth = 80;
        this.graphHeight = 70;
        this.graphStartX = 15;
        this.graphStartY = 10;

        this.resize();
        this.render();

        this.canvas.addEventListener("click", () =>{
           // this.context.fillStyle = `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`;
            this.render();
        });
    }

    calcMinMax(){

        this.min = null;
        this.max = null;

        let d = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            for(let x = 0; x < d.data.length; x++){

                if(d.data[x] > this.max || this.max === null){
                    this.max = d.data[x];
                }

                if(d.data[x] < this.min || this.min === null){
                    this.min = d.data[x];
                }
            }
        }


        console.log(`Min = ${this.min} max = ${this.max}`);
        
    }

    resize(){

        this.canvas.height = 300;
        this.canvas.width = this.canvas.height * this.aspectRatio;
    }

    scaleX(input){
        return (this.canvas.width / 100) * input;
    }

    scaleY(input){
        return (this.canvas.height / 100) * input;
    }

    lineToAndBack(c, startX, endX, startY, endY){

        c.lineTo(startX, startY);
        c.lineTo(endX, endY);
        c.lineTo(startX, startY);
    }

    render(){

        const c = this.context;

        c.textAlign = "center";
        c.textBaseline = "top";


        c.fillStyle = "black";
        c.fillRect(0,0,this.canvas.width, this.canvas.height);

        c.fillStyle = "white";

        c.font = `${this.scaleY(5)}px Arial`;
        c.fillText(this.title, this.scaleX(50), this.scaleY(2));

        c.fillStyle = "rgb(12,12,12)";
        c.strokeStyle = "rgb(32,32,32)";
        c.lineWidth = this.scaleY(0.25);


        let x = this.scaleX(this.graphStartX);
        let y = this.scaleY(this.graphStartY);

        const gWidth = this.scaleX(this.graphWidth);
        const gHeight = this.scaleY(this.graphHeight);
        const quaterHeight = this.scaleY(this.graphHeight * 0.25); 


        c.fillRect(x, y, gWidth, gHeight);
        c.strokeRect(x, y, gWidth, gHeight);

        c.fillStyle = "rgb(3,3,3)";

        c.fillRect(x, y + quaterHeight, gWidth, quaterHeight);
        c.fillRect(x, y + (quaterHeight * 3), gWidth, quaterHeight);

        c.fillStyle = "white";
        c.strokeStyle = "white";

        const valueLineSize = this.scaleX(1);

        c.beginPath();
        c.moveTo(x, y);
        this.lineToAndBack(c, x, x - valueLineSize, y , y);
        this.lineToAndBack(c, x, x - valueLineSize, y + quaterHeight, y + quaterHeight);
        this.lineToAndBack(c, x, x - valueLineSize, y + (quaterHeight * 2), y + (quaterHeight * 2));
        this.lineToAndBack(c, x, x - valueLineSize, y + (quaterHeight * 3), y + (quaterHeight * 3));
        this.lineToAndBack(c, x, x - valueLineSize, y + (quaterHeight * 4), y + (quaterHeight * 4));


        c.lineTo(x, y + gHeight);
        c.lineTo(x + gWidth, y + gHeight);
        c.stroke();
        c.closePath();

        c.textAlign = "right";

        const valueTextSize = this.scaleY(4);
        const valueOffsetX = this.scaleX(1);

        c.font = `${valueTextSize}px Arial`;

        x -= valueOffsetX

        c.fillText(this.max, x, y - valueTextSize);
        c.fillText(this.max * 0.75, x, y + quaterHeight - valueTextSize);
        c.fillText(this.max * 0.5, x, y + (quaterHeight * 2) - valueTextSize);
        c.fillText(this.max * 0.25, x, y + (quaterHeight * 3) - valueTextSize);
        c.fillText(this.min, x, y + (quaterHeight * 4) - valueTextSize);


    }
}

const Graph = ({title}) =>{

    const canvas = useRef(null);

    useEffect(() =>{
        const g1 = new GraphCanvas(canvas.current, "Test Graph");
    });
    

    return (<div>
        <div className="default-header">{title}</div>

        <canvas className={styles.canvas} ref={canvas} width="400" height="400"></canvas>

    </div>);
}


export default Graph;