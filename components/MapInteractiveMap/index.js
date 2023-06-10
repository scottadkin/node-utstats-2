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

        this.zoom = 1;

        console.log(`new Interactive Map`);
        this.canvasRef = canvasRef;
        this.min = {"x": null, "y": null, "z": null};
        this.max = {"x": null, "y": null, "z": null};
        this.bit = {"x": null, "y": null, "z": null};
        this.range = {"x": 0, "y": 0, "z": 0};


        this.playerStartImage = new Image();
        this.playerStartImage.src = "/images/playerstart.png";

        console.log(this.playerStartImage.width);
        console.log(this.playerStartImage.height);
        
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

    percentToPixels(value, type){

        type = type.toLowerCase();

        if(type !== "x" && type !== "y") return -1;
 
        const size = (type === "x") ? this.canvasRef.current.width : this.canvasRef.current.height;

        if(size === 0) return 0;

        const bit = size / (100 * this.zoom);

        return bit * value;
    }

    renderSpawns(c){

        c.fillStyle = "orange";

        console.log(this.range.x, this.range.y, this.range.z);

        const imageWidth = this.playerStartImage.width;
        const imageHeight = this.playerStartImage.height;

        for(let i = 0; i < this.displayData.length; i++){

            const d = this.displayData[i];

            c.drawImage(this.playerStartImage, this.percentToPixels(d.x, "x") - (imageWidth * 0.5), this.percentToPixels(d.y, "y") - (imageHeight * 0.5));
            c.fillRect(this.percentToPixels(d.x, "x"), this.percentToPixels(d.y, "y"), 5, 5);

        }
    }

    render(){
        
        //console.log(this.canvasRef);
        //console.log(this.context);

        if(this.canvasRef.current === null) return;
        

        const c = this.canvasRef.current.getContext("2d");
        //console.log(performance.now());

       // c.fillStyle = "white";

       // c.fillRect(Math.random() * 100, Math.random() * 100, 5, 5);

        this.renderSpawns(c);
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

            const fart = () =>{
                console.log("horse noise");
                testMap.render();
            }

            testMap.setData(state.data);
            canvasRef.current.addEventListener("click", fart);
            
            const canvasElem = canvasRef.current;

            return () =>{
                canvasElem.removeEventListener("click", fart);
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