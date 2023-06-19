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

    constructor(text, x, y, width, height, backgroundColor, fontColor, fontSize){

        this.text = text;
        this.width = width;
        this.height = height;

        this.x = x; 
        this.y = y;


        this.backgroundColor = backgroundColor;
        this.fontColor = fontColor;
        this.fontSize = fontSize;
    }
}

class InteractiveMap{

    constructor(canvasRef){

        this.zoom = 200;
        this.offset = {"x": 50, "y": 50, "z": 0};

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


        this.buttons = [];


        this.zoomButtonSize = {"width":10, "height": this.interfaceHeight * 0.5};
        
        this.createButtons();
        this.main();
    }

    createButtons(){

        this.buttons.push(new MapButton("Zoom In", 0, 0, 10, 5, "pink", "green", 0.7));
        this.buttons.push(new MapButton("Zoom Out", 0, 5, 10, 5, "pink", "green", 0.7));

        this.buttons.push(new MapButton("Fullscreen", 90, 0, 10, 5, "pink", "green", 0.7));
    }

    adjustZoom(value){

        if(value > 0) this.zoom += 5;
        if(value < 0) this.zoom -= 5;


        if(this.zoom < 5) this.zoom = 5;
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
                "type": d.type
                //"z": this.removeOffset(d.y),
            };

            if(d.type === "flag" || d.type === "spawn") current.team = d.team;



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

        const bit = size / ((bIgnoreZoom) ? 100 : this.zoom);

        return bit * value;
    }

    renderItem(c, data, image, width, height){

        c.fillStyle = "orange";

        const imageWidth = this.percentToPixels(width, "x");
        //use x instead of y to keep the image square
        const imageHeight = this.percentToPixels(height, "x");
        c.font = "12px Arial";

        const d = data;

        const x = this.percentToPixels(d.x + this.offset.x, "x") - (imageWidth * 0.5);
        const y = this.percentToPixels(d.y + this.offset.y, "y") - (imageHeight * 0.5);

        c.drawImage(image, x, y, imageWidth, imageHeight);
        //c.fillRect(x, y, 5, 5);
        //c.fillText(`${d.x.toFixed(1)},${d.y.toFixed(1)}`,x, y);
    }

    renderFlag(c, data){


        let image = this.redFlag;


        const imageWidth = this.percentToPixels(2, "x");
        //use x instead of y to keep the image square
        const imageHeight = this.percentToPixels(2, "x");

        const d = data;

        if(d.team === 1) image = this.blueFlag;
        if(d.team === 2) image = this.greenFlag;
        if(d.team === 3) image = this.yellowFlag;

        const x = this.percentToPixels(d.x + this.offset.x, "x") - (imageWidth * 0.5);
        const y = this.percentToPixels(d.y + this.offset.y, "y") - (imageHeight * 0.5);

        c.drawImage(image, x, y, imageWidth, imageHeight);
    }

    renderButtons(c){

        for(let i = 0; i < this.buttons.length; i++){

            const b = this.buttons[i];
            console.log(i);

            const fontSize = this.percentToPixels(b.height * b.fontSize, "y", true);

            c.font = `${fontSize}px Arial`;
            c.fillStyle = b.backgroundColor;

            const width = this.percentToPixels(b.width, "x", true);
            const height = this.percentToPixels(b.height, "y", true);
            const x = this.percentToPixels(b.x, "x", true);
            const y = this.percentToPixels(b.y, "y", true);

            console.log(x,y, width, height, fontSize);
            c.fillRect(x,y, width, height);

            c.fillStyle = b.fontColor;
            c.fillText(b.text, x + width * 0.5, y + fontSize);
        
        
            
        }
    }

    renderInterface(c){

        c.textBasline = "top";
        c.textAlign = "center";

        c.fillStyle = "rgba(255,0,0,0.8)";

        c.fillRect(0,0, this.percentToPixels(100, "x", true), this.percentToPixels(this.interfaceHeight, "y", true));

        c.fillStyle = "white";

        c.font = `${this.percentToPixels(3.3, "y", true)}px Arial`;

        c.fillText(`${this.zoom}%`, 20, 20);

        c.fillStyle = "pink";

        this.renderButtons(c);

        /*const zoomButton = this.zoomButtonSize;

        const zoomWidth = this.percentToPixels(zoomButton.width, "x", true);
        const zoomStartX = this.percentToPixels(zoomButton.width * 0.5, "x", true);

        c.fillRect(0,0,  zoomWidth,  this.percentToPixels(zoomButton.height, "y", true));
        c.fillStyle = "white";
        c.fillText("Zoom Out", zoomStartX, this.percentToPixels(3, "y", true));
        c.fillStyle = "pink";
        c.fillRect(0,this.percentToPixels(zoomButton.height, "y", true),  zoomWidth,  this.percentToPixels(zoomButton.height, "y", true));
        
        c.fillStyle = "white";
        c.fillText("Zoom In", zoomStartX, this.percentToPixels(3, "y", true) * 2.75);*/

        c.textAlign = "left";
    }

    updateMouseLocation(mouseX, mouseY, movementX, movementY){

        const bitX = 100 / this.canvasRef.current.width;
        const bitY = 100 / this.canvasRef.current.height;

        this.mouse.x = mouseX * bitX;
        this.mouse.y = mouseY * bitY;

        if(this.mouse.bMouseDown){

            const mX = this.pixelsToPercent(movementX * (this.zoom * 0.1), "x");
            const mY = this.pixelsToPercent(movementY * (this.zoom * 0.1), "y");

            this.offset.x += mX;
            this.offset.y += mY;
        }
    }

    userClicked(){

        console.log(`click`);
    

        const x = this.mouse.x;
        const y = this.mouse.y;

        //clicked interface
        if(y <= this.interfaceHeight){

            const zoomScale = 15;

            if(x <= this.zoomButtonSize.width && y < this.zoomButtonSize.height) this.zoom += zoomScale;
            if(x <= this.zoomButtonSize.width && y >= this.zoomButtonSize.height) this.zoom -= zoomScale;
            if(this.zoom <= 0) this.zoom = 5;

            console.log(this.mouse);
            //there are no drag events for UI
            this.mouse.bMouseDown = false;

        }else{

            const fixedX = x * (this.zoom / 100);
            const fixedY = y * (this.zoom / 100);

            this.click = {"x": fixedX, "y": fixedY};
            this.mouse.bMouseDown = true;
        }


        
        this.render();

    }

    mouseRelease(){

        console.log(`ll`);

        this.mouse.bMouseDown = false;
    }

    renderData(c){

        const iconSize = 1.5;

        for(let i = 0; i < this.displayData.length; i++){

            const d = this.displayData[i];

            if(d.type === "spawn") this.renderItem(c, d, this.playerStartImage, iconSize, iconSize)//this.renderSpawn(c, d);
            if(d.type === "flag") this.renderFlag(c, d);
            if(d.type === "ammo") this.renderItem(c, d, this.ammoIcon, iconSize, iconSize);
            if(d.type === "weapon") this.renderItem(c, d, this.gunIcon, iconSize, iconSize);
            if(d.type === "pickup") this.renderItem(c, d, this.pickupIcon, iconSize, iconSize);

  
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

    render(){



        if(this.canvasRef.current === null) return;
        

        const c = this.canvasRef.current.getContext("2d");
        c.textBasline = "top";
        //console.log(performance.now());

       // c.fillStyle = "white";

       // c.fillRect(Math.random() * 100, Math.random() * 100, 5, 5);

        c.fillStyle = "rgb(12,12,12)";
        c.fillRect(0,0, this.percentToPixels(100, "x", true), this.percentToPixels(100, "y", true));

        this.renderGrid(c);

        this.renderData(c);

        this.renderInterface(c);
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

            testMap.setData(state.data);
            canvasRef.current.addEventListener("mousemove", fart);
            canvasRef.current.addEventListener("mousedown", userClicked);

            canvasRef.current.addEventListener("mouseup", mouseRelease);
            canvasRef.current.addEventListener("mouseleave", mouseRelease);

            canvasRef.current.addEventListener("wheel", mouseWheel);
            
            const canvasElem = canvasRef.current;

            return () =>{
                canvasElem.removeEventListener("mousedown", userClicked);
                canvasElem.removeEventListener("click", userClicked);
                canvasElem.removeEventListener("mouseup", mouseRelease);
                canvasElem.removeEventListener("mouseLeave", mouseRelease);
                canvasElem.removeEventListener("wheel", mouseWheel);
                canvasElem.removeEventListener("mousemove", fart);
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