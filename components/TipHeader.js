const showTipBox = (title, content, event) =>{

    const elem = document.getElementById("mouse-over");
    const titleElem = document.getElementById("mouse-over-title");
    const contentElem = document.getElementById("mouse-over-content");

    titleElem.innerHTML = title;
    contentElem.innerHTML = content;
    elem.style.cssText = `margin-top:${event.clientY + 25}px;margin-left:${event.clientX + 10}px;`;

}

const hideTipBox = () =>{

    const elem = document.getElementById("mouse-over");
    elem.style.cssText = "display:none;";
}

const TipHeader = ({title, content}) =>{

    return (
    <th
    onMouseMove={((event) =>{
        showTipBox(title, content, event)
    })}
    onMouseOut={((event) =>{
        hideTipBox(title, content, event)
    })}
    >
        {title}
    </th>);
}


export default TipHeader;