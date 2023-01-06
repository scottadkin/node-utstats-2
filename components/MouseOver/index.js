import React, {useState, useRef} from "react";
import styles from "./MouseOver.module.css";


function MouseOver({children, display, title}){

    const [marginLeft, setMarginLeft] = useState(0);
    const [marginTop, setMarinTop] = useState(0);
    const [bDisplay, setbDisplay] = useState(false);

    const mainRef = useRef(null);

    function setMouseOverPosition(e){

        setbDisplay(true);

        const bounds = mainRef.current.getBoundingClientRect();

        const offset = 10;
        setMarginLeft(e.clientX - bounds.left + offset);
        setMarinTop(e.clientY - bounds.top + offset);
    }

    let mouseOverElem = null;

    if(bDisplay){

        const style = {"marginLeft": marginLeft, "marginTop": marginTop};

        const mouseTitle = (title === undefined) ? null : <div className={styles.mt}>{title}</div>

        mouseOverElem = <div className={styles.mo} style={style} onMouseOver={() =>{setbDisplay(false)}}>
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