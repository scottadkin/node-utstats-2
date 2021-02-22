import styles from './Graph.module.css';
import {useEffect, useRef} from 'react';

class GraphCanvas{

    constructor(canvas, title, data){

        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.aspectRatio = 2;
        this.title = title;

        this.data = JSON.parse(data);

        this.mouse = {"x": 0, "y": 0};

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
           // console.log('ok');
           // console.log(e);

            if(document.fullscreenElement !== this.canvas){
                this.resize(false);
                this.render();
            }
        }

        this.canvas.onfullscreenerror = (e) =>{
            console.log(e);
        }

        this.canvas.addEventListener("mousemove", (e) =>{

            const toPercent = (input, bWidth) =>{
            
                let percent = 0;

                if(bWidth){
                    percent = (100 / this.canvas.width) * input;
                }else{
                    percent = (100 / this.canvas.height) * input;
                }
                return parseFloat(parseFloat(percent).toFixed(2));
            }

            this.mouse.x = toPercent(e.offsetX, true);
            this.mouse.y = toPercent(e.offsetY, false);

            this.render();
            
        });

        this.canvas.addEventListener("click", (e) =>{

            this.canvas.requestFullscreen().catch((err) =>{
                console.log(err);
            });
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

        if(this.mouseOverData === undefined){
            this.createMouseOverData(this.graphWidth / this.mostData);
            console.log(this.mouseOverData)
        }

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


    createMouseOverData(offsetXBit){

        this.mouseOverData = [];

        const startX = this.graphStartX;

        //let currentValues = [];
        //let currentLabels = [];
        let currentData = [];
        const maxDataValues = (this.data[0].data.length <= this.maxDataDisplay) ? this.data[0].data.length : this.maxDataDisplay;


        for(let i = 0; i < this.data[0].data.length; i++){

            currentData = [];

            for(let x = 0; x < maxDataValues; x++){

               // currentValues.push(this.data[x].data[i]);
               // currentLabels.push(this.data[x].name);

               currentData.push({"id": x, "label": this.data[x].name, "value": this.data[x].data[i]});
            }

            this.mouseOverData.push({
                "startX": startX + (offsetXBit * i),
                "endX": startX + (offsetXBit * (i + 1)),
                "title": `Data Point ${i}`,
                "data": currentData
            });
        }

       // console.log(this.mouseOverData);

    }


    getHoverData(){

        const targetX = this.mouse.x;

        let m = 0;

        for(let i = 0; i < this.mouseOverData.length; i++){

            m = this.mouseOverData[i];

            if(targetX >= m.startX && targetX < m.endX){
                return {"title": m.title, "data": m.data};
            }
        }

        return {"title": "nooooooo", "data": []};
    }

    renderHover(c){

        if(this.mouse.x < this.graphStartX || this.mouse.x > this.graphStartX + this.graphWidth) return;

        c.fillStyle = "rgba(12,12,12,0.9)";
        c.strokeStyle = "rgba(255,255,255,0.9)";
        c.lineWidth = this.scaleY(0.125);

        const widthPercent = 30;
        const heightPercent = 50;

        let x = this.scaleX(this.mouse.x - widthPercent);
        let y = this.scaleY(this.mouse.y - heightPercent);

        const width = this.scaleX(widthPercent);
        const height = this.scaleY(heightPercent);

        //change it to be above cursor instead of below

        if(this.mouse.x - widthPercent < 0){
            x = 0;
        }

        if(this.mouse.y - heightPercent < 0){
            y = 0;
        }


        c.fillRect(x, y, width, height);
        c.strokeRect(x, y, width, height);

        
        const fontSize = this.scaleY(5);
        const headerFontSize = this.scaleY(3);

        c.font = `${headerFontSize}px Arial`;

        const hoverData = this.getHoverData();


        c.textAlign = "center";
        c.fillStyle = "rgb(150,150,150)";

        c.fillText(`${hoverData.title}`, x + (width * 0.5), y + this.scaleY(2));

        c.fillStyle = "white";

        c.font = `${fontSize}px Arial`;

        let offsetY = this.scaleY(6);

        let currentString = "";

        hoverData.data.sort((a,b) =>{

            a = a.value;
            b = b.value;

            if(a < b){
                return 1;
            }else if(a > b){
                return -1;
            }
            return 0;
        });

       // console.log(hoverData);

        //sort by value keeping data colors

        let color = "red";

        for(let i = 0; i < hoverData.data.length; i++){

            if(this.colors[hoverData.data[i].id] !== undefined){
                color = this.colors[hoverData.data[i].id];
            }else{
                color = "red";
            }

            c.fillStyle = color;
            //currentString = `${hoverData.data[i].label} ${hoverData.data[i].value}`;
            //c.fillText(currentString, x + (width * 0.5), y + offsetY);
            c.textAlign = "left";
            c.fillText(hoverData.data[i].label, x + this.scaleX(2), y + offsetY);
            c.textAlign = "right";
            c.fillText(hoverData.data[i].value, x + this.scaleX(28), y + offsetY);
            offsetY += fontSize;
        }

        c.textAlign = "left";

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

        c.fillStyle = "white";

        c.fillText(`${this.mouse.x} ${this.mouse.y}`, 10, 10);


        this.renderHover(c);

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