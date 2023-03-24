import {useEffect, useState, useRef} from "react";

class CanvasPieChart{

    constructor(ref, titles, data, controller){

        this.canvas = ref.current;
        this.context = this.canvas.getContext("2d");
        this.controller = controller;

        this.tabsHeight = 10;
        this.selectedTab = 0;

        this.colors = [
            "rgb(255,0,0)",
            "rgb(60,101,156)",
            "rgb(0,150,0)",
            "rgb(255,255,0)",
            "rgb(128,128,128)",
            "rgb(255,192,203)",
            "rgb(255,165,0)",
            "rgb(173,216,230)",
            "rgb(1,54,141)",
            "rgb(135,243,34)",
            "rgb(43,80,44)",
            "rgb(45,220,197)",
            "rgb(62,19,181)",
            "rgb(126,189,26)",
            "rgb(164,55,56)",
            "rgb(130,23,223)",
        ];

        this.mouse = {"x": -999, "y": -999};

        this.titles = titles;
        this.data = data;
        

        this.createData();
        this.createEvents();

        this.render();   
    }

    toPixels(value, bHeight){
        
        const size = (bHeight) ? this.canvas.height : this.canvas.width 

        return (size / 100) * value;
    }

    y(value){
        return (this.canvas.height / 100) * value;
    }

    toPercent(value, bHeight){

        if(value === 0) return 0;

        const max = (bHeight) ? this.canvas.height : this.canvas.width;

        return value / max;
    }

    createData(){

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            let totalValue = 0;

            for(let x = 0; x < d.length; x++){

                totalValue += d[x].value;
            }

            let percentValue = 0;

            if(totalValue !== 0){
                percentValue = 100 / totalValue;
            }else{
                percentValue = 0;
            }

            this.data[i] = {"data": d, "totalValue": totalValue, "percentValue": percentValue};
        }
    }

    handleClick(x, y){

        const tabHeightPixels = this.toPixels(this.tabsHeight, true);

        const tabWidth = this.toPixels(100 / this.titles.length, false);

        if(y <= tabHeightPixels){

            const previousTab = this.selectedTab;

            this.selectedTab = Math.floor(x / tabWidth);

            if(this.selectedTab !== previousTab){
                this.render();
            }
            
        }
    }

    createEvents(){
        
        this.canvas.addEventListener("mousemove", (e) =>{

            const bounds = this.canvas.getBoundingClientRect();

            this.mouse.x = e.clientX - bounds.left;
            this.mouse.y = e.clientY - bounds.top;

            this.render();

        }, this.controller);

        this.canvas.addEventListener("mousedown", (e) =>{

            const bounds = this.canvas.getBoundingClientRect();

            const x = e.clientX - bounds.left;
            const y = e.clientY - bounds.top;

            this.handleClick(x, y);

        }, this.controller);
    }

    renderTabs(){

        const c = this.context;
        const width = this.canvas.width / this.titles.length;

        c.font = `${this.toPixels(this.tabsHeight * 0.7, true)}px Arial`;

        c.fillStyle = "red";
        c.textAlign = "center";


        for(let i = 0; i < this.titles.length; i++){

            const t = this.titles[i];

            c.fillStyle = this.colors[i];

            const x = width * i;

            c.fillRect(x, 0, width, this.toPixels(this.tabsHeight, true));

            c.fillStyle = "white";
            c.fillText(t, x + (width * 0.5), this.toPixels(this.tabsHeight * 0.15, true));
        }

        c.textAlign = "left";
    }


    renderSlice(c, startAngle, angle, sliceNumber){

        const x = this.toPixels(75, false);
        const y = this.toPixels(60, true);

        c.beginPath();
        c.strokeStyle = this.colors[sliceNumber];
        c.fillStyle = this.colors[sliceNumber];
        c.moveTo(x, y);
        c.arc(x, y, this.toPixels(35, true), startAngle * (Math.PI / 180), (startAngle + angle) * (Math.PI / 180));
        c.moveTo(x, y);
        //c.lineTo(1337,1337);
        c.fill();
        c.stroke();
        

        c.closePath();
    }

    renderPie(c){

        let currentAngle = 0;

        for(let i = 0; i < this.data[this.selectedTab].data.length; i++){

            const d = this.data[this.selectedTab];
            const angle = (d.data[i].value * d.percentValue) * 3.6;

            this.renderSlice(c, currentAngle, angle, i);

            currentAngle += angle;
        }
    }

    render(){

        const c = this.context;
        c.textBaseline = "top";

        c.fillStyle = "black";

        c.fillRect(0,0,this.toPixels(100, false),this.toPixels(100, true));

        c.fillStyle = "white";

        c.fillRect(this.mouse.x, this.mouse.y, this.toPixels(1, false),this.toPixels(1, true));

        this.renderTabs();


        this.renderPie(c);
    }
}

const PieChart = ({titles, data}) =>{

    const canvasRef = useRef(null);

    useEffect(() =>{

        const controller = new AbortController();

        const test = new CanvasPieChart(canvasRef, titles, data, controller);

        return () =>{
            controller.abort();
        }
    },[titles, data]);

    return <canvas ref={canvasRef} width={960} height={540}></canvas>
}

export default PieChart;