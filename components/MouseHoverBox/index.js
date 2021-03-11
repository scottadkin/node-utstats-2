import React from 'react';
import styles from './MouseHoverBox.module.css';
import Functions from '../../api/functions';

const showMouseOver = (e, title, content) =>{


    if(content === "") return;
    
    const elem = document.getElementById("mouse-over");
    const titleElem = document.getElementById("mouse-over-title");
    const contentElem = document.getElementById("mouse-over-content");

    const x = e.pageX + 10;
    const y = e.pageY + 10;

    //if(titleElem.innerHTML !== title && contentElem.innerHTML !== content){
        titleElem.innerHTML = title
        contentElem.innerHTML = content;
    //}
    elem.style.cssText = `display:inline-block;margin-left:${x}px;margin-top:${y}px`;
}

const hideMouseOver = () =>{

    const elem = document.getElementById("mouse-over");
    elem.style.cssText = `display:none;`;
}

const MouseHoverBox = ({title, display, content}) =>{

    return <span onMouseMove={((e) =>{
        showMouseOver(e, title, content);
    })}

        onMouseLeave={hideMouseOver}
    
    >
       
        {display}
    </span>
}


export default MouseHoverBox;