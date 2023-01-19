import {React, useEffect, useRef, useState} from "react";


const PieChart = ({parts, titles, tabs}) =>{

    if(tabs === undefined){
        tabs = [];
    }

    const canvasRef = useRef(null);
    const [mouse, setMouse] = useState({"x": -999, "y": -999});
    const [currentTab, setCurrentTab] = useState(0);
    //const [infoText, setInfoText] = useState("");

    const tabsHeight = 15;

    const colors = [
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


    const renderCanvas = () =>{

        if(canvasRef === null) return;
        if(canvasRef.current === null) return;

        const canvas = canvasRef.current;
        const c = canvas.getContext("2d", {"willReadFrequently": true});

        c.fillStyle = "black";
        c.fillRect(0,0, canvas.width, canvas.height);


        const percentToPixels = (bWidth, value) =>{

            const sizeInPixels = (bWidth) ? canvas.width : canvas.height;   
            const percent = sizeInPixels * 0.01;
            return  percent * value;
        }

        const tabsHeightPercent = percentToPixels(false, tabsHeight);

        const percentToAngle = (value) =>{

            if(value === 0) return 0;
            return (value / 100) * 360;   
        }

        const degreesToRadians = (value) =>{
            return value * (Math.PI / 180)
        }

        const drawChunk = (startAngle, endAngle, color) =>{

            const centerX = percentToPixels(true, 82);
            const centerY = percentToPixels(false, 45) + tabsHeightPercent;

            c.strokeStyle = color;
            c.fillStyle = color;
            c.beginPath();
            c.moveTo(centerX, centerY);
            c.arc(
                centerX, 
                centerY,
                percentToPixels(false, 37),
                degreesToRadians(percentToAngle(startAngle)) ,
                degreesToRadians(percentToAngle(startAngle + endAngle))
            );
            c.stroke();
            c.fill();
            c.closePath();

        }

        

        const renderTitle = () =>{

            c.fillStyle = "white";
            c.textBaseline = "top";
            c.textAlign = "center";
            c.font = `${percentToPixels(false, 9)}px Arial`;
            c.fillText(titles[currentTab], percentToPixels(true, 50), percentToPixels(false, 3) + tabsHeightPercent);
        }


        const keyTextOffset = {"x": 5, "y": 2 + tabsHeightPercent};
        
        
        const drawKey = (name, value, percent) =>{

            const fontSize = 6;    
            const percentOffset = percentToPixels(true, 5);
            const nameOffset = percentToPixels(true, 17);
            const valueOffset = percentToPixels(true, 43);
            
            c.textAlign = "left";
            c.font = `${percentToPixels(false, fontSize)}px Arial`;

            const x = keyTextOffset.x;
            const y = percentToPixels(false, keyTextOffset.y);

            c.fillRect(x, y, percentToPixels(true, 3), percentToPixels(false, 5));


            c.fillText(`${percent.toFixed(2)}%`, percentOffset, y);
            c.fillText(name, nameOffset, y);

            c.font = `bold ${percentToPixels(false, fontSize)}px Arial`;
            c.fillText(value, valueOffset, y);

            keyTextOffset.y += fontSize * 1.4;
        }


        const renderTabs = () =>{

            c.fillStyle = "orange";
            c.fillRect(0, 0, canvas.width, tabsHeightPercent);

            const tabWidth = 100 / titles.length;

            
            c.lineWidth = "2px";
            c.strokeStyle = "green";
            c.textAlign = "center";

            c.font = `${tabsHeightPercent * 0.6}px Arial`;

            let offsetX = 0;

            let bHovering = false;

            for(let i = 0; i < titles.length; i++){

                const x = percentToPixels(true, offsetX)
                const y = 0;
                const width = percentToPixels(true, tabWidth);

                if(mouse.x >= x && mouse.x < x + width && mouse.y >= 0 && mouse.y <= tabsHeightPercent){
                    c.fillStyle = "green";
                    bHovering = true;
                }else{
                    c.fillStyle = "red";
                }     

                c.fillRect(x, y, width, tabsHeightPercent);
                c.strokeRect(x, y, width, tabsHeightPercent);

  
                c.fillStyle = "black";

                c.fillText(titles[i], x + (width * 0.5), percentToPixels(false, 2.3));

                offsetX += tabWidth;
            }

            if(bHovering){
                canvas.className = "hover";
            }else{
                canvas.className = "default-cursor";
            }
        }

    
        const renderChunks = () =>{

            let currentAngle = 0;

            for(let i = 0; i < parts[currentTab].length; i++){

                const p = parts[currentTab][i];
                
                drawChunk(currentAngle, p.percent, colors[i % colors.length]);
                currentAngle += p.percent;
                c.fillStyle = colors[i % colors.length];
                drawKey(p.name, p.value, p.percent);
            }

        }

    
        renderChunks();
        renderTitle();
        renderTabs();
    }


    useEffect(() =>{

        const updateMousePosition = (e) =>{

            const bounds = canvasRef.current.getBoundingClientRect();

            const x = e.clientX - bounds.left;
            const y = e.clientY - bounds.top;

            setMouse({"x": x, "y": y});
            renderCanvas();
        }

        let bClicked = false;

        const checkClickLocation = (e) =>{

            const bounds = canvasRef.current.getBoundingClientRect();

            const x = e.clientX - bounds.left;
            const y = e.clientY - bounds.top;

            const maxY = bounds.height * (tabsHeight * 0.01);

            const tabWidth = bounds.width / titles.length;

            if(y <= maxY){

                for(let i = 0; i < titles.length; i++){

                    const startX = tabWidth * i;
                    const endX = startX + tabWidth;

                    if(x >= startX && x < endX){
                        setCurrentTab(i);
                        bClicked = true;
                        return;
                    }
                }
            }  
        }

        const mouseLeave = () =>{
            setMouse({"x": -999, "y": -999});
        }

        if(canvasRef !== null){
            canvasRef.current.addEventListener("mousemove", updateMousePosition);
            canvasRef.current.addEventListener("mousedown", checkClickLocation);
            canvasRef.current.addEventListener("mouseleave", mouseLeave);
        }

        let canvas = null;

        if(canvasRef !== null){
            canvas = canvasRef.current;
        }

        if(bClicked){
            renderCanvas();
        }

        return () =>{    
            canvas.removeEventListener("mousemove", updateMousePosition);
            canvas.removeEventListener("mousedown", checkClickLocation);
            canvas.removeEventListener("mouseleave", mouseLeave);
        }
    
    });


    renderCanvas();

    return <div>
        <canvas ref={canvasRef} width={450} height={200}></canvas>
    </div>
}


export default PieChart;