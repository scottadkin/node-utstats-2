import styles from './Graph.module.css';
import {useEffect, useRef} from 'react';

/**
 * @param data array of data objects {"name": "name1", "data": [....]}
 * @param text optional array of strings that display at every data point the mouse hovers over
 */
class GraphCanvas{

    constructor(canvas, title, data, text){

        this.canvas = canvas;
        this.context = this.canvas.getContext("2d");
        this.aspectRatio = 0.5;
        this.title = title;

        this.defaultWidth = 650;

        this.currentTab = 0;
        this.bMultiTab = false;
        this.totalTabs = 0;
        this.tabHeight = 8;
        this.heightOffset = 0;

        this.data = JSON.parse(data);

        this.text = null;

        if(text !== undefined){
            this.text = JSON.parse(text);
        }

        this.hideKeys = [];

        
        for(let i = 0; i < this.data.length; i++){

            if(Array.isArray(this.data[i])){
                this.bMultiTab = true;
                this.totalTabs++;
            }
        }


        this.keyStartY = 91;

        this.keyCoordinates = [];

        if(this.totalTabs > 1){
            this.graphWidth = 80;
            this.graphHeight = 65;
            this.graphStartX = 15;
            this.graphStartY = 20;
            this.titleStartY = 12;
        }else{
            this.graphWidth = 80;
            this.graphHeight = 75;
            this.graphStartX = 15;
            this.graphStartY = 10;
            this.titleStartY = 2;
        }

        console.log(`bMultiTab = ${this.bMultiTab} totalTabs = ${this.totalTabs}`);

        

        this.mouse = {"x": 0, "y": 0};

        this.maxDataDisplay = 8;
        this.maxDataDisplayFullscreen = 16;
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
            "lightblue",
            "rgb(1,54,141)",
            "rgb(135,243,34)",
            "rgb(43,80,44)",
            "rgb(45,220,197)",
            "rgb(62,19,181)",
            "rgb(126,189,26)",
            "rgb(164,55,56)",
            "rgb(130,23,223)",
        ];

        this.bFullScreen = false;

        this.createHideKeys();
        this.setMaxStringLengths();
        this.calcMinMax();
        

        this.render();

        this.canvas.onfullscreenchange = (e) =>{

            if(document.fullscreenElement !== this.canvas){
                this.bFullScreen = false;
            }else{
                this.bFullScreen = true;
            }

            this.setMaxStringLengths();
            this.calcMinMax();
             this.createMouseOverData(this.graphWidth / this.mostData);

            this.render();
        }

        this.canvas.onfullscreenerror = (e) =>{
            console.log(e);
        }

        this.canvas.addEventListener("mousemove", (e) =>{

            this.mouse.x = this.toPercent(e.offsetX, true);
            this.mouse.y = this.toPercent(e.offsetY, false);

            //console.log(this.mouse);

            if(this.mouse.y >= this.keyStartY){
                //this.canvas.style.cssText = "cursor:default;";
                this.hoverKeys();

            }else if(this.mouse.y >= this.graphStartY && this.mouse.y < this.graphStartY + this.graphHeight
                && this.mouse.x >= this.graphStartX && this.mouse.x < this.graphStartX + this.graphWidth
                ){
                
               
                this.canvas.style.cssText = "cursor:cell;";
                
                
            }else{

                if(this.bFullScreen){
                    this.canvas.style.cssText = "cursor:default;";
                }else{
                    this.canvas.style.cssText = "cursor:zoom-in;";
                }
            }

            if(this.bMultiTab && this.totalTabs > 1){

                if(this.mouse.y <= this.tabHeight){
                    this.hoverTab();
                }
            }

            this.render();
            
        });


        this.canvas.addEventListener("click", (e) =>{

            if(!this.keyEvents()){
            
                if(!this.bMultiTab){
                    this.canvas.requestFullscreen().catch((err) =>{
                        console.log(err);
                    });

                    this.render();
                    return;
                }


                if(this.mouse.y > this.tabHeight){
                    
                    this.canvas.requestFullscreen().catch((err) =>{
                        console.log(err);
                    });
                    
                }else{
                    
                    
                    this.changeTab();
                    //this.render();
                }

            }else{
                this.setMaxStringLengths();
                this.calcMinMax();
                this.createMouseOverData(this.graphWidth / this.mostData);
                
            }

            this.render();
         
        });
    }


    createHideKeys(){

        this.hideKeys = [];

        if(this.totalTabs === 0){

            this.hideKeys.push([]);

        }else{

            for(let i = 0; i < this.totalTabs; i++){
                this.hideKeys.push([]);
            }
        }

        for(let i = 0; i < this.hideKeys.length; i++){

            for(let x = 0; x < this.data[i].length; x++){

                this.hideKeys[i].push((x < 8) ? false : true);
            }
        }
    }

    hoverKeys(){


        let k = 0;
        let heightOffset = 0;


        let y = 0;

        if(this.bFullScreen){
            heightOffset = this.toPercent(window.innerHeight - this.canvas.height, false);
            y = this.mouse.y - heightOffset;   
        }else{
            y = this.mouse.y;
        }

        for(let i = 0; i < this.keyCoordinates.length; i++){

            k = this.keyCoordinates[i];

            
            if(this.mouse.x >= k.x && this.mouse.x < k.x + k.width){
                if(y >= k.y && y < k.y + k.height){
                    this.canvas.style.cssText = "cursor:pointer;";
                    return;
                }
            }
        }

        this.canvas.style.cssText = "cursor:default;";

    }

    keyEvents(){

        let k = 0;

        let heightOffset = 0;
        let y = 0;

        if(this.bFullScreen){
            heightOffset = this.toPercent(window.innerHeight - this.canvas.height, false);
            y = this.mouse.y - heightOffset;    
        }else{
            y = this.mouse.y;
        }
        
        let bChangedValue = false;

        for(let i = 0; i < this.keyCoordinates.length; i++){

            k = this.keyCoordinates[i];

            if(this.mouse.x >= k.x && this.mouse.x < k.x + k.width){

                if(y >= k.y && y < k.y + k.height){

                    this.hideKeys[this.currentTab][i] = !this.hideKeys[this.currentTab][i];
                    //alert(`ok ${i} ${this.bFullScreen}`);
                    bChangedValue = true;
                    break;
                }
            }
        }

        return bChangedValue;
    }

    hoverTab(){
        
        const tabWidth = 100 / this.totalTabs;

        let currentTab = 0;

        for(let i = 0; i < 100; i += tabWidth){

            if(this.mouse.x >= i && this.mouse.x < i + tabWidth){
        
                if(this.data[currentTab][0].data.length < 2){
                    this.canvas.style.cssText = `cursor:no-drop;`;
                    return;
                }       

            }
            currentTab++;
        }

        this.canvas.style.cssText = `cursor:pointer;`;
    }

    changeTab(){


        const tabWidth = 100 / this.totalTabs;

        if(this.hideKeys.length === 0){

            for(let i = 0; i < this.totalTabs; i++){
                this.hideKeys.push([]);
            }

            if(this.totalTabs === 0) this.hideKeys.push([]);
        }

        let currentTab = 0;

        for(let i = 0; i < 100; i += tabWidth){

            if(this.mouse.x >= i && this.mouse.x < i + tabWidth){

                
                //we don't want to swap to tabs that have no data
                if(this.data[currentTab][0].data.length < 2){
                    return;
                }
                
                this.currentTab = currentTab;
                this.setMaxStringLengths();
                this.calcMinMax();
                this.createMouseOverData(this.graphWidth / this.mostData);
                return;
            }

            currentTab++;
        }
    }

    toPercent(input, bWidth){
            
        let percent = 0;

        if(bWidth){

            percent = (100 / this.canvas.width) * input;
        }else{

            if(!this.bFullScreen){

                percent = (100 / this.canvas.height) * input;

            }else{

                const heightOffset = window.innerHeight - this.canvas.height;
                input = input - (heightOffset * 0.5);

                percent = (100 / this.canvas.height) * input;
            }
        }

        return parseFloat(parseFloat(percent).toFixed(2));
    }

    setMaxStringLengths(){

        this.longestLabelLength = 0;
        this.longestValueLength = 0;
        this.longestTextLength = 0;

        this.longestLabel = "";
        this.longestValue = "";
        this.longestText = "";

        let d = 0;

        let currentValueLength = 0;

        let data = [];
        let text = [];

        if(!this.bMultiTab){

            data = this.data;

            if(this.text !== null){
                text = this.text;
            }

        }else{

            data = this.data[this.currentTab];

            if(this.text !== null){
                text = this.text[this.currentTab];
            }
        }

        //console.log(this.hideKeys);

        for(let i = 0; i < data.length; i++){

            if(this.hideKeys[this.currentTab][i]) continue;

            d = data[i];

            if(d.name.length > this.longestLabelLength){
                this.longestLabelLength = d.name.length;
                this.longestLabel = d.name;
            }

            for(let x = 0; x < d.data.length; x++){

                currentValueLength = d.data[x].toString().length;

                if(currentValueLength > this.longestValueLength){
                    this.longestValueLength = currentValueLength;
                    this.longestValue = d.data[x];
                }
            }
        }

        if(text !== null){
            for(let i = 0; i < text.length; i++){

                if(text[i].length > this.longestTextLength){
                    this.longestTextLength = text[i].length;
                    this.longestText = text[i];
                }
            }
        }
    
    }

    calcMinMax(){

        this.min = null;
        this.max = null;
        this.mostData = 0;
        this.range = 0;

        let d = 0;

        let data = [];

        if(!this.bMultiTab){
            data = this.data;
        }else{
            data = this.data[this.currentTab];
        }

        for(let i = 0; i < data.length; i++){

            if(this.hideKeys[this.currentTab][i]) continue;

            if(!this.bFullScreen){
                if(i >= this.maxDataDisplay) break;
            }else{
                if(i >= this.maxDataDisplayFullscreen) break;
            }

            d = data[i];

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

        this.range = Math.abs(this.max) + Math.abs(this.min);

        //console.log(`${this.range} max=${this.max} min=${this.min}`);
    }

    resize(){

        if(!this.bFullScreen){
            this.canvas.height = this.defaultWidth * this.aspectRatio;
            this.canvas.width = this.defaultWidth;
        }else{
            this.canvas.height = window.innerWidth * this.aspectRatio;
            this.canvas.width = window.innerWidth;
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
        const offsetYBit = graphHeight / this.range;

        const blockSize = this.scaleY(0.75);

        let currentX = 0;
        let currentY = 0;

        if(this.mouseOverData === undefined){
            this.createMouseOverData(this.graphWidth / this.mostData);
        }

        let d = 0;

        let data = [];

        if(!this.bMultiTab){
            data = this.data;
        }else{
            data = this.data[this.currentTab];
        }

        for(let i = 0; i < data.length; i++){

            if(this.hideKeys[this.currentTab][i]) continue;

            if(!this.bFullScreen){
                if(i >= this.maxDataDisplay) return;
            }else{
                if(i >= this.maxDataDisplayFullscreen) return;
            }

            if(i < this.colors.length){

                c.fillStyle = this.colors[i];
                c.strokeStyle = this.colors[i];
            }else{
                c.fillStyle = "pink";
                c.strokeStyle = "pink";
            }

            d = data[i];

            c.beginPath();
            c.moveTo(startX,  startY - (offsetYBit * d.data[0]));

            for(let x = 0; x < d.data.length; x++){

                currentX = startX + (offsetXBit * x) - (blockSize * 0.5)
                currentY = startY - (offsetYBit * (d.data[x] - this.min)) - (blockSize * 0.5);
            
                c.lineTo(currentX + (blockSize * 0.5), currentY + (blockSize * 0.5));
            }

            c.stroke();
            c.closePath();

            if(d.data.length <= 20){

                for(let x = 0; x < d.data.length; x++){

                    currentX = startX + (offsetXBit * x)
                    currentY = startY - (offsetYBit * (d.data[x] - this.min));

                    c.beginPath();
                    c.arc(currentX, currentY, blockSize, 0, Math.PI * 2);
                    c.fill();
                    c.closePath();
                 }

            }     
        }
    }
    
    drawKeys(c){

        let startY = this.scaleY(this.keyStartY);
        const keyRowHeight = this.scaleY(3.5);
        const startX = this.scaleX(2);

        let blockSizePercent = 3;

        let blockSize = this.scaleY(blockSizePercent);
        let fontSize = this.scaleY(3.4);

        if(this.bFullScreen){
            //blockSizePercent = 3;
            blockSize = this.scaleY(blockSizePercent);
            fontSize = this.scaleY(2.9);
        }

        const textOffsetX = this.scaleX(0.1);

        let offsetX = 0;

        c.font = `${fontSize}px Arial`;

        c.textAlign = "left";

        let currentX = 0;


        let data = [];

        this.keyCoordinates = [];
        

        if(this.bMultiTab){
            data = this.data[this.currentTab];
        }else{
            data = this.data;
        }

        for(let i = 0; i < data.length; i++){

            if(!this.bFullScreen){
                if(i >= this.maxDataDisplay) return;
            }else{
                if(i >= this.maxDataDisplayFullscreen) return;
            }

            if(i < this.colors.length){
                c.fillStyle = this.colors[i];
            }else{
                c.fillStyle = "pink";
            }

            if(i % 8 === 0) offsetX = 0;
            if(i === 8) startY += keyRowHeight; 

            currentX = startX + offsetX + (blockSize * (i % 8));

            this.keyCoordinates.push({
                "x": this.toPercent(currentX, true),
                "y": this.toPercent(startY, false),
                "width": blockSizePercent,
                "height": blockSizePercent
            });

      
            c.fillRect(currentX, startY, blockSize, blockSize);
            
            if(this.hideKeys[this.currentTab][i]){
                c.fillStyle = "black";
                c.fillRect(currentX, startY, blockSize, blockSize);
            }

            c.fillText(data[i].name, currentX + blockSize + textOffsetX, startY);
            
            offsetX += c.measureText(`${data[i].name}_`).width;
            
        }
    }


    createMouseOverData(offsetXBit){

        this.mouseOverData = [];

        const startX = this.graphStartX;

        let currentData = [];

        let maxDataValues = 0;
        
        if(!this.bMultiTab){

            if(!this.bFullScreen){
                maxDataValues = (this.data.length < this.maxDataDisplay) ? this.data.length : this.maxDataDisplay;
            }else{
                maxDataValues = (this.data.length < this.maxDataDisplayFullscreen) ? this.data.length : this.maxDataDisplayFullscreen;
            }

        }else{
            if(!this.bFullScreen){
                maxDataValues = (this.data[this.currentTab].length < this.maxDataDisplay) ? this.data[this.currentTab].length : this.maxDataDisplay;
            }else{
                maxDataValues = (this.data[this.currentTab].length < this.maxDataDisplayFullscreen) ? this.data[this.currentTab].length : this.maxDataDisplayFullscreen;
            }
        }

        let data = [];


        if(!this.bMultiTab){
            data = this.data;

        }else{
            data = this.data[this.currentTab];
        }


        //all data must have same length
        for(let i = 0; i < data[0].data.length; i++){
            

            currentData = [];      

            for(let x = 0; x < maxDataValues; x++){
                
                if(this.hideKeys[this.currentTab][x]) continue;
                currentData.push({"id": x, "label": data[x].name, "value": data[x].data[i]});
                
            }

            this.mouseOverData.push({
                "startX": startX + (offsetXBit * (i - 1)),
                "endX": startX + (offsetXBit * i),
                "title": `Data Point ${i}`,
                "data": currentData
            });
        }
        
    }

    getHoverData(){

        const targetX = this.mouse.x;

        let m = 0;
       // console.log(this.text);

        for(let i = 0; i < this.mouseOverData.length; i++){

            m = this.mouseOverData[i];

            if(targetX >= m.startX && targetX < m.endX){

                if(this.text === null){
                    return {"title": m.title, "data": m.data};
                }else{

                    if(!this.bMultiTab){
                        return {"title": m.title, "data": m.data, "text": this.text[i - 1]};
                    }else{

                        if(this.text[this.currentTab] !== null){
                            return {"title": m.title, "data": m.data, "text": this.text[this.currentTab][i]};
                        }else{
                            return {"title": m.title, "data": m.data};
                        }
                    }
                }
            }
        }

        return {"title": "", "data": []};
    }

    renderHover(c){

        if(this.mouse.x < this.graphStartX || this.mouse.x > this.graphStartX + this.graphWidth) return;
        if(this.mouse.y < this.graphStartY || this.mouse.y > this.graphStartY + this.graphHeight) return;

        const hoverData = this.getHoverData();

        if(hoverData.data.length === 0) return;

        c.fillStyle = "rgba(12,12,12,0.9)";
        c.strokeStyle = "rgba(255,255,255,0.9)";
        c.lineWidth = this.scaleY(0.125);

        let fontSizePercent = 5;
        let headerFontSizePercent = 3;
        let widthPadding = 6;

        if(this.bFullScreen){
            fontSizePercent = 2.25;
            headerFontSizePercent = 1.7;
        }

        const fontSize = this.scaleY(fontSizePercent);
        const headerFontSize = this.scaleY(headerFontSizePercent);

        c.font = `${fontSize}px Arial`;

        const labelWidth = c.measureText(this.longestLabel).width;
        const valueWidth = c.measureText(this.longestValue).width;

        let widthPercent = this.toPercent(labelWidth + valueWidth, true) + widthPadding;

        let currentText = this.text;

        if(this.bMultiTab && this.text !== null){
            currentText = this.text[this.currentTab];
        }

        if(currentText !== null){

            const textWidth = c.measureText(this.longestText).width;

            if(labelWidth + valueWidth < textWidth){
                widthPercent = this.toPercent(textWidth, true) + widthPadding;
            }

        }

        const paddingBottomRows = (currentText === null) ? 1 : 2;
        const heightPercent = headerFontSizePercent + (fontSizePercent * (hoverData.data.length + paddingBottomRows));

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

        c.font = `${headerFontSize}px Arial`;

        c.textAlign = "center";
        c.fillStyle = "rgb(150,150,150)";

        let titleHeaderOffsetY = 2;

        if(this.bFullScreen){
            titleHeaderOffsetY = 1;
        }

        c.fillText(`${hoverData.title}`, x + (width * 0.5), y + this.scaleY(titleHeaderOffsetY));

        c.fillStyle = "white";
        c.font = `${fontSize}px Arial`;

        let offsetY = this.scaleY(6);

        if(this.bFullScreen){
            offsetY = this.scaleY(3);
        }

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

        //sort by value keeping data colors

        let color = "red";

        let labelOffsetX = this.scaleX(2);
        let valueOffsetX = this.scaleX(4);

        if(this.bFullScreen){

            labelOffsetX = this.scaleX(1);
            valueOffsetX = this.scaleX(5);
        }

        for(let i = 0; i < hoverData.data.length; i++){

            if(this.colors[hoverData.data[i].id] !== undefined){
                color = this.colors[hoverData.data[i].id];
            }else{
                color = "red";
            }

            c.fillStyle = color;
            
            c.textAlign = "left";
            c.fillText(hoverData.data[i].label, x + labelOffsetX, y + offsetY);
            c.textAlign = "right";
            c.fillText(hoverData.data[i].value, x + this.scaleX(widthPercent - 1), y + offsetY);
            offsetY += fontSize;
        }

        c.textAlign = "center";
        if(hoverData.text !== undefined){

            c.font = `${fontSize * 0.9}px Arial`;
            c.fillStyle = "white";
            const textWidth = c.measureText(hoverData.text).width;
            c.fillText(hoverData.text, x + labelOffsetX + (textWidth * 0.5), y + offsetY + this.scaleY(0.4));
        }

        c.textAlign = "left";

        

    }

    renderTabs(c){

        if(this.totalTabs <= 1) return;
        const tabSize = this.scaleX(100 / this.totalTabs);

        const height = this.scaleY(this.tabHeight);

        c.fillStyle = "orange";
        c.strokeStyle = "white";

        c.textAlign = "center";

        let x = 0;
        let y = 0;

        c.font = `${this.scaleY(3.5)}px Arial`;

        const selectedTabPattern = c.createLinearGradient(0, 0, 0, height);

        selectedTabPattern.addColorStop(0, "rgb(3,3,3)");
        selectedTabPattern.addColorStop(1, "rgb(64,64,64)");

        for(let i = 0; i < this.totalTabs; i++){

            x = tabSize * i;
            y = 0;

            if(i !== this.currentTab){
                c.fillStyle = "black";
            }else{
                c.fillStyle = selectedTabPattern;
            }

            c.fillRect(x, y, tabSize, height);
            c.strokeRect(x, y, tabSize, height);
            
            if(i !== this.currentTab){
                c.fillStyle = "white";
            }else{
                c.fillStyle = "yellow";
            }

            c.fillText(this.title[i], x + (tabSize * 0.5), y + this.scaleY(2.25));
            
            
            if(this.bMultiTab){

                c.fillStyle = "rgba(100,0,0,0.45)";

                if(this.data[i][0].data.length < 2){
                    c.fillRect(x, y, tabSize, height);
                }
            }
            
        }

        c.textAlign = "left";
    }

    render(){

        this.resize();

        const c = this.context;

        c.textAlign = "center";
        c.textBaseline = "top";


        const pattern = c.createLinearGradient(0,0, this.scaleX(100), this.scaleY(100));

        pattern.addColorStop(0,"rgb(3,3,3)");
        pattern.addColorStop(0.35,"rgb(24,24,24)");
        pattern.addColorStop(0.65,"rgb(24,24,24)");
        pattern.addColorStop(1,"rgb(3,3,3)");

        c.fillStyle = pattern;
        c.fillRect(0,0,this.canvas.width, this.canvas.height);

        c.fillStyle = "white";

        c.font = `${this.scaleY(6)}px Arial`;

        const titleOffsetY = this.scaleY(this.titleStartY);

        if(this.totalTabs > 1){
            c.fillText(this.title[this.currentTab], this.scaleX(50), titleOffsetY);
            this.renderTabs(c);
        }else{
            c.fillText(this.title, this.scaleX(50), titleOffsetY);
        }

       

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

        if(this.min !== null && this.max !== null){
            c.fillText(this.max, x, y - valueTextSize);
            c.fillText(this.min + (this.range * 0.75), x, y + quaterHeight - valueTextSize);
            c.fillText(this.min + (this.range * 0.5), x, y + (quaterHeight * 2) - valueTextSize);
            c.fillText(this.min + (this.range * 0.25), x, y + (quaterHeight * 3) - valueTextSize);
            c.fillText(this.min, x, y + (quaterHeight * 4) - valueTextSize);
        }

        this.drawKeys(c);
        this.plotData(c);

        c.fillStyle = "white";

        //c.fillText(`${this.mouse.x} ${this.mouse.y} ${this.bFullScreen} canvas = ${this.canvas.width} ${this.canvas.height} window = ${window.innerWidth} ${window.innerHeight}`, 10, 5);


        this.renderHover(c);

    }
}

const Graph = ({title, data, text}) =>{

    const canvas = useRef(null);

    useEffect(() =>{
        const g1 = new GraphCanvas(canvas.current, title, data, text);
    });
    

    return (<canvas className={styles.canvas} ref={canvas} width="100" height="100"></canvas>);
}


export default Graph;