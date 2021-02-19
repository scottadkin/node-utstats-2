import styles from './Graph.module.css';
import {useEffect, useRef} from 'react';

class GraphCanvas{

    constructor(canvas, title, data){

        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.aspectRatio = 2;
        this.title = title;

        this.data = JSON.parse(data);

        this.maxDataDisplay = 8;
        /*this.data = [
            {"name": "test 1", "data": [0,1,2,3,4,5,6]},
            {"name": "DogFood Test", "data": [5,1,2,6,4,15,6]},
            {"name": "test 3", "data": [2,1,2,0,0,0,6]},
            {"name": "test 7564754754", "data": [32,41,2,10,20,10,36]},
        ];*/


        this.colors = [
            "red",
            "rgb(60,101,156)",
            "rgb(0,150,0)",
            "yellow",
            "grey",
            "pink",
            "orange",
            "lightblue"
        ];

        this.calcMinMax();

        this.graphWidth = 80;
        this.graphHeight = 70;
        this.graphStartX = 15;
        this.graphStartY = 10;

        this.resize(false);
        this.render();

        this.canvas.onfullscreenchange = (e) =>{
            console.log('ok');
            console.log(e);

            if(document.fullscreenElement !== this.canvas){
                this.resize(false);
                this.render();
            }
        }

        this.canvas.onfullscreenerror = (e) =>{
            console.log(e);
        }

        this.canvas.addEventListener("click", () =>{

            this.canvas.requestFullscreen();
            this.resize(true); 
            this.render();
        });
    }

    calcMinMax(){

        this.min = null;
        this.max = null;
        this.mostData = 0;

        let d = 0;

        for(let i = 0; i < this.data.length; i++){

            d = this.data[i];

            if(d.data.length > this.mostData){
                this.mostData = d.data.length;
            }

            for(let x = 0; x < d.data.length; x++){

                if(d.data[x] > this.max || this.max === null){
                    this.max = d.data[x];
                }

                if(d.data[x] < this.min || this.min === null){
                    this.min = d.data[x];
                }
            }
        }

        this.mostData--;

        console.log(`Min = ${this.min} max = ${this.max}`);
        
    }

    resize(bFullScreen){

        if(!bFullScreen){
            this.canvas.height = 300;
            this.canvas.width = this.canvas.height * this.aspectRatio;
        }else{
            this.canvas.height = window.innerHeight;
            this.canvas.width = this.canvas.height * this.aspectRatio;
        }
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

    plotData(c){

        let startX = this.scaleX(this.graphStartX);
        let startY = this.scaleY(this.graphStartY + this.graphHeight);
        const graphWidth = this.scaleX(this.graphWidth);
        const graphHeight = this.scaleY(this.graphHeight);

        c.fillStyle = "red";
        c.lineWidth = this.scaleY(0.5);
        const offsetXBit = graphWidth / this.mostData;
        const offsetYBit = graphHeight / this.max;

        const blockSize = this.scaleY(1);

        let currentX = 0;
        let currentY = 0;


        let d = 0;

        for(let i = 0; i < this.data.length; i++){

            if(i >= this.maxDataDisplay) return;

            if(i < this.colors.length){

                c.fillStyle = this.colors[i];
                c.strokeStyle = this.colors[i];
            }else{
                c.fillStyle = "pink";
                c.strokeStyle = "pink";
            }

            d = this.data[i];

            c.beginPath();
            c.moveTo(startX,  startY - (offsetYBit * d.data[0]));

            for(let x = 0; x < d.data.length; x++){

                currentX = startX + (offsetXBit * x) - (blockSize * 0.5)
                currentY = startY - (offsetYBit * d.data[x]) - (blockSize * 0.5);

                //c.fillRect(currentX, currentY , blockSize, blockSize);
                c.lineTo(currentX + (blockSize * 0.5), currentY + (blockSize * 0.5));
            }

            c.stroke();
            c.closePath();
        }

    }
    
    drawKeys(c){

        const startY = this.scaleY(90);
        const startX = this.scaleX(2);

        const blockSize = this.scaleY(4);
        const textOffsetX = this.scaleX(0.8);

        let offsetX = 0;

        c.font = `${this.scaleY(4)}px Arial`;

        c.textAlign = "left";

        let currentX = 0;

        for(let i = 0; i < this.data.length; i++){

            if(i >= this.maxDataDisplay) return;

            if(i < this.colors.length){
                c.fillStyle = this.colors[i];
            }else{
                c.fillStyle = "pink";
            }

            currentX = startX + offsetX + (blockSize * i);
           
            c.fillRect(currentX, startY, blockSize, blockSize);
                
            c.fillText(this.data[i].name, currentX + blockSize + textOffsetX, startY);
            

            offsetX += c.measureText(`${this.data[i].name}__`).width;
            

        }
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

        x -= valueOffsetX;

        c.fillText(this.max, x, y - valueTextSize);
        c.fillText(this.max * 0.75, x, y + quaterHeight - valueTextSize);
        c.fillText(this.max * 0.5, x, y + (quaterHeight * 2) - valueTextSize);
        c.fillText(this.max * 0.25, x, y + (quaterHeight * 3) - valueTextSize);
        c.fillText(this.min, x, y + (quaterHeight * 4) - valueTextSize);

        this.drawKeys(c);
        this.plotData(c);

    }
}

const Graph = ({title, data}) =>{

    const canvas = useRef(null);

    useEffect(() =>{
        const g1 = new GraphCanvas(canvas.current, "Player Kills", data);
    });
    

    return (<div>
        <div className="default-header">{title}</div>

        <canvas className={styles.canvas} ref={canvas} width="400" height="400"></canvas>

    </div>);
}


export default Graph;