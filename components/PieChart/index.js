import {React, useEffect, useRef} from "react";


const PieChart = ({parts}) =>{

    const canvasRef = useRef(null);

    const renderCanvas = () =>{

        const canvas = canvasRef.current;
        const c = canvas.getContext("2d");

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

            c.strokeStyle = color;
            c.fillStyle = color;
            c.beginPath();
            c.moveTo(percentToPixels(true, 50), percentToPixels(false, 50));
            c.arc(
                percentToPixels(true, 50), 
                percentToPixels(false, 50),
                percentToPixels(true, 25),
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
        c.font = `${percentToPixels(false, 7)}px Arial`;
        c.fillText("Pie Chart", percentToPixels(true, 50), percentToPixels(false, 1));
    
        c.strokeStyle = "red";
        c.fillStyle = "red";
        
        const colors = [
            "red",
            "green",
            "blue"
        ];


       let currentAngle = 0;

        for(let i = 0; i < parts.length; i++){

            const p = parts[i];
            
            drawChunk(currentAngle, p.value, colors[i % colors.length]);
            currentAngle += p.value;
        }
    }


    useEffect(() =>{
        renderCanvas();
        console.log("OINK");
    }, [parts.carryPercent, parts.dropPercent]);


    return <div>
        <canvas ref={canvasRef} width={300} height={250}></canvas>
    </div>
}


export default PieChart;