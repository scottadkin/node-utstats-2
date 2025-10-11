import {useState, useRef, useEffect} from "react";
import styles from "./MouseOver.module.css";


function MouseOver({children, display, title}){

    const [marginTop, setMarinTop] = useState(0);
    const [bDisplay, setbDisplay] = useState(false);
    const [marginLeft, setMarginLeft] = useState(0);
    const [pageWidth, setPageWidth] = useState((typeof window !== "undefined") ? window.innerWidth : 0);

    const mainRef = useRef(null);
    const mouseRef = useRef(null);

    function setMouseOverPosition(e){

        setbDisplay(true);

        const bounds = mainRef.current.getBoundingClientRect();

        setMarinTop(bounds.height + 10);

        let mouseBoxWidth = 500;

        if(mouseRef.current !== null){
            const mouseBounds = mouseRef.current.getBoundingClientRect();
            mouseBoxWidth = mouseBounds.width + 20;
        }else{
            return;
        }   

        if(e.clientX + mouseBoxWidth > pageWidth){

            const offset = (e.clientX + mouseBoxWidth) - pageWidth;
            setMarginLeft(e.clientX - bounds.left - offset);
        }else{
            setMarginLeft(e.clientX - bounds.left);
        }

        
    }

    let mouseOverElem = null;

    

    useEffect(() =>{

        const controller = new AbortController();

        function updatePageWidth(){
            setPageWidth(window.innerWidth);
        }

        window.addEventListener("resize", updatePageWidth, {"signal": controller.signal});

        return () =>{
            controller.abort();
        }
    });

    if(bDisplay){

        const style = {"marginLeft": `${marginLeft}px`, "marginTop": `${marginTop}px`};

        const mouseTitle = (title === undefined) ? null : <div className={styles.mt}>{title}</div>

        mouseOverElem = <div className={styles.mo} ref={mouseRef} style={style} onMouseOver={() =>{setbDisplay(false)}}>
            {mouseTitle}
            <div className={styles.mc}>{display}</div>
        </div>
    }
    
    return <div ref={mainRef} onMouseLeave={() => { setbDisplay(false)}} onMouseMove={(e) => {setMouseOverPosition(e)}}>
        {mouseOverElem}
        {children}
    </div>;
}

export default MouseOver;