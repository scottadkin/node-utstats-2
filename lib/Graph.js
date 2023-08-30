
class Graph{

    constructor(canvas, abortController, width, height, tabs, data, style){
       
        this.canvas = canvas;
        this.canvas.width = width;
        this.canvas.height = height;
        this.context = canvas.getContext("2d");
        this.context.textBaseline = "top";
        this.abortController = abortController;
        this.lastClickTime = -999;

        this.style = style;

        this.hoverDataIndex = null;

        this.canvasScale = {"x": 1, "y": 1};

        this.tabHeight = 6;

        this.subCanvases = [];
        this.tabs = tabs;

        this.data = data.data;
        this.labels = data.labels;
        this.labelsPrefix = data.labelsPrefix;

        this.graph = {
            "position": {"x": 10, "y": 15},
            "size": {"width": 89, "height": 70}
        };

        this.tabOffset = 0;
        this.selectedTab = 0;
 
        this.defaultColor = "red";
        this.mousePosition = {"x": -999, "y": -999};
        this.mouseClickPosition = null;

        this.bFullscreen = false;

        this.bNeedToReRender = false;

        this.hiddenKeys = [];
        

        this.setMinMax();

        this.createEvents();
        this.setStyle();
        this.render();
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

        if(this.style === undefined){
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

    setMinMax(){

        this.min = null;
        this.max = null;

        this.maxDataPoints = 0;

        const data = this.data[this.selectedTab];

        for(let i = 0; i < data.length; i++){

            const {values} = data[i];

            if(values.length > this.maxDataPoints){
                this.maxDataPoints = values.length;
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

            console.log(this.min, this.max);
        }

        if(this.min == null || this.max == null) return;

        this.min = Math.floor(this.min);
        if(this.min > 0) this.min = 0;
        this.max = Math.ceil(this.max);

        this.range = this.max - this.min;
       //return;
        const quater = this.range * 0.25;

        const rem = quater % 1;
        console.log(this.range);
        if(rem !== 0){

            console.log("CHECK");
            this.range = (quater + (1 - rem)) * 4;
            this.max = Math.ceil(this.min + this.range);
            this.range = this.max - this.min;
        }
        


        console.log(`range = ${this.range}`);


        this.totalDataPoints = this.maxDataPoints;

        this.distanceBetweenPoints = this.graph.size.width / (this.totalDataPoints + 1);

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

            if(!this.bMouseOverArea(0,0,100,this.tabHeight) && !this.bMouseOverKeysArea() && clickDiff <= doubleClickLimit){

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

    plotData(c){

        const bOverPlot = this.bMouseOverPlotArea();

        this.hoverDataIndex = null;
        

        //console.log(distanceBetweenPoints);

        const startX = this.graph.position.x;
        const startY = this.graph.position.y + this.graph.size.height;

        //this value times by 100 will be 100% in the range on the graph
        const bit = this.graph.size.height / this.range;

        const data = this.data[this.selectedTab];

        for(let i = 0; i < data.length; i++){

            const {values} = data[i];
            let {color} = data[i];
            if(color === undefined) color = this.defaultColor;

            if(this.hiddenKeys.indexOf(i) !== -1){
                continue;
            }
            

            let previousDot = null;

            for(let x = 0; x < values.length; x++){

                

                const v = values[x];

                //normalize the data by getting the difference from the lowest data value
                const trueValue = v - this.min;
                //console.log(v, trueValue, trueValue * bit);


                const currentX = startX + (this.distanceBetweenPoints  * (x + 1));
                const currentY = startY - (trueValue * bit);

                if(this.bMouseOverPlotArea()){          

                    if(this.mousePosition.x >= currentX && this.mousePosition.x <= currentX + this.distanceBetweenPoints){
                        this.hoverDataIndex = x;
                        
                    }
                }

 
                //this.drawCircle(currentX, currentY, 0.5, color);
                if(previousDot !== null){
                    this.drawLine(previousDot.x, previousDot.y, currentX, currentY, color, 0.18);
                }else{
                    previousDot = {"x": currentX - this.distanceBetweenPoints, "y": currentY};
                }


                

                //this.fillText(currentX, currentY, `${v}`, 2, "white", "right", "Arial", 5);


                previousDot = {"x": currentX, "y": currentY};
            }
        }

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

            let color = d.color ?? this.defaultColor;
            const name = d.name ?? "Not Found";

            const x = startX + (keyOffset * column);
            const y = startY + ((height * rowHeight) * row);

            if(this.bMouseOverArea(x, y, width, height, true)){

                const keyIndex = this.hiddenKeys.indexOf(i);

                if(keyIndex === -1){
                    this.hiddenKeys.push(i);
                }else{
                    this.hiddenKeys.splice(keyIndex, 1);
                }

                this.bNeedToReRender = true;
            }

            if(this.hiddenKeys.indexOf(i) !== -1){
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

        const width = 25;

        const titleFontSize = 3;
        const titleFontColor = "white";
        const fontSize = 2.3;
        const maxNameWidth = 15;
        const fontPadding = 0.5;

        const lines = [];

        const data = this.data[this.selectedTab];

        let enabledKeys = 0;

        for(let i = 0; i < data.length; i++){

            if(this.hiddenKeys.indexOf(i) !== -1) continue;

            enabledKeys++;
            const text = data[i].name;
            const value = data[i].values[this.hoverDataIndex] ?? "Not Found";
            const color = data[i].color ?? this.defaultColor;
            
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

        const labelsPrefix = (this.labelsPrefix[this.selectedTab] !== undefined) ? this.labelsPrefix[this.selectedTab] : "";

        const title = `${labelsPrefix}${this.labels[this.selectedTab][this.hoverDataIndex]}`;;

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

    renderTabs(){

        let tabAreaWidth = 80;// if there is less tabs then maxTabsAtOnce set this to 100
        const tabHeight = this.tabHeight;
        const tabs = this.tabs;
        
        const maxTabsAtOnce = 4;

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

    render(){

        this.bNeedToReRender = false;

        const c = this.context;

        c.clearRect(0,0, this.scale("x", 100), this.scale("y", 100));

        this.fillRect(0,0,100,100, this.style.backgroundColor);

        this.fillText(50, 8, this.tabs[this.selectedTab].title, 5, this.style.titleColor, "center", "Arial", 90);

        this.renderPlotArea(c);
        this.drawKeys(c);
        this.renderHoverBox();
        this.renderTabs();
        this.debugRenderMouse();      

        this.mouseClickPosition = null;

        if(this.bNeedToReRender){
            this.render();
        }
    }
}
export default Graph;