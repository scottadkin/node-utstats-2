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
                "data": action.data
            }
        }
    }

    return state;
}


class InteractiveMap{

    constructor(canvasRef){

        this.zoom = 100;
        this.offset = {"x": 0, "y": 0, "z": 0};

        console.log(`new Interactive Map`);
        this.canvasRef = canvasRef;
        this.min = {"x": null, "y": null, "z": null};
        this.max = {"x": null, "y": null, "z": null};
        this.bit = {"x": null, "y": null, "z": null};
        this.range = {"x": 0, "y": 0, "z": 0};

        this.mouse = {"x": -999, "y": -999, "bMouseDown": false};
        //includes scaling with zoom
        this.click = {"x": null, "y": null};

        this.playerStartImage = new Image();
        this.redFlag = new Image();
        this.blueFlag = new Image();
        this.greenFlag = new Image();
        this.yellowFlag = new Image();
        
        this.main();
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

        await this.loadImage("/images/playerstart.png", this.playerStartImage);
        await this.loadImage("/images/redflag.png", this.redFlag);
        await this.loadImage("/images/blueflag.png", this.blueFlag);
        await this.loadImage("/images/greenflag.png", this.greenFlag);
        await this.loadImage("/images/yellowflag.png", this.yellowFlag);

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

    renderSpawn(c, data){

        c.fillStyle = "orange";

        const imageWidth = this.playerStartImage.width;
        const imageHeight = this.playerStartImage.height;

        c.font = "12px Arial";

        const d = data;

        const x = this.percentToPixels(d.x + this.offset.x, "x") - (imageWidth * 0.5);
        const y = this.percentToPixels(d.y + this.offset.y, "y") - (imageHeight * 0.5);

        c.drawImage(this.playerStartImage, x, y);
        c.fillRect(x, y, 5, 5);
        c.fillText(`${d.x.toFixed(1)},${d.y.toFixed(1)}`,x, y);
 
    }

    renderFlag(c, data){


        let image = this.redFlag;


        const imageWidth = this.redFlag.width * 2;
        const imageHeight = this.redFlag.height * 2;

        const d = data;

        if(d.team === 1) image = this.blueFlag;
        if(d.team === 2) image = this.greenFlag;
        if(d.team === 3) image = this.yellowFlag;

        const x = this.percentToPixels(d.x + this.offset.x, "x") - (imageWidth * 0.5);
        const y = this.percentToPixels(d.y + this.offset.y, "y") - (imageHeight * 0.5);

        c.drawImage(image, x, y, imageWidth, imageHeight);
    }

    renderInterface(c){

        c.fillStyle = "rgba(255,0,0,0.8)";

        c.fillRect(0,0, this.percentToPixels(100, "x", true), this.percentToPixels(10, "y", true));

        c.fillStyle = "white";

        c.font = "20px Arial";

        c.fillText(`${this.zoom}%`, 20, 20);
    }

    updateMouseLocation(mouseX, mouseY, movementX, movementY){

        const bitX = 100 / this.canvasRef.current.width;
        const bitY = 100 / this.canvasRef.current.height;

        this.mouse.x = mouseX * bitX;
        this.mouse.y = mouseY * bitY;

        if(this.mouse.bMouseDown){

            const mX = this.pixelsToPercent(movementX * 2, "x");
            const mY = this.pixelsToPercent(movementY * 4, "y");

            this.offset.x += mX;
            this.offset.y += mY;
        }
    }

    userClicked(){

        console.log(`click`);
    

        const x = this.mouse.x;
        const y = this.mouse.y;

        //clicked interface
        if(y <= 10){

            if(x < 50) this.zoom+=5;
            if(x >= 50) this.zoom-=5;
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

        for(let i = 0; i < this.displayData.length; i++){

            const d = this.displayData[i];

            if(d.type === "spawn") this.renderSpawn(c, d);
            if(d.type === "flag") this.renderFlag(c, d);
        }

    }

    render(){



        if(this.canvasRef.current === null) return;
        

        const c = this.canvasRef.current.getContext("2d");
        //console.log(performance.now());

       // c.fillStyle = "white";

       // c.fillRect(Math.random() * 100, Math.random() * 100, 5, 5);

        c.fillStyle = "rgb(12,12,12)";
        c.fillRect(0,0, this.percentToPixels(100, "x", true), this.percentToPixels(100, "y", true));

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

            testMap.setData(state.data);
            canvasRef.current.addEventListener("mousemove", fart);
            canvasRef.current.addEventListener("mousedown", userClicked);

            canvasRef.current.addEventListener("mouseup", mouseRelease);
            canvasRef.current.addEventListener("mouseleave", mouseRelease);
            
            const canvasElem = canvasRef.current;

            return () =>{
                canvasElem.removeEventListener("mousedown", fart);
                canvasElem.removeEventListener("click", userClicked);
                canvasElem.removeEventListener("mouseup", mouseRelease);
                canvasElem.removeEventListener("mouseLeave", mouseRelease);
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