import { useRef, useEffect, useReducer } from "react";
import styles from "./MapInteractiveMap.module.css";
import ErrorMessage from "../ErrorMessage";
import Loading from "../Loading";

const reducer = (state, action) =>{

    switch(action.type){

        case "error": {
            return {
                ...state,
                "bLoading": false,
                "error": action.errorMessage
            }
        }
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "data": action.data,
            }
        }
    }

    return state;
}


class MapButton{

    constructor(text, x, y, width, height, backgroundColor, fontColor, fontSize, action){

        this.text = text;
        this.width = width;
        this.height = height;

        this.x = x; 
        this.y = y;


        this.backgroundColor = backgroundColor;
        this.fontColor = fontColor;
        this.fontSize = fontSize;

        this.action = action;
    }

    bTouching(targetX, targetY){

        if(targetX >= this.x && targetX <= this.x + this.width){

            if(targetY >= this.y && targetY <= this.y + this.height){
                return true;
            }
        }

        return false;
    }

}

class InteractiveMap{

    constructor(canvasRef){

        this.zoom = 2;
        this.offset = {"x": 0/*50*/, "y": 0/*50*/, "z": 0};

        console.log(`new Interactive Map`);
        this.canvasRef = canvasRef;
        this.min = {"x": null, "y": null, "z": null};
        this.max = {"x": null, "y": null, "z": null};
        this.bit = {"x": null, "y": null, "z": null};
        this.range = {"x": 0, "y": 0, "z": 0};

        this.interfaceHeight = 10;

        this.mouse = {"x": -999, "y": -999, "bMouseDown": false};
        //includes scaling with zoom
        this.click = {"x": null, "y": null};
        this.hover = {"x": -9999, "y": -9999};

        this.buttons = [];


        this.zoomButtonSize = {"width":10, "height": this.interfaceHeight * 0.5};
        

        this.mouseOver = {
            "bDisplay": false,
            "text": null,
            "width": 0,
            "height": 0,
            "x": 0,
            "y": 0
        };
        
        this.main();
    }

    createButtons(){

        this.buttons = [];


        this.buttons.push(new MapButton("Zoom In", 0, 0, 10, 5, "pink", "green", 0.7, () =>{
            this.adjustZoom(-1);
        }));

        this.buttons.push(new MapButton("Zoom Out", 0, 5, 10, 5, "pink", "green", 0.7, () =>{
            this.adjustZoom(1);
        }));

        this.buttons.push(new MapButton("Fullscreen", 85, 0, 15, 5, "pink", "green", 0.7, () =>{

            //console.log(document.fullscreenElement);
            this.canvasRef.current.requestFullscreen().then(() =>{
           
                this.canvasRef.current.width = window.innerWidth;
                this.canvasRef.current.height = window.innerHeight;
                this.render();
            });
            
        }));

        this.buttons.push(new MapButton("Normal View", 85, 5, 15, 5, "pink", "green", 0.7, () =>{

            //console.log(document.fullscreenElement);
            document.exitFullscreen().then(() =>{
           
                this.canvasRef.current.width = window.innerWidth;
                this.canvasRef.current.height = window.innerHeight;
                this.render();
            }).catch(() =>{

            });
            
        }));
    }

    adjustZoom(value){

        if(value > 0) this.zoom += 0.05;
        if(value < 0) this.zoom -= 0.05;


        if(this.zoom < 0.05) this.zoom = 0.05;
        this.render();
    }

    setMinMax(){


        for(let i = 0; i < this.data.length; i++){

            const {x, y, z} = this.data[i];

            if(i === 0){

                this.min.x = x;
                this.min.y = y;
                this.min.z = z;

                this.max.x = x;
                this.max.y = y;
                this.max.z = z;

                continue;
            }

            if(x < this.min.x) this.min.x = x;
            if(x > this.max.x) this.max.x = x;

            if(y < this.min.y) this.min.y = y;
            if(y > this.max.y) this.max.y = y;

            if(z < this.min.z) this.min.z = z;
            if(z > this.max.z) this.max.z = z;
        }

        //console.log(this.min, this.max);

        this.range.x = Math.abs(this.max.x - this.min.x);
        this.range.y = Math.abs(this.max.y - this.min.y);
        this.range.z = Math.abs(this.max.z - this.min.z);

        this.bit.x = (this.range.x !== 0) ? 100 / this.range.x : 0;
        this.bit.y = (this.range.y !== 0) ? 100 / this.range.y : 0;
        this.bit.z = (this.range.z !== 0) ? 100 / this.range.z : 0;

        //console.log(this.bit);
    }


    createDisplayData(){


        for(let i = 0; i < this.data.length; i++){

            const d = this.data[i];
            const current = {
                "x": this.pixelsToPercent(this.removeOffset(d.x, "x"), "x"),
                "y": this.pixelsToPercent(this.removeOffset(d.y, "y"), "y"),
                "type": d.type,
                "name": d.name,
                "className": d.className,
                "realLocation": {
                    "x": d.x,
                    "y": d.y,
                    "z": d.z
                }
                //"z": this.removeOffset(d.y),
            };

            if(d.type === "flag" || d.type === "spawn") current.team = d.team;

            if(d.type === "flag"){
                current.name = "CTF Flag";
                current.className = "Botpack.CTFFlag";
            }

            if(d.type === "spawn"){
                current.className = "Engine.PlayerStart";
            }



            this.displayData.push(current);
        }
    }

    async loadImage(url, image){

        return new Promise((resolve, reject) =>{

            //const image = new Image();
            image.src = url;

            image.onload = () =>{
                console.log(`loaded ${url}`);
                resolve();
            }
        });
    }

    async loadImages(){

        this.playerStartImage = new Image();
        this.redFlag = new Image();
        this.blueFlag = new Image();
        this.greenFlag = new Image();
        this.yellowFlag = new Image();
        this.ammoIcon = new Image();
        this.gunIcon = new Image();
        this.pickupIcon = new Image();

        await this.loadImage("/images/playerstart.png", this.playerStartImage);
        await this.loadImage("/images/redflag.png", this.redFlag);
        await this.loadImage("/images/blueflag.png", this.blueFlag);
        await this.loadImage("/images/greenflag.png", this.greenFlag);
        await this.loadImage("/images/yellowflag.png", this.yellowFlag);
        await this.loadImage("/images/bullet.png", this.ammoIcon);
        await this.loadImage("/images/gun.png", this.gunIcon);
        await this.loadImage("/images/health.png", this.pickupIcon);

    }

    async setData(data){


        this.data = data;

        this.displayData = [];

        this.setMinMax();

        this.createDisplayData();


        await this.loadImages();

        this.createButtons();
 
        this.render();
        
    }


    main(){

        console.log(`main()`);

        /*this.loop = setInterval(() =>{
            this.render();
        }, 1000 / 3);*/
    }

    removeOffset(value, type){

        type = type.toLowerCase();

        const valid = ["x","y","z"];

        if(valid.indexOf(type) === -1){

            throw new Error("Unknown type");
        }

        const offset = 0 - this.min[type];
        return value + offset;
    }

    pixelsToPercent(value, type){

        type = type.toLowerCase();

        if(type !== "x" && type !== "y") return -999;

        return value * this.bit[type];
    }

    percentToPixels(value, type, bIgnoreZoom){

        if(bIgnoreZoom === undefined) bIgnoreZoom = false;

        type = type.toLowerCase();

        if(type !== "x" && type !== "y") return -1;
 
        const size = (type === "x") ? this.canvasRef.current.width : this.canvasRef.current.height;

        if(size === 0) return 0;

        const bit = size / ((bIgnoreZoom) ? 100 : this.zoom * 100);

        return bit * value;
    }

    setMouseOverInfo(textLines, x, y){

        this.mouseOver.bDisplay = true;
        this.mouseOver.x = x;
        this.mouseOver.y = y;
        this.mouseOver.textLines = textLines;
    }

    renderItem(c, data, image, width, height){

        c.fillStyle = "orange";

        const imageWidth = this.percentToPixels(width, "x", true);
        //use x instead of y to keep the image square
        const imageHeight = this.percentToPixels(height, "y", true);
        

        const d = data;

        const x = this.percentToPixels(d.x + this.offset.x, "x") - (imageWidth * 0.5);
        const y = this.percentToPixels(d.y + this.offset.y, "y") - (imageHeight * 0.5);

        c.drawImage(image, x, y, imageWidth, imageHeight);

        //console.log(correctX);

        const startX = d.x - ((width * this.zoom) * 0.5);
        const endX = d.x + ((width * this.zoom)  * 0.5);

        const startY = d.y - ((height * this.zoom) * 0.5);
        const endY = d.y + ((height * this.zoom) * 0.5);

        const fontSize = this.percentToPixels(2, "y", true);

        c.font = `${fontSize}px Arial`;
        c.fillStyle = "orange";
       //c.fillText(`${d.name} ${startY.toFixed(2)} ${endY.toFixed(2)}, location = ${d.x.toFixed(2)},${d.y.toFixed(2)}`, x, y);

        if(this.hover.x >= startX && this.hover.x <= endX){
            
            if(this.hover.y >= startY && this.hover.y <= endY){
      
                
                const string1 = `Class: ${d.className}`;
                const string2 = `Name: ${d.name}`;
                const string3 = `X = ${d.realLocation.x}, Y = ${d.realLocation.y}, Z = ${d.realLocation.z}`;
                /*
                const textWidth = c.measureText(string1).width;
                console.log(textWidth);
                
                c.fillStyle = "red";
                c.fillRect(x, y, this.percentToPixels(width, "x", true), this.percentToPixels(height, "x", "true"));


                c.fillStyle = "rgba(0,0,0,0.75)";
                c.fillRect(x, y, textWidth, fontSize * 2.5);

                c.fillStyle = "orange";
                c.fillText(string1, x, y);
                c.fillText(string2, x, y + fontSize);*/

                this.setMouseOverInfo([string1, string2, string3], x, y);
            }
        }

        

        //console.log(this.hover);
        //c.fillRect(x, y, 5, 5);
        //c.fillText(`${d.x.toFixed(1)},${d.y.toFixed(1)}`,x, y);
    }

    renderButtons(c){

        c.textAlign = "center";

        for(let i = 0; i < this.buttons.length; i++){

            const b = this.buttons[i];
            const fontSize = this.percentToPixels(2, "x", true);

            c.font = `${fontSize}px Arial`;
            c.fillStyle = b.backgroundColor;

            const width = this.percentToPixels(b.width, "x", true);
            const height = this.percentToPixels(b.height, "y", true);
            const x = this.percentToPixels(b.x, "x", true);
            const y = this.percentToPixels(b.y, "y", true);

            c.fillRect(x,y, width, height);

            c.fillStyle = b.fontColor;
            c.fillText(b.text, x + width * 0.5, y + fontSize);
            
        }

        c.textAlign = "left";
    }

    renderInterface(c){

        c.textBasline = "top";
        c.textAlign = "center";

        c.fillStyle = "rgba(255,0,0,0.8)";

        c.fillRect(0,0, this.percentToPixels(100, "x", true), this.percentToPixels(this.interfaceHeight, "y", true));

        c.fillStyle = "white";

        c.font = `${this.percentToPixels(3.3, "y", true)}px Arial`;

        c.fillText(`${(this.zoom * 100)}%`, 420, 20);


        c.fillText(`${this.hover.x.toFixed(2)}, ${this.hover.y.toFixed(2)}`, 100, 100);

        this.renderButtons(c);

        
    }

    updateMouseLocation(mouseX, mouseY, movementX, movementY){

        const bounds = this.canvasRef.current.getBoundingClientRect();

        const widthScale = bounds.width / this.canvasRef.current.width;
        const heightScale = bounds.height / this.canvasRef.current.height;
        
        const bitX = 100 / (this.canvasRef.current.width * widthScale);
        const bitY = 100 / (this.canvasRef.current.height * heightScale);

        this.mouse.x = mouseX * bitX;
        this.mouse.y = mouseY * bitY;

        if(this.mouse.bMouseDown){

            const mX = this.pixelsToPercent(movementX , "x");
            const mY = this.pixelsToPercent(movementY , "y");

            this.offset.x += mX * 10;
            this.offset.y += mY * 10;
        }


        //mouse location used for mouse over items
        const correctX = (this.mouse.x  * this.zoom) - this.offset.x;
        const correctY = (this.mouse.y  * this.zoom) - this.offset.y;

        this.hover = {"x": correctX, "y": correctY};
    }

    userClicked(){

        console.log(`click`);
    

        const x = this.mouse.x;
        const y = this.mouse.y;

        //clicked interface
        if(y <= this.interfaceHeight){

            for(let i = 0; i < this.buttons.length; i++){

                const b = this.buttons[i];

                if(b.bTouching(x, y)){
                    console.log("ok");
                    b.action();
                }

            }
        
            //there are no drag events for UI
            this.mouse.bMouseDown = false;

        }else{

            const fixedX = x * (this.zoom * 100);
            const fixedY = y * (this.zoom * 100);

            this.click = {"x": fixedX, "y": fixedY};
            this.mouse.bMouseDown = true;
        }


        
        this.render();

    }

    mouseRelease(){

        console.log(`ll`);

        this.mouse.bMouseDown = false;
    }

    renderFlag(c, item, iconWidth, iconHeight){
        console.log(item);

        const {team} = item;

        if(team === 0) this.renderItem(c, item, this.redFlag, iconWidth, iconHeight);
        if(team === 1) this.renderItem(c, item, this.blueFlag, iconWidth, iconHeight);
        if(team === 2) this.renderItem(c, item, this.greenFlag, iconWidth, iconHeight);
        if(team === 3) this.renderItem(c, item, this.yellowFlag, iconWidth, iconHeight);

    }

    renderData(c){

        const iconWidth = 2.5;
        const iconHeight = 3.3;


        this.mouseOver.bDisplay = false;

        for(let i = 0; i < this.displayData.length; i++){

            const d = this.displayData[i];

            if(d.type === "spawn") this.renderItem(c, d, this.playerStartImage, iconWidth, iconHeight)//this.renderSpawn(c, d);
            if(d.type === "flag") this.renderFlag(c, d, iconWidth, iconHeight);
            if(d.type === "ammo") this.renderItem(c, d, this.ammoIcon, iconWidth, iconHeight);
            if(d.type === "weapon") this.renderItem(c, d, this.gunIcon, iconWidth, iconHeight);
            if(d.type === "pickup") this.renderItem(c, d, this.pickupIcon, iconWidth, iconHeight);

  
        }
    }

    renderGrid(c){

        c.fillStyle = "rgba(50,50,255,0.25)";

        let bFinished = false;

        let i = 0;

        while(!bFinished){

            const y = this.percentToPixels(10 * i, "y");
            const x = this.percentToPixels(10 * i, "x");

            c.fillRect(0, y, this.percentToPixels(100, "x", true), 1);
            c.fillRect(x, 0, 1, this.percentToPixels(100, "y", true));

            if(this.pixelsToPercent(y, "y") >= 100) bFinished = true;
            i++;
        }

    }

    resize(){

        if(document.fullscreenElement !== this.canvasRef.current){

            this.canvasRef.current.width = 960;
            this.canvasRef.current.height = 540;
            this.render();
        }
    }

    renderMouseOver(c){

        if(!this.mouseOver.bDisplay) return;

        c.fillStyle = "rgba(0,0,0,0.75)";

        const fontSize = this.percentToPixels(2.4 ,"y", true);

        c.font = `${fontSize}px Arial`;

        let maxWidth = 0;
        let mainHeight = 0;

        let {x, y, textLines} = this.mouseOver

        for(let i = 0; i < textLines.length; i++){

            const line = textLines[i];

            const currentWidth = c.measureText(`_${line}_`).width;

            if(currentWidth > maxWidth) maxWidth = currentWidth;

            mainHeight += fontSize * 1.5;

        }

        x = x + this.percentToPixels(2, "x", true);
        y = y - this.percentToPixels(1, "y", true);
        

        c.fillRect(x, y, maxWidth, mainHeight);
        c.fillStyle = "white";

        let offsetY = fontSize;
        let offsetX = 5;

        for(let i = 0; i < textLines.length; i++){

            const t = textLines[i];

            c.fillText(t, x + offsetX, y + offsetY);

            offsetY += fontSize * 1.3;
        }
    }

    render(){



        if(this.canvasRef.current === null) return;

        const c = this.canvasRef.current.getContext("2d");
        c.textBasline = "top";

        c.fillStyle = "rgb(12,12,32)";
        c.fillRect(0,0, this.percentToPixels(100, "x", true), this.percentToPixels(100, "y", true));

        this.renderGrid(c);

        this.renderData(c);

        this.renderInterface(c);

        this.renderMouseOver(c);

        c.fillStyle = "white";

        c.fillRect(this.percentToPixels(this.mouse.x, "x", true), this.percentToPixels(this.mouse.y, "y", true), 5, 5);
    }
}

const loadData = async (controller, id, dispatch) =>{

    try{

        const req = await fetch(`/api/map/?mode=interactive-data&id=${id}`);

        const res = await req.json();

        console.log(res);

        if(res.error !== undefined){
            dispatch({"type": "error", "errorMessage": res.error.toString()})
            return;
        }

        dispatch({"type": "loaded", "data": res.data});
 

    }catch(err){
        if(err.name === "AbortError") return;
        console.trace(err);
    }
}

const MapInteractiveMap = ({id}) =>{

    const canvasRef = useRef(null);

    const [state, dispatch] = useReducer(reducer, {
        "error": null,
        "data": null,
        "bLoading": true
    });

    

    useEffect(() =>{

        const controller = new AbortController();

        loadData(controller, id, dispatch);

        return () =>{
            controller.abort();
        }

    }, [id]);

 
    useEffect(() =>{

        if(state.data !== null){

            const testMap = new InteractiveMap(canvasRef);

            const fart = (e) =>{
                //console.log(e.clientX, e.clientY);


                const bounds = canvasRef.current.getBoundingClientRect();
                testMap.updateMouseLocation(e.clientX - bounds.x, e.clientY - bounds.y, e.movementX, e.movementY);
                testMap.render();
            }

            const userClicked = (e) =>{

                testMap.userClicked();
            }

            const mouseRelease = () =>{
                testMap.mouseRelease();
            }

            const mouseWheel = (e) =>{

                e.preventDefault();

                testMap.adjustZoom(e.deltaY);
            }

            const resizeMap = (e) =>{
    
                testMap.resize();
            }   

            testMap.setData(state.data);
            canvasRef.current.addEventListener("mousemove", fart);
            canvasRef.current.addEventListener("mousedown", userClicked);

            canvasRef.current.addEventListener("mouseup", mouseRelease);
            canvasRef.current.addEventListener("mouseleave", mouseRelease);

            canvasRef.current.addEventListener("wheel", mouseWheel);

            canvasRef.current.addEventListener("fullscreenchange", resizeMap);
            
            const canvasElem = canvasRef.current;

            return () =>{
                canvasElem.removeEventListener("mousedown", userClicked);
                canvasElem.removeEventListener("click", userClicked);
                canvasElem.removeEventListener("mouseup", mouseRelease);
                canvasElem.removeEventListener("mouseLeave", mouseRelease);
                canvasElem.removeEventListener("wheel", mouseWheel);
                canvasElem.removeEventListener("mousemove", fart);
                canvasElem.removeEventListener("fullscreenchange", resizeMap);
            }
            
        }

    }, [state.data]);

    if(state.bLoading){
        return <Loading />;
    }

    if(state.error !== null){

        return <ErrorMessage title="Interactive Map" text={state.error}/>;
    }
    return <div className={styles.wrapper}>
        <div className="default-header">Interactive Map</div>
        <canvas ref={canvasRef} width={960} height={540}></canvas>
    </div>
}


export default MapInteractiveMap;