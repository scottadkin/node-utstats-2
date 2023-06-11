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

        console.log(`new Interactive Map`);
        this.canvasRef = canvasRef;
        this.min = {"x": null, "y": null, "z": null};
        this.max = {"x": null, "y": null, "z": null};
        this.bit = {"x": null, "y": null, "z": null};
        this.range = {"x": 0, "y": 0, "z": 0};

        this.mouse = {"x": -999, "y": -999};
        //includes scaling with zoom
        this.click = {"x": null, "y": null};

        this.playerStartImage = new Image();
        this.playerStartImage.src = "/images/playerstart.png";
        
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
                //"z": this.removeOffset(d.y),
            };



            this.displayData.push(current);
        }
    }

    async loadImage(url){

        return new Promise((resolve, reject) =>{

            const image = new Image();
            image.src = url;

            image.onload = () =>{
                console.log(`loaded ${url}`);
                resolve();
            }
        });
    }

    async setData(data){


        this.data = data;

        this.displayData = [];

        this.setMinMax();

        this.createDisplayData();

        await this.loadImage("/images/playerstart.png");
 
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

    renderSpawns(c){

        c.fillStyle = "orange";


        const imageWidth = this.playerStartImage.width;
        const imageHeight = this.playerStartImage.height;

        c.font = "12px Arial";

        for(let i = 0; i < this.displayData.length; i++){

            const d = this.displayData[i];

            c.drawImage(this.playerStartImage, this.percentToPixels(d.x, "x") - (imageWidth * 0.5), this.percentToPixels(d.y, "y") - (imageHeight * 0.5));
            c.fillRect(this.percentToPixels(d.x, "x"), this.percentToPixels(d.y, "y"), 5, 5);

            c.fillText(`${d.x.toFixed(1)},${d.y.toFixed(1)}`,this.percentToPixels(d.x, "x"), this.percentToPixels(d.y, "y"));

        }
    }

    renderInterface(c){

        c.fillStyle = "rgba(255,0,0,0.8)";

        c.fillRect(0,0, this.percentToPixels(100, "x", true), this.percentToPixels(10, "y", true));

        c.fillStyle = "white";

        c.font = "20px Arial";

        c.fillText(`${this.zoom}%`, 20, 20);
    }

    updateMouseLocation(mouseX, mouseY){

        const bitX = 100 / this.canvasRef.current.width;
        const bitY = 100 / this.canvasRef.current.height;

        this.mouse.x = mouseX * bitX;
        this.mouse.y = mouseY * bitY;
    }

    userClicked(){
        

        const x = this.mouse.x;
        const y = this.mouse.y;

        //clicked interface
        if(y <= 10){

            if(x < 50) this.zoom+=5;
            if(x >= 50) this.zoom-=5;
            if(this.zoom <= 0) this.zoom = 5;

            console.log(this.mouse);

        }else{

            const fixedX = x * (this.zoom / 100);
            const fixedY = y * (this.zoom / 100);

            this.click = {"x": fixedX, "y": fixedY};

            console.log(this.click);
        }



        this.render();

    }

    render(){



        if(this.canvasRef.current === null) return;
        

        const c = this.canvasRef.current.getContext("2d");
        //console.log(performance.now());

       // c.fillStyle = "white";

       // c.fillRect(Math.random() * 100, Math.random() * 100, 5, 5);

        c.clearRect(0,0, this.percentToPixels(100, "x", true), this.percentToPixels(100, "y", true));

        this.renderSpawns(c);

        this.renderInterface(c);
    }
}

const loadData = async (controller, id, dispatch) =>{

    try{

        const req = await fetch(`/api/map/?mode=spawns&id=${id}`);

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
                testMap.updateMouseLocation(e.clientX - bounds.x, e.clientY - bounds.y);
                testMap.render();
            }

            const userClicked = () =>{

                testMap.userClicked();
            }

            testMap.setData(state.data);
            canvasRef.current.addEventListener("mousemove", fart);
            canvasRef.current.addEventListener("click", userClicked);
            
            const canvasElem = canvasRef.current;

            return () =>{
                canvasElem.removeEventListener("mousemove", fart);
                canvasElem.removeEventListener("click", userClicked);
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
        <canvas ref={canvasRef} width={500} height={500}></canvas>
    </div>
}


export default MapInteractiveMap;