import {useEffect, useState, useRef} from "react";
import styles from "./PieChart.module.css";

class CanvasPieChart{

    constructor(ref, titles, data, controller){

        this.canvas = ref.current;
        this.context = this.canvas.getContext("2d");
        this.controller = controller;

        this.font = "Montserrat";

        this.tabsHeight = 10;
        this.altTabsWidth = 7.5;
        this.maxTabsAtOnce = 3;
        this.tabOffset = 0;
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

        const totalTabs = (this.titles.length <= this.maxTabsAtOnce) ? this.titles.length : this.maxTabsAtOnce;

        const tabWidth = this.toPixels((100 - this.altTabsWidth * 2) / totalTabs, false);

        if(y <= tabHeightPixels){

            const previousTab = this.selectedTab;

            x = x - this.toPixels(this.altTabsWidth, false);

            const selectedTabIndex = Math.floor(x / tabWidth);

            const newTab = this.tabOffset + selectedTabIndex;

            if(selectedTabIndex >= 0 && selectedTabIndex < totalTabs){

                this.selectedTab = newTab;

            }else{

                if(selectedTabIndex < 0 && this.tabOffset > 0){

                    this.tabOffset--;
                    //move selected tab down if the selected tab goes off screen
                    if(this.selectedTab >= this.tabOffset + totalTabs) this.selectedTab--;
                }

                if(selectedTabIndex >= totalTabs && this.tabOffset < this.titles.length - this.maxTabsAtOnce){
                    this.tabOffset++;
                    //move selected tab up if the selected tab goes off screen
                    if(this.selectedTab < this.tabOffset) this.selectedTab++;
                }


                this.render();
                return;
            }

            if(this.selectedTab !== previousTab){
                this.render();
            }
            
        }
    }

    scaleMousePosition(x, y){

        const bounds = this.canvas.getBoundingClientRect();

        const scaleX = this.canvas.width / bounds.width;
        const scaleY = this.canvas.height / bounds.height;
 
        return {
            "x": (x - bounds.left) * scaleX, 
            "y": (y - bounds.top) * scaleY
        }
    }

    createEvents(){
        
        this.canvas.addEventListener("mousemove", (e) =>{

            const {x, y} = this.scaleMousePosition(e.clientX, e.clientY);
 
            this.mouse.x = x;
            this.mouse.y = y;

            this.render();

        }, this.controller);

        this.canvas.addEventListener("mousedown", (e) =>{

            const {x, y} = this.scaleMousePosition(e.clientX, e.clientY);

            this.handleClick(x, y);

        }, this.controller);
    }

    renderTabs(c){

        const totalTabs = (this.titles.length <= this.maxTabsAtOnce) ? this.titles.length : this.maxTabsAtOnce;

        let lastTab = 0;

        if(this.tabOffset + totalTabs >= this.titles.length){
            lastTab = this.titles.length;
        }else{
            lastTab = this.tabOffset + totalTabs;
        }

        const width = (this.canvas.width - this.toPixels(this.altTabsWidth * 2, false)) / totalTabs;

        c.font = `${this.toPixels(this.tabsHeight * 0.6, true)}px ${this.font}`;

        const fontYOffset = this.toPixels(this.tabsHeight * 0.2, true)

        c.fillStyle = "rgb(64,64,64)";
        c.textAlign = "center";

        c.lineWidth = this.toPixels(0.2, true);

        if(totalTabs < this.titles.length){
            c.fillRect(0,0,this.toPixels(this.altTabsWidth, false), this.toPixels(this.tabsHeight, true));
            c.fillRect(this.toPixels(100 - this.altTabsWidth, false),0,this.toPixels(this.altTabsWidth, false), this.toPixels(this.tabsHeight, true));

            c.fillStyle = "white";
            c.fillText("<<",this.toPixels(this.altTabsWidth * 0.5, false), fontYOffset);
            c.fillText(">>",this.toPixels(100 - (this.altTabsWidth * 0.5), false), fontYOffset);
        }

        let index = 0;

        for(let i = this.tabOffset; i < lastTab; i++){
  
            const t = this.titles[i];

            if(i !== this.selectedTab){
                c.fillStyle = "rgb(28,28,28)";
            }else{
                c.fillStyle = "rgb(64,0,0)";
            }

            c.strokeStyle = "rgb(46,46,46)";
            

            const x = this.toPixels(this.altTabsWidth, false) + width * index;

            c.fillRect(x, 0, width, this.toPixels(this.tabsHeight, true));
            c.strokeRect(x, 0, width, this.toPixels(this.tabsHeight, true));

            c.fillStyle = "white";

            c.fillText(t, x + (width * 0.5), fontYOffset);

            index++;
        }

        c.textAlign = "left";
    }


    renderSlice(c, startAngle, angle, sliceNumber){

        const x = this.toPixels(80, false);
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

    renderKeys(c){

        let offsetY = 20;
        const offsetX = 3.5;

        const fontSize = this.toPixels(4.7, true);
        const rowHeight = 7;

        c.font = `${fontSize}px ${this.font}`;

        for(let i = 0; i < this.data[this.selectedTab].data.length; i++){

            const name = this.data[this.selectedTab].data[i].name;
            const value = this.data[this.selectedTab].data[i].value;
            const percent = this.data[this.selectedTab].data[i].value * this.data[this.selectedTab].percentValue;

            c.fillStyle = this.colors[i];

            const x = this.toPixels(offsetX, false);
            const y = this.toPixels(offsetY + (rowHeight * i), true);

            c.fillRect(this.toPixels(0.5, false), y, this.toPixels(2, false), fontSize);

            c.font = `bold ${fontSize}px ${this.font}`;

            const valueString = `${value} (${parseFloat(percent.toFixed(2))}%)`;

            c.fillText(valueString, x, y);

            const valueWidth = c.measureText(`${valueString} `).width;

            c.font = `${fontSize}px ${this.font}`;
            c.fillText(name, x + valueWidth, y);
        }
    }

    render(){

        const c = this.context;
        c.textBaseline = "top";

        c.fillStyle = "black";

        c.fillRect(0,0,this.toPixels(100, false),this.toPixels(100, true));

        c.fillStyle = "white";

        c.fillRect(this.mouse.x, this.mouse.y, this.toPixels(1, false),this.toPixels(1, true));

        this.renderTabs(c);
        this.renderPie(c);
        this.renderKeys(c);

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
    

    return <div className={`${styles.wrapper} no-select`}>
        <canvas ref={canvasRef} width={650} height={292}></canvas>
    </div>
}

export default PieChart;