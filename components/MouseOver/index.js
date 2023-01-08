import React, {useState, useRef, useEffect} from "react";
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
        const offset = 10;


        const maxOffset = bounds.left + 200;

        if(maxOffset > pageWidth){

            const overlap = maxOffset - pageWidth;
            setMarginLeft(-overlap);
            
        }

        setMarinTop(bounds.height + offset);
    }

    let mouseOverElem = null;

    

    useEffect(() =>{

        function updatePageWidth(){
            setPageWidth(window.innerWidth);
        }

        window.addEventListener("resize", updatePageWidth);

        return () =>{
            window.removeEventListener("resize", updatePageWidth);
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
    
    return <div ref={mainRef} onMouseLeave={() => { setbDisplay(false)}} onMouseOver={(e) => {setMouseOverPosition(e)}}>
        {mouseOverElem}
        {children}
    </div>;
}

export default MouseOver;