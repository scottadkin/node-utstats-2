
class Graph{

    constructor(canvas, abortController, width, height, tabs, bHideEmptyTabs, data, maxDataPoints, style, bEnableAdvanced){
       
        this.canvas = canvas;
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = canvas.getContext("2d");
        this.context.textBaseline = "top";
        this.abortController = abortController;
        this.lastClickTime = -999;
        this.maxDataPoints = maxDataPoints;
        this.bEnableAdvanced = (bEnableAdvanced !== undefined) ? bEnableAdvanced : false;

        this.bHideEmptyTabs = bHideEmptyTabs;

        this.style = style;

        this.currentData = [];
        this.currentLabels = [];
        this.hoverDataIndex = null;

        this.canvasScale = {"x": 1, "y": 1};

        this.tabHeight = 6;

        this.subCanvases = [];
        this.tabs = tabs;

        this.data = data.data;
        this.labels = data.labels;
        this.labelsPrefix = data.labelsPrefix;

        this.removeEmptyTabs();

        this.graph = {
            "position": {"x": 10, "y": 15},
            "size": {"width": 89, "height": 70}
        };


        this.advancedMenu = {
            "startX": 82,
            "startY": this.tabHeight,
            "width": 18,
            "titleFontSize": 3,
            "titleOffsetY": 1,
            "fontSize": 2.7,
            "rowHeight": 3,
            "height": {
                "button": 5.5,
                "menu": 40
            },
            "textOffsetX": 0.75    
        };

        this.tabOffset = 0;
        this.selectedTab = 0;
 
        this.defaultColor = "red";
        this.mousePosition = {"x": -999, "y": -999};
        this.mouseClickPosition = null;

        this.bFullscreen = false;

        this.bNeedToReRender = false;

        this.hiddenKeys = {};

        this.bShowAdvanced = false;

        this.initialStyle = this.canvas.style;
        this.cursorStyle = null;

        this.dataPointOptions = [
            {"name": "5", "value": 5},
            {"name": "10", "value": 10},
            {"name": "20", "value": 20},
            {"name": "25", "value": 25},
            {"name": "50", "value": 50},
            {"name": "100", "value": 100},
            {"name": "250", "value": 250},
            {"name": "500", "value": 500},
            {"name": "All", "value": 0}
        ];

        this.defaultDataColors = [
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
        

        this.setMinMax();

        this.createEvents();
        this.setStyle();
        this.render();
    }

    bTabHaveData(index){

        for(let i = 0; i < this.data[index].length; i++){

            const d = this.data[index];
  
            for(let x = 0; x < d.length; x++){

                const length = d[x].values.length;
                
                if(length > 0) return true;
            }
        }

        return false;
    }

    removeEmptyTabs(){

        if(!this.bHideEmptyTabs) return;

        const validTabs = [];
        const validData = [];

        for(let i = 0; i < this.tabs.length; i++){

            if(this.bTabHaveData(i)){
                validTabs.push(this.tabs[i]);
                validData.push(this.data[i]);
            }
        }

        this.tabs = validTabs;
        this.data = validData;
    }


    setStyle(){

        const defaultStyle = {
            "backgroundColor": "rgb(32,32,32)",
            "titleColor": "white",
            "tabs": {
                "background": "rgb(16,16,16)",
                "fontColor": "white",
                "activeBackground": "rgb(64,64,64)",
                "activeFontColor": "yellow",
                "hoverBackground": "rgb(46,46,46)",
                "hoverFontColor": "white"
            },
            "axisFontColor": "white",
            "lineColor": "rgba(255,255,255,0.25)",
            "quaterGradient": null,
            "plotAreaBackground": "rgba(255,255,255,0.08)"
        };
        
        if(this.style == undefined){
            this.style = defaultStyle;
            return;
        }

        for(const key of Object.keys(defaultStyle)){

            if(this.style[key] === undefined){
                this.style[key] = defaultStyle[key];
                continue;
            }

            const type = typeof this.style[key];

            if(this.style[key] !== null && type === "object"){
     
                for(const subKey of Object.keys(defaultStyle[key])){
                    this.style[key][subKey] = defaultStyle[key][subKey]
                }   
            }   
        }
    }


    reduceDataPoints(data, labels){


        //no limit
        if(this.maxDataPoints === 0) return {"data": data,"labels": labels};

        const outputData = [];
        const outputLabels = [];


        let mostDataPoints = 0;

        for(let i = 0; i < data.length; i++){

            if(data[i].values.length > mostDataPoints) mostDataPoints = data[i].values.length;   
            
            outputData.push({
                "name": data[i].name,
                "color": data[i].color,
                "values": []
            });
        }

        let increment = 1;

        if(mostDataPoints > this.maxDataPoints){   
            increment = mostDataPoints / this.maxDataPoints;
        }

        let bMissingFinal = true;

        for(let i = 0; i < data.length; i++){

            for(let x = 0; x < this.maxDataPoints; x ++/*+= increment*/){

                const currentIndex = Math.round(x * increment);

                if(i === 0){
                    outputLabels.push(labels[currentIndex]);
                }

                outputData[i].values.push(data[i].values[currentIndex]);

                if(currentIndex === data[i].values.length - 1) bMissingFinal = false;
            }
        }

        if(bMissingFinal){

            outputLabels.push(labels[labels.length - 1]);

            for(let i = 0; i < data.length; i++){

                outputData[i].values.push(data[i].values[data[i].values.length - 1]);
            }
        }

        return {"data": outputData, "labels": outputLabels};
    }

    setTotalDataPoints(){


        this.totalDataPoints = 0;

        const data = this.data[this.selectedTab];

        for(let i = 0; i < data.length; i++){

            const currentCount = data[i].values.length;

            if(currentCount > this.totalDataPoints) this.totalDataPoints = currentCount;
        }
    }

    setMinMax(){

        this.min = null;
        this.max = null;

        

        this.setTotalDataPoints();

        //to prevent graphs looking strange after changing tab
        if(this.totalDataPoints < this.maxDataPoints) this.maxDataPoints = 0;

        const {data, labels} = this.reduceDataPoints(this.data[this.selectedTab], this.labels[this.selectedTab]);

        this.currentData = data;
        this.currentLabels = labels;

        let mostDataPoints = 0;

        for(let i = 0; i < data.length; i++){

            const {values} = data[i];

            if(values.length > mostDataPoints){
                mostDataPoints = values.length;
            }

            for(let x = 0; x < values.length; x++){

                const value = values[x];

                

                if(this.min === null || value < this.min){
                    this.min = value;
                } 

                if(this.max === null || value > this.max){
                    this.max = value;
                } 
            }
        }

        if(this.min == null || this.max == null) return;

        this.min = Math.floor(this.min);
        if(this.min > 0) this.min = 0;
        this.max = Math.ceil(this.max);

        this.range = this.max - this.min;
       //return;
        const quater = this.range * 0.25;

        const rem = quater % 1;

        if(rem !== 0){

            this.range = (quater + (1 - rem)) * 4;
            this.max = Math.ceil(this.min + this.range);
            this.range = this.max - this.min;
        }
        
        this.distanceBetweenPoints = this.graph.size.width / (mostDataPoints + 1);

    }

    /**
     * 
     * @param {*} type either x or y
     * @param {*} value size in percent
     * @returns size in pixels
     */
    scale(type, value){

        if(value === 0) return 0;

        type = type.toLowerCase();

        let size = 0;

        if(type === "x"){
            size = this.canvas.width;
        }else if(type === "y"){
            size = this.canvas.height;
        }else{
            throw new Error(`${type} is not a valid scale type.`);
        }
        
        if(size === 0) return 0;

        const bit = size / 100;

        return bit * value;
    }

    /**
     * 
     * @param {*} type either x or y
     * @param {*} value size in pixels
     * @returns size in percent
     */
    reverseScale(type, value){

        if(value === 0) return 0;

        type = type.toLowerCase();

        let size = 0;

        if(type === "x"){

            size = this.canvas.width;

        }else if(type === "y"){

            size = this.canvas.height;

        }else{
            throw new Error(`${type} is not a valid reverse scale type.`);
        }

        if(size === 0) return 0;

        const bit = 100 / size;
        return bit * value;
    }

    test(){
        console.log("test");
    }


    updateScale(){

        const bounds = this.canvas.getBoundingClientRect();
        this.canvasScale.x = this.canvas.width / bounds.width;
        this.canvasScale.y = this.canvas.height / bounds.height;
    }


    /**
     * Get the correct mouse position including the scale changes
     */
    getTrueMousePosition(e){

        const bounds = this.canvas.getBoundingClientRect();

        const mouseX = e.clientX - bounds.x;
        const mouseY = e.clientY - bounds.y;

        const trueX = this.reverseScale("x", mouseX * this.canvasScale.x);
        const trueY = this.reverseScale("y", mouseY * this.canvasScale.y);

        return {"x": trueX, "y": trueY}
    }

    bMouseOverArea(startX, startY, width, height, bClick){
        

        if(bClick === undefined) bClick = false;
        if(bClick && this.mouseClickPosition === null) return false;
        
        let x = -999;
        let y = -999;

        if(bClick){
            x = this.mouseClickPosition.x;
            y = this.mouseClickPosition.y;
        }else{
            x = this.mousePosition.x;
            y = this.mousePosition.y;
        }


        if(x >= startX && x <= startX + width){

            if(y >= startY && y <= startY + height){
                return true;
            }
        }

        return false;
    }

    bMouseOverPlotArea(){

        const startX = this.graph.position.x;
        const startY = this.graph.position.y;
        
        return this.bMouseOverArea(startX, startY, this.graph.size.width, this.graph.size.height, false);

    }

    bMouseOverKeysArea(){

        const startX = 0;
        const startY = this.graph.position.y + this.graph.size.height;

        return this.bMouseOverArea(startX, startY, 100, 100 - startY, false);
    }


    toggleFullscreen(){

        //to prevent resize toggle on first click after change
        this.lastClickTime = -999;

        if(!document.fullscreenElement){

            this.canvas.requestFullscreen().catch((err) =>{
                console.trace(err);
            });

        }else{
            document.exitFullscreen();
        }
    }

    bMouseOverAdvancedMenu(){

        const x = this.mousePosition.x;
        const y = this.mousePosition.y;

        const height = (this.bShowAdvanced) ? this.getAdvancedMenuHeight() : this.advancedMenu.height.button;

        if(x >= this.advancedMenu.startX && x <= this.advancedMenu.width + this.advancedMenu.startX){
            
            if(y >= this.advancedMenu.startY && y <= this.advancedMenu.startY + height){
                return true;
            }
        }

        return false;
    }

    bMouseOverTabsArea(){

        return this.bMouseOverArea(0,0,this.canvas.width, this.tabHeight);
      
    }

    createEvents(){

        const signal = this.abortController.signal;

        this.canvas.addEventListener("mousemove", (e) =>{

            //console.log(e.clientX, e.clientY);
            this.updateScale();
            
            const {x, y} = this.getTrueMousePosition(e);
            
            this.mousePosition = {"x": x, "y": y};

            this.render();

        }, {"signal": signal});


        this.canvas.addEventListener("mousedown", (e) =>{

            e.preventDefault();

            const doubleClickLimit = 0.3;
            
            const {x, y} = this.getTrueMousePosition(e);
            
            this.mouseClickPosition = {"x": x, "y": y};

            const now = performance.now() * 0.001;
   

            const clickDiff = now - this.lastClickTime;

            this.lastClickTime = now;

            if(this.bMouseOverPlotArea() && !this.bMouseOverAdvancedMenu() && clickDiff <= doubleClickLimit){

                this.toggleFullscreen();
            }

            

            this.render();
            
        }, {"signal": signal});


        
        window.addEventListener("resize", (e) =>{

            this.updateScale();   
            this.render();

        }, {"signal": signal});

        window.addEventListener("fullscreenchange", (e) =>{
            this.bFullscreen = !this.bFullscreen;
            this.updateScale();
        });

    }

    fillText(x, y, text, size, color, align, font, maxWidth){

        const c = this.context;

        if(color !== undefined){
            c.fillStyle = color;
        }

        if(align !== undefined){
            c.textAlign = align;
        }
        if(font === undefined){
            font = "Arial";
        }
        

        x = this.scale("x", x);
        y = this.scale("y", y);

        if(size !== undefined){
            size = this.scale("y", size);
            c.font = `${size}px ${font}`;
        }

        maxWidth = this.scale("x", maxWidth);

        c.fillText(text, x, y, maxWidth);

    }

    fillRect(x, y, width, height, color, bIncludeStroke, strokeWidth, strokeColor){

        if(bIncludeStroke === undefined) bIncludeStroke = false;
        const c = this.context;

        if(color !== undefined){
            c.fillStyle = color;
        }

        x = this.scale("x", x);
        y = this.scale("y", y);
        width = this.scale("x", width);
        height = this.scale("y", height);

        c.fillRect(x, y, width, height);

        if(bIncludeStroke){

            c.lineWidth = this.scale("y", strokeWidth);

            c.strokeStyle = strokeColor;

            c.strokeRect(x, y, width, height);
        }
    }

    drawLine(startX, startY, endX, endY, color, width){

        startX = this.scale("x", startX);
        startY = this.scale("y", startY);
        endX = this.scale("x", endX);
        endY = this.scale("y", endY);

        const c = this.context;
        c.lineWidth = this.scale("x", width);
        c.strokeStyle = color;
        c.beginPath();
        c.moveTo(startX, startY);
        c.lineTo(endX, endY);
        c.stroke();
        c.closePath();
    }

    drawCircle(x, y, radius, color){

        x = this.scale("x", x);
        y = this.scale("y", y);
        radius = this.scale("y", radius);

        const c = this.context;
        c.fillStyle = color;

        c.beginPath();
        c.arc(x, y, radius, 0, Math.PI * 2);
        c.fill();
        c.closePath();
    }

    drawImage(image, x, y, width, height){

        const c = this.context;

        x = this.scale("x", x);
        y = this.scale("y", y);
        width = this.scale("x", width);
        height = this.scale("y", height);

        c.drawImage(image, x, y, width, height);
    }

    debugRenderMouse(){


        const bOverPlot = this.bMouseOverPlotArea();

        const color = (bOverPlot) ? "green" : "red";
        this.fillRect(this.mousePosition.x, this.mousePosition.y, 2, 2, color);


        if(this.mouseClickPosition !== null){
            this.fillRect(this.mouseClickPosition.x, this.mouseClickPosition.y, 2, 2, "black");
        }
    }

    getColor(index){
        return this.defaultDataColors[index % this.defaultDataColors.length];
    }

    plotData(c){

        const bOverPlot = this.bMouseOverPlotArea();

        this.hoverDataIndex = null;
        

        //console.log(distanceBetweenPoints);

        const startX = this.graph.position.x;
        const startY = this.graph.position.y + this.graph.size.height;

        //this value times by 100 will be 100% in the range on the graph
        const bit = this.graph.size.height / this.range;

        const data = this.currentData;//this.data[this.selectedTab];

        for(let i = 0; i < data.length; i++){

            const {values} = data[i];

            const color = (data[i].color !== undefined) ? data[i].color : this.getColor(i);

            if(this.bKeyDisabled(this.selectedTab, i)){
                continue;
            }
            
            let previousDot = null;

            for(let x = 0; x < values.length; x++){

                const v = values[x];

                //normalize the data by getting the difference from the lowest data value
                const trueValue = v - this.min;
                const currentX = startX + (this.distanceBetweenPoints  * (x + 1));
                const currentY = startY - (trueValue * bit);

                if(this.bMouseOverPlotArea()){          

                    if(this.mousePosition.x >= currentX && this.mousePosition.x <= currentX + this.distanceBetweenPoints){
                        this.hoverDataIndex = x;     
                    }
                }

                if(previousDot !== null){
                    this.drawLine(previousDot.x, previousDot.y, currentX, currentY, color, 0.18);
                   // this.fillText(currentX, currentY, x, 2, "white", "center", "Arial", 5);
                }else{
                    previousDot = {"x": currentX - this.distanceBetweenPoints, "y": currentY};
                }

                previousDot = {"x": currentX, "y": currentY};
            }
        }

        //this.fillText(55, 55, `${this.maxDataPoints}/${this.currentData.length}`, 2, "white", "center", "Arial", 5);

        if(bOverPlot){

            const color = "rgba(255,255,255,0.1)";

            this.drawLine(
                this.graph.position.x, 
                this.mousePosition.y,
                this.graph.position.x + this.graph.size.width, 
                this.mousePosition.y,
                color, 
                0.1
            );

            this.drawLine(
                this.mousePosition.x, 
                this.graph.position.y,
                this.mousePosition.x, 
                this.graph.position.y + this.graph.size.height,
                color,
                0.1
            );
        }
    }

    createLinearGradient(startX, startY, endX, endY){

        const c = this.context;

        return c.createLinearGradient(
            this.scale("x", startX),
            this.scale("y", startY),
            this.scale("x", endX),
            this.scale("y", endY)
        );
    }

    renderPlotArea(c){

        this.fillRect(
            this.graph.position.x, 
            this.graph.position.y, 
            this.graph.size.width, 
            this.graph.size.height,
            this.style.plotAreaBackground
        );

        const lineColor = this.style.lineColor;

        this.drawLine(
            this.graph.position.x,
            this.graph.position.y,
            this.graph.position.x,
            this.graph.position.y + this.graph.size.height,
            lineColor,
            0.1
        );

        this.drawLine(
            this.graph.position.x - 1,
            this.graph.position.y + this.graph.size.height,
            this.graph.position.x + this.graph.size.width,
            this.graph.position.y + this.graph.size.height,
            lineColor,
            0.1
        );


        const quater = this.range * 0.25;

        const fontSize = 3.7;
        const fontOffsetY = 3;
        const fontColor = this.style.axisFontColor;

        for(let i = 0; i < 5; i++){

            this.fillText(
                this.graph.position.x - 1, 
                this.graph.position.y - fontOffsetY + (this.graph.size.height * (0.25 * i)), 
                this.max - (quater * i), 
                fontSize, 
                fontColor, 
                "right", 
                "Arial", 
                10
            );
        }

        const lineStartX = this.graph.position.x - 1;
        const lineEndX = lineStartX + this.graph.size.width + 1;

        for(let i = 0; i < 4; i++){

            const sY = this.graph.position.y + (this.graph.size.height * 0.25) * i;
            const eY = sY + (this.graph.size.height * 0.25);
         
            const test = this.createLinearGradient(
                this.graph.position.x,
                sY,
                this.graph.position.x,
                eY
            );
    
            if(this.style.quaterGradient !== null){

                test.addColorStop(0,"rgba(64,64,64,0.5)");
                test.addColorStop(1,"rgba(32,32,32,0.5)");
        
                this.fillRect(
                    this.graph.position.x,
                    sY,
                    this.graph.size.width,
                    this.graph.size.height * 0.25,
                    test
                );
            }
         
            this.drawLine(
                lineStartX, 
                sY,
                lineEndX, 
                sY,
                lineColor,
                0.1
            );

        }

        this.plotData(c);
    }


    toggleKey(keyId){

        if(this.hiddenKeys[this.selectedTab] === undefined){
            this.hiddenKeys[this.selectedTab] = [];
        }

        const currentHiddenKeys = this.hiddenKeys[this.selectedTab];

        const index = currentHiddenKeys.indexOf(keyId);

        if(index === -1){
            currentHiddenKeys.push(keyId);
        }else{
            currentHiddenKeys.splice(index, 1);
        }
    }

    bKeyDisabled(tabId, keyId){

        if(this.hiddenKeys[tabId] === undefined) return false;

        const index = this.hiddenKeys[tabId].indexOf(keyId);

        if(index !== -1) return true;

        return false;
    }

    drawKeys(c){


        const width = 2;
        const height = 3;

        const startX = 1;
        const startY = this.graph.position.y + this.graph.size.height + 2;

        const fontSize = height;
        const keyOffset = 14;
        const textOffset = 0.4;
        const maxTextWidth = 11;

        const maxColumns = 7;
        let column = 0;
        let row = 0;
        const rowHeight = 1.4;

        const data = this.data[this.selectedTab];

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            let color = (d.color !== undefined) ? d.color : this.getColor(i);
            const name = d.name ?? "Not Found";

            const x = startX + (keyOffset * column);
            const y = startY + ((height * rowHeight) * row);

            if(this.bMouseOverArea(x, y, width, height, false)){

                this.setCursor("pointer");
            }

            if(this.bMouseOverArea(x, y, width, height, true)){

                this.toggleKey(i);

                this.bNeedToReRender = true;
            }
            
            if(this.bKeyDisabled(this.selectedTab, i)){
                color = "rgba(255,255,255,0.1)";
            }

            this.fillRect(x, y, width, height, color);
            this.fillText(x + width + textOffset, y, name, fontSize, color, "left", "Arial", maxTextWidth);

            

            column++;
            if(column >= maxColumns){
                row++;
                column = 0;
            }
        }
    }

    renderHoverBox(){

        if(!this.bMouseOverPlotArea() || this.hoverDataIndex === null) return;

        if(this.bMouseOverAdvancedMenu()) return;

        const width = 25;

        const titleFontSize = 3;
        const titleFontColor = "white";
        const fontSize = 2.3;
        const maxNameWidth = 15;
        const fontPadding = 0.5;

        const lines = [];

        const data = this.currentData;//;this.data[this.selectedTab];

        let enabledKeys = 0;

        for(let i = 0; i < data.length; i++){

            if(this.bKeyDisabled(this.selectedTab, i)) continue;

            enabledKeys++;
            const text = data[i].name;
            const value = data[i].values[this.hoverDataIndex] ?? "Not Found";
            const color = (data[i].color !== undefined) ? data[i].color : this.getColor(i);
            
            lines.push([text,value,color]);
        }

        const height = (fontSize + fontPadding) * enabledKeys + (titleFontSize + fontPadding) * 2;

        let { x, y } = this.mousePosition;

        x += 1;

        const maxX = 100;
        const maxY = 100;

        if(x + width > maxX){

            const offset = x + width - maxX;
            x -= offset;
        }

        if(y + height > maxY){
            const offset = y + height - maxY;
            y -= offset;
        }

        let textY = y;

        const labels = this.currentLabels;

        const labelsPrefix = (this.labelsPrefix[this.selectedTab] !== undefined) ? this.labelsPrefix[this.selectedTab] : "";

        const title = `${labelsPrefix}${labels[this.hoverDataIndex]}`;

        this.fillRect(x, textY, width, height ,"rgba(0,0,0,0.85)", true, 0.1, "rgba(255,255,255,0.1)");
        this.fillText( x + width * 0.5, textY + 1, title, titleFontSize, titleFontColor, "center", "Arial", width);

        textY += titleFontSize;

        x += 0.5;

        lines.sort((a, b) =>{
            a = a[1];
            b = b[1];

            if(a < b) return 1;
            if(a > b) return -1;
            return 0;
        });

        for(let i = 0; i < lines.length; i++){

            const [text, value, color] = lines[i];

            textY += fontSize + fontPadding;
            this.fillText(x, textY, text, fontSize, color, "left", "Arial", maxNameWidth);
            this.fillText(x + width - 1, textY, value, fontSize, color, "right", "Arial", maxNameWidth);
        }
    }


    getTotalTabsWithData(){

        let found = 0;

        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];

            for(let x = 0; x < d[i].values.length; x++){

                if(d[i].values.length > 0){
                    found++;
                    break;
                }
            }    
        }
        return found;
    }


    renderTabs(){

        let tabAreaWidth = 80;// if there is less tabs then maxTabsAtOnce set this to 100
        const tabHeight = this.tabHeight;
        const tabs = this.tabs;
        
        const maxTabsAtOnce = 3;

        const totalTabs = (tabs.length >= maxTabsAtOnce) ? maxTabsAtOnce : tabs.length;

        if(this.tabs.length <= totalTabs) tabAreaWidth = 100;

        const startX = (100 - tabAreaWidth) / 2;
        const tabWidth = tabAreaWidth / totalTabs;

        let start = this.tabOffset;
        let end = start + totalTabs;

        const borderSize = 0.2;
        const borderColor = "rgba(255,255,255,0.25)";
    

        if(startX !== 0){

            const buttonWidth =  (100 - tabAreaWidth) * 0.5;
            const fontSize = tabHeight * 1.5;
            const textY = -tabHeight * 0.2;
            const textX = buttonWidth * 0.5;
            const buttonColor = "rgb(64,0,0)";


            this.fillRect(0,0, buttonWidth, tabHeight, buttonColor, true, borderSize, borderColor);
            this.fillText(textX, textY, "-",  fontSize * 0.9, "white", "center", "Arial", buttonWidth);
            this.fillRect(100 - buttonWidth, 0, buttonWidth, tabHeight, buttonColor, true, borderSize, borderColor);
            this.fillText(100 - textX, textY + fontSize * 0.1, "+",  fontSize * 0.9, "white", "center", "Arial", buttonWidth);

            if(this.bMouseOverArea(0,0,buttonWidth, tabHeight, true)){
                if(this.tabOffset > 0) this.tabOffset--;
                this.bNeedToReRender = true;
            }

            if(this.bMouseOverArea(100 - buttonWidth,0,buttonWidth, tabHeight, true)){
                if(this.tabOffset < this.tabs.length - maxTabsAtOnce) this.tabOffset++;
                this.bNeedToReRender = true;
            }
        }
        

        let currentTabIndex = 0;

        for(let i = start; i < end; i++){

            const x = startX + tabWidth * currentTabIndex;
            const y = 0;

            let color = this.style.tabs.background;
            let textColor = this.style.tabs.fontColor;

            if(this.selectedTab === i){
                color = this.style.tabs.activeBackground;
                textColor = this.style.tabs.activeFontColor;
            }

            if(this.selectedTab !== i && this.bMouseOverArea(x, y, tabWidth, tabHeight)){
                color = this.style.tabs.hoverBackground;
                textColor = this.style.tabs.hoverFontColor;
            }

            if(this.bMouseOverArea(x, y, tabWidth, tabHeight, true)){
                this.selectedTab = i;
                this.bNeedToReRender = true;
                this.setMinMax();
            }

            this.fillRect(x, y,  tabWidth, tabHeight, color, true, borderSize, borderColor);
            this.fillText(x + tabWidth * 0.5, y + tabHeight * 0.175, tabs[i].name, tabHeight * 0.75, textColor, "center", "Arial", tabWidth * 0.8);

            currentTabIndex++;
        }
    }

    getAdvancedMenuHeight(){

        const titleFontSize = this.advancedMenu.titleFontSize;
        const rowHeight = this.advancedMenu.rowHeight;

        let total = titleFontSize + this.advancedMenu.titleOffsetY * 2;

        for(let i = 0; i < this.dataPointOptions.length; i++){

            const {value} = this.dataPointOptions[i];

            if(value > this.totalDataPoints) break;

            total += rowHeight;
        }
            
        total += rowHeight;
        return total;
    }

    renderAdvanced(){

        if(!this.bEnableAdvanced) return;

        if(!this.bMouseOverAdvancedMenu()) this.bShowAdvanced = false;

        const startX = this.advancedMenu.startX;
        const width = this.advancedMenu.width;
        
        const startY = this.advancedMenu.startY;
        const titleOffsetY = this.advancedMenu.titleOffsetY;
        const titleFontSize = this.advancedMenu.titleFontSize;
        const height = (this.bShowAdvanced) ? this.getAdvancedMenuHeight() : this.advancedMenu.height.button;

        const textOffsetX = this.advancedMenu.textOffsetX;
        const maxTextWidth = width - textOffsetX * 2;

        if(this.bMouseOverArea(startX, startY, width, titleFontSize * 2, true)){
            this.bNeedToReRender = true;
            this.bShowAdvanced = !this.bShowAdvanced;
        }

        if(this.bShowAdvanced){
            this.fillRect(startX, startY, width, height,"rgba(0,0,0,0.85)", true, 0.1, "rgba(255,255,255,0.1)");
        }else{

            if(this.bMouseOverArea(startX, startY, width, height, false)){
                this.fillRect(startX, startY, width, height,"rgba(0,0,0,0.85)", true, 0.1, "rgba(255,255,255,0.1)");
            }
        }

        this.fillText(startX + width * 0.5, startY + titleOffsetY, "Advanced Options", titleFontSize, "white", "center", "Arial", maxTextWidth);

        if(!this.bShowAdvanced) return;
    
        const fontSize = this.advancedMenu.fontSize;
        const rowHeight = this.advancedMenu.rowHeight;
        let currentRow = 0;
     
        let bHighlighted = false;

        let y = 0;

        //skip last one as its, show all
        for(let i = 0; i < this.dataPointOptions.length - 1; i++){

            const {name, value} = this.dataPointOptions[i];
            
            y = titleFontSize + (titleOffsetY * 2) + startY + rowHeight * currentRow;

            let color = "red";

            if(this.bMouseOverArea(startX, y, width, rowHeight, false)){
                color = "green";
            }


            if(this.bMouseOverArea(startX, y, width, rowHeight, true)){

                if(value > this.totalDataPoints){
                    this.maxDataPoints = 0;
                }else{
                    this.maxDataPoints = value;
                }

                this.setMinMax();

                this.bNeedToReRender = true;
            }

            if(this.maxDataPoints === value){
                color = "white";
                bHighlighted = true;
            }

            
            if(value > this.totalDataPoints) break;
            this.fillText(startX + textOffsetX, y, `Show ${name} Data Points`, fontSize, color, "left", "Arial", maxTextWidth);
            currentRow++;
            
            
        }

        let color = "red";
        y = titleFontSize + (titleOffsetY * 2) + startY + rowHeight * currentRow;
      
        if(!bHighlighted){
            
            color = "white";

            if(this.bMouseOverArea(startX, y, width, rowHeight, false)){
                color = "green";
            }
        }

        if(this.bMouseOverArea(startX, y, width, rowHeight, true)){

            this.maxDataPoints = 0;
            this.setMinMax();
            

            this.bNeedToReRender = true;
        }
        
        this.fillText(startX + textOffsetX, y, `Show All Data Points`, fontSize, color, "left", "Arial", maxTextWidth);
    
    }

    setCursor(type){
        this.canvas.style = `cursor:${type}`;
    }

    render(){

        this.bNeedToReRender = false;
        this.cursorStyle = null;

        const c = this.context;

        c.clearRect(0,0, this.scale("x", 100), this.scale("y", 100));

        this.fillRect(0,0,100,100, this.style.backgroundColor);

        this.fillText(50, 8, this.tabs[this.selectedTab].title, 5, this.style.titleColor, "center", "Arial", 62);

        this.renderPlotArea(c);
        this.drawKeys(c);
        this.renderHoverBox();
        this.renderTabs();
        //this.debugRenderMouse();      

        this.renderAdvanced();

        this.mouseClickPosition = null;

        if(this.bMouseOverAdvancedMenu() || this.bMouseOverTabsArea()){
            this.setCursor("pointer");
        }


        if(this.bNeedToReRender){
            this.render();
        }
    }
}

export default Graph;