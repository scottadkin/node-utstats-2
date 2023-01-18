import {React, useEffect, useRef, useState} from "react";


const PieChart = ({parts, title}) =>{

    const canvasRef = useRef(null);
    const [infoText, setInfoText] = useState("");

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

        const percentToAngle = (value) =>{

            if(value === 0) return 0;
            return (value / 100) * 360;   
        }

        const degreesToRadians = (value) =>{
            return value * (Math.PI / 180)
        }

        const drawChunk = (startAngle, endAngle, color) =>{

            const centerX = percentToPixels(true, 78);
            const centerY = percentToPixels(false, 50);

            c.strokeStyle = color;
            c.fillStyle = color;
            c.beginPath();
            c.moveTo(centerX, centerY);
            c.arc(
                centerX, 
                centerY,
                percentToPixels(false, 35),
                degreesToRadians(percentToAngle(startAngle)) ,
                degreesToRadians(percentToAngle(startAngle + endAngle))
            );
            c.stroke();
            c.fill();
            c.closePath();

        }

        c.fillStyle = "white";
        c.textBaseline = "top";
        c.textAlign = "center";
        c.font = `${percentToPixels(false, 9)}px Arial`;
        c.fillText(title, percentToPixels(true, 50), percentToPixels(false, 3));
    

        const keyTextOffset = {"x": 5, "y": 20};
        
        
        const drawKey = (name, value) =>{

            const fontSize = 6.5;    
            const textOffsetX = percentToPixels(true, 4);
            
            c.textAlign = "left";
            c.font = `${percentToPixels(false, fontSize)}px Arial`;

            const x = keyTextOffset.x;
            const y = percentToPixels(false, keyTextOffset.y);

            c.fillRect(x, y, percentToPixels(true, 3), percentToPixels(false, 5));
    
            const nameLength = c.measureText(`${name} `).width;
            c.fillText(name, x + textOffsetX, y);

            c.font = `bold ${percentToPixels(false, fontSize)}px Arial`;
            c.fillText(value, x + textOffsetX + nameLength, y);

            keyTextOffset.y += fontSize * 1.2;
        }

        

        c.strokeStyle = "red";
        c.fillStyle = "red";
        
        

        

       let currentAngle = 0;

        for(let i = 0; i < parts.length; i++){

            const p = parts[i];
            
            drawChunk(currentAngle, p.percent, colors[i % colors.length]);
            currentAngle += p.percent;
            c.fillStyle = colors[i % colors.length];
            drawKey(p.name, p.value);
        }

        c.fillStyle = "white";

        c.fillText(infoText, percentToPixels(true, 5), percentToPixels(false, 90))

        //imageData = c.getImageData(0,0, canvas.width, canvas.height,);
        //console.log(imageData);

    }


    useEffect(() =>{
        
        const test = (e) =>{

            if(canvasRef === null) return

            const bounds = canvasRef.current.getBoundingClientRect();

            const x = e.clientX - bounds.left;
            const y = e.clientY - bounds.top;

            const data = canvasRef.current.getContext("2d").getImageData(x, y, 1, 1);

            const red = data.data[0];
            const green = data.data[1];
            const blue = data.data[2];

            const currentColor = `rgb(${red},${green},${blue})`;

            setInfoText("fart");

            console.log(currentColor);
           

        }

        const canvas = canvasRef.current;

        if(canvasRef.current !== null){
            canvasRef.current.addEventListener("mousemove", test);
        }


        return () =>{
            canvas.removeEventListener("mousemove", test);
        }
    }, [parts]);


    renderCanvas();

    return <div>
        <canvas ref={canvasRef} width={500} height={200}></canvas>
    </div>
}


export default PieChart;