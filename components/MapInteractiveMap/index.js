import { useRef, useEffect, useReducer } from "react";
import styles from "./MapInteractiveMap.module.css";
import ErrorMessage from "../ErrorMessage";
import Loading from "../Loading";
import {getPlayer, toPlaytime, MMSS} from "../../api/generic.mjs";

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
                "killData": action.killData,
                "weaponNames": action.weaponNames,
                "playerNames": action.playerNames
            }
        }
    }

    return state;
}


class MapButton{

    constructor(text, x, y, width, height, backgroundColor, fontColor, fontSize, action, valueName){

        this.text = text;
        this.width = width;
        this.height = height;
        this.valueName = valueName;

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
        this.bottomInterfaceHeight = 5;

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

        this.bShowWeapons = true;
        this.bShowAmmo = true;
        this.bShowPickups = true;
        this.bShowSpawns = true;
        this.bShowKillers = true;
        this.bShowDeaths = true;
        this.bShowSuicides = true;


        //for kills stuff later
        this.bPlaying = false;
        this.currentTime = 0;
        this.endTime = null;
        this.timeScale = 1;
        //how many "seconds" to display kill/death/suicide icons 
        //if event happened at 00:35 display to 00:45 if set to 10
        this.timeRange = 10;
        
        this.main();
    }

    createButtons(){

        this.buttons = [];

        const backgroundColor = "rgba(32,32,32, 0.8)";
        const fontColor = "white";
        const fontSize = 0.66;


        this.buttons.push(new MapButton("Zoom In", 0, 0, 10, 5, backgroundColor, fontColor, fontSize, () =>{
            this.adjustZoom(-1);
        }));

        this.buttons.push(new MapButton("Zoom Out", 0, 5, 10, 5, backgroundColor, fontColor, fontSize, () =>{
            this.adjustZoom(1);
        }));

        this.buttons.push(new MapButton("Weapons", 10, 0, 15, 5, backgroundColor, fontColor, fontSize, () =>{
           
            this.bShowWeapons = !this.bShowWeapons;
        }, "bShowWeapons"));

        this.buttons.push(new MapButton("Ammo", 10, 5, 15, 5, backgroundColor, fontColor, fontSize, () =>{  
            this.bShowAmmo = !this.bShowAmmo;
        }, "bShowAmmo"));

        this.buttons.push(new MapButton("Pickups", 25, 0, 15, 5, backgroundColor, fontColor, fontSize, () =>{  
            this.bShowPickups = !this.bShowPickups;
        }, "bShowPickups"));

        this.buttons.push(new MapButton("Spawns", 25, 5, 15, 5, backgroundColor, fontColor, fontSize, () =>{  
            this.bShowSpawns = !this.bShowSpawns;
        }, "bShowSpawns"));

        this.buttons.push(new MapButton("Killer Locations", 40, 0, 15, 5, backgroundColor, fontColor, fontSize, () =>{  
            this.bShowKillers = !this.bShowKillers;
        }, "bShowKillers"));

        this.buttons.push(new MapButton("Death Locations", 40, 5, 15, 5, backgroundColor, fontColor, fontSize, () =>{  
            this.bShowDeaths = !this.bShowDeaths;
        }, "bShowDeaths"));

        this.buttons.push(new MapButton("Suicide Locations", 55, 0, 15, 5, backgroundColor, fontColor, fontSize, () =>{  
            this.bShowSuicides = !this.bShowSuicides;
        }, "bShowSuicides"));


        this.buttons.push(new MapButton("Fullscreen", 85, 0, 15, 5, backgroundColor, fontColor, fontSize, () =>{

            this.canvasRef.current.requestFullscreen().then(() =>{
           
                this.canvasRef.current.width = window.innerWidth;
                this.canvasRef.current.height = window.innerHeight;
                this.render();
            });
            
        }));

        this.buttons.push(new MapButton("Normal View", 85, 5, 15, 5,  backgroundColor, fontColor, fontSize, () =>{

            //console.log(document.fullscreenElement);
            document.exitFullscreen().then(() =>{
           
                this.canvasRef.current.width = window.innerWidth;
                this.canvasRef.current.height = window.innerHeight;
                this.render();
            }).catch(() =>{

            });
            
        }));

        this.buttons.push(new MapButton(
            "Play/Pause", 
            0, 
            100 - this.bottomInterfaceHeight, 
            10, 
            this.bottomInterfaceHeight, 
            backgroundColor, 
            fontColor, 
            fontSize, () =>{  
                this.bPlaying = !this.bPlaying;
            }, "bPlaying")
        );
    }

    adjustZoom(value){

        if(value > 0) this.zoom += 0.05;
        if(value < 0) this.zoom -= 0.05;


        if(this.zoom < 0.05) this.zoom = 0.05;
        this.render();
    }

    updateMinMax(x, y, z){

        if(this.min.x === null || this.min.y === null || this.min.z === null){

            this.min.x = x;
            this.min.y = y;
            this.min.z = z;

            this.max.x = x;
            this.max.y = y;
            this.max.z = z;

            return;
        }

        if(x < this.min.x) this.min.x = x;
        if(x > this.max.x) this.max.x = x;

        if(y < this.min.y) this.min.y = y;
        if(y > this.max.y) this.max.y = y;

        if(z < this.min.z) this.min.z = z;
        if(z > this.max.z) this.max.z = z;
    }

    updateEndTime(timestamp){

        if(timestamp > this.endTime) this.endTime = timestamp;
    }

    setMinMax(){


        for(let i = 0; i < this.data.length; i++){

            const {x, y, z} = this.data[i];

            if(this.data[i].timestamp !== undefined){
                this.updateEndTime(this.data[i].timestamp);
            }

            this.updateMinMax(x, y, z);
        }

        for(let i = 0; i < this.killData.length; i++){

            const k = this.killData[i];

            this.updateMinMax(k.victim_x, k.victim_y, k.victim_z);
            this.updateMinMax(k.killer_x, k.killer_y, k.killer_z);
            this.updateEndTime(k.timestamp);
            console.log(k);
        }

        this.range.x = Math.abs(this.max.x - this.min.x);
        this.range.y = Math.abs(this.max.y - this.min.y);
        this.range.z = Math.abs(this.max.z - this.min.z);

        this.bit.x = (this.range.x !== 0) ? 100 / this.range.x : 0;
        this.bit.y = (this.range.y !== 0) ? 100 / this.range.y : 0;
        this.bit.z = (this.range.z !== 0) ? 100 / this.range.z : 0;

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


            /*if(d.type === "kill" || d.type === "victim"){

                //d.killerWeapon = 
                current.killerWeapon = this.weaponNames[d.killerWeapon] ?? "Not Found";
                current.victimWeapon = this.weaponNames[d.victimWeapon] ?? "Not Found";
                current.timestamp = d.timestamp;

                if(d.killer !== undefined){
                    current.killer = getPlayer(this.playerNames, d.killer, true);
                }

                if(d.victim !== undefined){
                    current.victim = getPlayer(this.playerNames, d.victim, true);
                }

                //suicides
                if(d.victimWeapon <= 0){
                    current.suicideType = d.victimWeapon;
                }

                console.log(current);

            }*/


            this.displayData.push(current);
        }

        this.displayKillData = [];

        for(let i = 0; i < this.killData.length; i++){

            const k = this.killData[i];

            const current = {
                "killerId": k.killer,
                "killerWeapon": k.killer_weapon,
                "killerLocation": {
                    "display": {
                        "x": this.pixelsToPercent(this.removeOffset(k.killer_x, "x"), "x"),
                        "y": this.pixelsToPercent(this.removeOffset(k.killer_y, "y"), "y"),
                    },
                    "real": {
                        "x": k.killer_x,
                        "y": k.killer_y,
                        "z": k.killer_z
                    }
                },
                "victimId": k.victim,
                "victimWeapon": k.victim_weapon,
                "victimLocation": {
                    "display": {
                        "x": this.pixelsToPercent(this.removeOffset(k.victim_x, "x"), "x"),
                        "y": this.pixelsToPercent(this.removeOffset(k.victim_y, "y"), "y"),
                    },
                    "real": {
                        "x": k.victim_x,
                        "y": k.victim_y,
                        "z": k.victim_z
                    }
                },
                "type": k.type,
                "name": k.name,
            };

            this.displayKillData.push(current);
        }

        console.log(this.displayKillData);
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

    async setData(data, killData, weaponNames, playerNames){


        this.data = data;
        this.killData = killData;
        this.weaponNames = weaponNames;
        this.playerNames = playerNames;

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

        const startX = d.x - ((width * this.zoom) * 0.5);
        const endX = d.x + ((width * this.zoom)  * 0.5);

        const startY = d.y - ((height * this.zoom) * 0.5);
        const endY = d.y + ((height * this.zoom) * 0.5);

        const fontSize = this.percentToPixels(2, "y", true);

        c.font = `${fontSize}px Arial`;
        c.fillStyle = "orange";

        if(this.mouse.y > this.interfaceHeight && this.hover.x >= startX && this.hover.x <= endX){
            
            if(this.hover.y >= startY && this.hover.y <= endY){
              
                const string1 = `Class: ${d.className}`;
                const string2 = `Name: ${d.name}`;
                const string3 = `X = ${d.realLocation.x}, Y = ${d.realLocation.y}, Z = ${d.realLocation.z}`;

                this.setMouseOverInfo([string1, string2, string3], x, y);
            }
        }
    }

    renderButtons(c){

        c.textAlign = "center";

        const enabledColor = "rgba(30,100,30,0.7)";
        const disabledColor = "rgba(120,2,2,0.7)";

        const bMouseOverInterface = this.mouse.y <= this.interfaceHeight;

        let bMouseOverButton = false;


        for(let i = 0; i < this.buttons.length; i++){

            const b = this.buttons[i];
            //const fontSize = this.percentToPixels(2, "x", true);
            const fontSize = this.percentToPixels(b.height * b.fontSize, "y", true);

            c.font = `${fontSize}px Arial`;

            if(b.valueName === undefined){
                c.fillStyle = b.backgroundColor;
            }else{
                c.fillStyle = (this[b.valueName]) ? enabledColor : disabledColor;
            }

            const width = this.percentToPixels(b.width, "x", true);
            const height = this.percentToPixels(b.height, "y", true);
            const x = this.percentToPixels(b.x, "x", true);
            const y = this.percentToPixels(b.y, "y", true);

            c.fillRect(x,y, width, height);

            if(bMouseOverInterface){

                if(b.bTouching(this.mouse.x, this.mouse.y)){              
                    bMouseOverButton = true;    
                    c.fillStyle = "rgba(255,255,255,0.1)";
                    c.fillRect(x,y, width, height);
                }
            }

            c.fillStyle = b.fontColor;
            c.fillText(b.text, x + width * 0.5, y + fontSize);

            
            
        }

        if(bMouseOverButton){
            this.canvasRef.current.className = "pointer";
        }else{
            this.canvasRef.current.className = "";
        }
        c.textAlign = "left";
    }

    renderBottomInterface(c){

        c.fillStyle = "green";

        const startY = this.percentToPixels(100 - this.bottomInterfaceHeight, "y", true);
        const height = this.percentToPixels(this.bottomInterfaceHeight, "y", true);
        const width = this.percentToPixels(100, "x", "true");
        c.fillRect(0, startY, width, height);

        const progressStartX = this.percentToPixels(50, "x", true);
        const progressWidth = this.percentToPixels(50, "x", true);
        c.fillStyle = "orange";
        c.fillRect(progressStartX, startY, progressWidth, height);


        if(this.endTime === 0) return;
        c.fillStyle = "pink";

        const bit = 100 / this.endTime;

        const currentPercent = bit * this.currentTime;

        c.fillRect(progressStartX, startY, progressWidth *( currentPercent * 0.01), height);
    }

    renderInterface(c){

        c.textBasline = "top";
        c.textAlign = "center";

        c.fillStyle = "rgba(0,0,0,0.35)";

        c.fillRect(0,0, this.percentToPixels(100, "x", true), this.percentToPixels(this.interfaceHeight, "y", true));

        c.fillStyle = "white";

        c.font = `${this.percentToPixels(3.3, "y", true)}px Arial`;

        c.fillText(`${(this.zoom * 100)}%`, 420, 20);


        c.fillText(`${this.hover.x.toFixed(2)}, ${this.hover.y.toFixed(2)}`, 100, 100);

        this.renderBottomInterface(c);

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
        if(y <= this.interfaceHeight || y >= 100 - this.bottomInterfaceHeight){

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
       
        const {team} = item;

        if(team === 0) this.renderItem(c, item, this.redFlag, iconWidth, iconHeight);
        if(team === 1) this.renderItem(c, item, this.blueFlag, iconWidth, iconHeight);
        if(team === 2) this.renderItem(c, item, this.greenFlag, iconWidth, iconHeight);
        if(team === 3) this.renderItem(c, item, this.yellowFlag, iconWidth, iconHeight);

    }


    getSuicideTypeString(type){

        if(type === -2) return "Suicide command";
        if(type === -3) return "Left a small crater";
        if(type === -4) return "Triggered Death/Kill Zone";

        return "Damage to self";
    }

    renderKillDeath(c, data, size, type){

        if(this.bPlaying){
            if(data.timestamp < this.currentTime) return;
            if(data.timestamp > this.currentTime + this.timeRange) return;
        }

        c.fillStyle = "rgba(0,255,0,0.5)";

        if(type === "suicide") c.fillStyle = "rgba(255,255,0,0.4)";
        if(type === "victim") c.fillStyle = "rgba(255,0,0,0.5)";
       
        const x = this.percentToPixels(data.x + this.offset.x, "x");
        const y = this.percentToPixels(data.y + this.offset.y, "y");

        let mainInfo = "";
        let timestamp = "";
        let extraInfo = "";

        if(this.hover.x >= data.x - (size * this.zoom) && this.hover.x <= data.x + (size * this.zoom)){
            //console.log("HORSE");

            if(this.hover.y >= data.y - (size * this.zoom) && this.hover.y <= data.y + (size * this.zoom)){

                c.fillStyle = "white";      
                timestamp = toPlaytime(data.timestamp);

                if(type === "suicide"){
    
                    mainInfo = `${data.killer.name} killed their own dumbself.`
                    extraInfo = this.getSuicideTypeString(data.suicideType);
                    this.setMouseOverInfo([type, mainInfo, extraInfo, timestamp], x, y);

                }else{



                }
                
            }
        }

        size = this.percentToPixels(size, "x", true);

        c.beginPath();
        c.arc(x, y, size, 0, Math.PI * 2);
        c.fill();
        c.closePath();
    }

    fillCircle(c, x, y, size, color){

        c.fillStyle = color;
        c.beginPath();
        c.arc(x, y, size, 0, Math.PI * 2);
        c.fill();
        c.closePath();
    }

    renderKillTest(c, data){

        c.fillStyle = "white";
        c.strokeStyle = "rgba(255,255,255,0.8)";
        c.lineWidth = 1;

        const killerX = this.percentToPixels(data.killerLocation.display.x + this.offset.x, "x");
        const killerY = this.percentToPixels(data.killerLocation.display.y + this.offset.y, "y");

        const victimX = this.percentToPixels(data.victimLocation.display.x + this.offset.x, "x");
        const victimY = this.percentToPixels(data.victimLocation.display.y + this.offset.y, "y");

        const size = 1;

        const fixedSize = size * 0.5// * this.zoom;

        const killerStartX = data.killerLocation.display.x - fixedSize;
        const killerEndX = data.killerLocation.display.x  + fixedSize;

        const killerStartY = data.killerLocation.display.y - fixedSize;
        const killerEndY = data.killerLocation.display.y + fixedSize;

        const victimStartX = data.victimLocation.display.x - fixedSize;
        const victimEndX = data.victimLocation.display.x  + fixedSize;

        const victimStartY = data.victimLocation.display.y - fixedSize;
        const victimEndY = data.victimLocation.display.y + fixedSize;

        const bOverKiller = (this.hover.x >= killerStartX && this.hover.x <= killerEndX) && (this.hover.y >= killerStartY && this.hover.y <= killerEndY);
        const bOverVictim = (this.hover.x >= victimStartX && this.hover.x <= victimEndX) && (this.hover.y >= victimStartY && this.hover.y <= victimEndY);
        //console.log(bOverKiller, bOverVictim);

        const bDisplayLink = this.bShowKillers && this.bShowDeaths;
        
        if(bDisplayLink && (bOverKiller || bOverVictim)){
         
            c.beginPath();
            c.moveTo(
                killerX,
                killerY
            );
            c.lineTo(
                victimX,
                victimY
            );
            c.stroke();
            c.closePath();    
        }


        
        if(this.bShowSuicides && data.killerId === data.victimId){

            this.fillCircle(c, killerX, killerY, this.percentToPixels(size, "y"), "rgba(255,255,0,0.5)");

        }else{

            if(data.killerId === data.victimId) return;

            if(this.bShowKillers){
                this.fillCircle(c, killerX, killerY, this.percentToPixels(size, "y"), "rgba(0,255,0,0.25)");
            }

            if(this.bShowDeaths){
                this.fillCircle(c, victimX, victimY, this.percentToPixels(size, "y"), "rgba(255,0,0,0.25)");
            }
              
        }

    }

    renderData(c){

        let iconWidth = 2.5;
        let iconHeight = 3.3;

        const aspectRatio = this.canvasRef.current.width / this.canvasRef.current.height;

        iconHeight = iconWidth * aspectRatio;
        //console.log(aspectRatio);


        this.mouseOver.bDisplay = false;

        for(let i = 0; i < this.displayData.length; i++){

            const d = this.displayData[i];

            if(d.type === "spawn" && this.bShowSpawns) this.renderItem(c, d, this.playerStartImage, iconWidth, iconHeight)//this.renderSpawn(c, d);
            if(d.type === "flag") this.renderFlag(c, d, iconWidth, iconHeight);
            if(d.type === "ammo" && this.bShowAmmo) this.renderItem(c, d, this.ammoIcon, iconWidth, iconHeight);
            if(d.type === "weapon" && this.bShowWeapons) this.renderItem(c, d, this.gunIcon, iconWidth, iconHeight);
            if(d.type === "pickup" && this.bShowPickups) this.renderItem(c, d, this.pickupIcon, iconWidth, iconHeight);
            //if(d.type === "kill" && this.bShowKillers && d.suicideType === undefined) this.renderKillDeath(c, d, 0.4,  "kill");
            //if(d.type === "victim" && this.bShowDeaths && d.suicideType === undefined) this.renderKillDeath(c, d, 0.4,  "victim");
            //if(d.suicideType !== undefined && this.bShowSuicides) this.renderKillDeath(c, d, 0.4, "suicide");
        }

        for(let i = 0; i < this.displayKillData.length; i++){

            const k = this.displayKillData[i];

            this.renderKillTest(c, k);
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

        c.fillText(MMSS(this.currentTime, true), 100,200);

        this.currentTime += 0.1;
        if(this.currentTime > this.endTime) this.currentTime = 0;
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

        dispatch({
            "type": "loaded", 
            "data": res.data, 
            "killData": res.killData, 
            "weaponNames": res.weaponNames, 
            "playerNames": res.playerNames
        });
 

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
        "killData": null,
        "playerNames": null,
        "weaponNames": null,
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

            testMap.setData(state.data, state.killData, state.weaponNames, state.playerNames);
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