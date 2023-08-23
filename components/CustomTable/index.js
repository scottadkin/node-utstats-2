import styles from "./CustomTable.module.css";
import MouseOver from "../MouseOver";
import Link from "next/link";


const createRow = (data, index) =>{

    const elems = [];

    for(const key of Object.keys(data)){

        const {value, displayValue, className, url, bNoTD} = data[key];

        const onClick = data[key].onClick || null;

        const currentStyleClass = (className !== undefined) ? className : null;

        let inner = (displayValue === undefined) ? value : displayValue;

        if(url !== undefined){
            inner = <Link href={url}>{inner}</Link>
        }

        if(bNoTD === undefined || !bNoTD){

            elems.push(<td className={currentStyleClass} key={key} onClick={onClick}>
                {inner}
            </td>);

            continue;
        }

        elems.push(inner);   
    }

    return <tr key={index}>
        {elems}
    </tr>
}

const CustomTable = ({width, headers, data, bNoMarginBottom}) =>{

    if(width === undefined) width = 1;
    if(bNoMarginBottom === undefined) bNoMarginBottom = false;

    let tableClassName = `t-width-${width}`;

    const headerElems = [];

    for(const [key, value] of Object.entries(headers)){

        let currentContent = "";

        if(value.mouseOver !== undefined){

            const {title, content} = value.mouseOver;
            currentContent = <MouseOver title={title} display={content}>{value.display}</MouseOver>;
        }else{
            currentContent = value.display;
        }


        headerElems.push(<th onClick={(value.onClick !== undefined) ? value.onClick : null} key={key}>{currentContent}</th>);

    }

    const headerRow = (headerElems.length > 0) ? <tr>{headerElems}</tr> : null;

    let index = 0;

    const dataRows = data.map((d) =>{

        index++;
        return createRow(d, index);
        
    });

    if(dataRows.length === 0){

        dataRows.push(<tr key="none"><td colSpan={Object.keys(headers).length}>No Data</td></tr>);
    }

    let style = {};

    if(!bNoMarginBottom){
        style = {"marginBottom": "var(--margin-1)"};
    }

    return <table style={style} className={`${styles.wrapper} ${tableClassName}`}>
            <tbody>
                {headerRow}
                {dataRows}
            </tbody>
    </table>
}

export default CustomTable;