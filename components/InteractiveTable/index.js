import {React, useState, useEffect} from "react";
import Table2 from "../Table2";
import styles from "./InteractiveTable.module.css";
import Link from "next/link";
import TableHeader from "../TableHeader";
import MouseOver from "../MouseOver";


const InteractiveTable = (props) =>{

    const [orderBy, setOrderBy] = useState((props.defaultOrder !== undefined) ? props.defaultOrder : null);
    const [bAsc, setbAsc] = useState((props.bAsc !== undefined) ? props.bAsc : true);
    const [currentPage, setCurrentPage] = useState(0);
    //const [totalPages, setTotalPages] = useState(0);
    const [displayPerPage, setDisplayPerPage] = useState((props.perPage !== undefined) ? props.perPage : 50);
    const [bDisplayAll, setbDisplayAll] = useState(false);

    let totalPages = 0;

    if(props.data.length > 0 && displayPerPage > 0){
        if(props.data.length > 0 && displayPerPage > 0){
            totalPages = Math.ceil(props.data.length / displayPerPage);
        }
    }

    const changeOrder = (newOrderBy) =>{
        
        if(props.bDisableSorting !== undefined){

            if(props.bDisableSorting) return;
        }

        if(orderBy === newOrderBy){
            setbAsc((bAsc) => {return !bAsc});
        }else{
            setOrderBy(newOrderBy);
            setCurrentPage(0);
        }
    }

    const renderHeaders = () =>{

        const headers = [];

        for(const [key, value] of Object.entries(props.headers)){

            const type = typeof value;

            if(type === "string"){

                headers.push(<th className={`pointer`} key={key} onClick={(() =>{
                    changeOrder(key);
                })}>
                    {value}
                </th>);

            }else{

                let title = value.title;

                if(value.detailedTitle !== undefined){
                    title = value.detailedTitle;
                }

                headers.push(<th className={`pointer`} key={key} 
                onClick={(() =>{
                    changeOrder(key);
                })}>
                    <MouseOver title={title} display={value.content}>{value.title}</MouseOver>
                </th>);

            }

        }

        return <tr>{headers}</tr>
    }


    const sortByValue = (a, b) =>{

        a = a[orderBy].value;
        b = b[orderBy].value;

        if(a < b){

            if(bAsc){
                return -1;
            }else{
                return 1;
            }
        }

        if(a > b){
            
            if(bAsc){
                return 1;
            }else{
                return -1;
            }
        }
        
        return 0;
    }

    const renderData = (width, totalPages) =>{

        const rows = [];

        const data = [...props.data];
        
        if(data.length === 0) return <Table2 width={width} noBottomMargin={false}>   
            {renderHeaders()}
            <tr>
                <td colSpan={Object.keys(props.headers).length} className="small-font grey">No Data Found</td>
            </tr>
        </Table2>  

        if(orderBy !== null){

            let bMissingKey = false;

            if(data.length > 0){

                if(data[0][orderBy] === undefined){
                    bMissingKey = true;
                }

                if(!bMissingKey){
                    data.sort(sortByValue);
                }
            }   
        }

        let lastRow = null;

        let start = 0;
        let end = 0;

        if(!bDisplayAll){
            start = currentPage * displayPerPage;
        }

        if(!bDisplayAll){
     
            if(start + displayPerPage < data.length){
                end = start + displayPerPage;
            }else{
                end = data.length;
            }

        }else{
            end = data.length;
        }

        
        
        
        for(let i = start; i < end; i++){

            const d = data[i];

            const columns = [];

            if(d.bAlwaysLast !== undefined){
                lastRow = d;
                continue;
            }

            for(const key of Object.keys(props.headers)){

                let value = null;

                if(d[key].displayValue !== undefined){
                    value = d[key].displayValue;
                }else{
                    value = d[key].value;
                }
                
                if(d[key].url !== undefined){
                    value = <Link href={d[key].url}>{value}</Link>
                }

                if(d[key].className !== undefined){
                    columns.push(<td className={d[key].className} key={`${i}-${key}`}>{value}</td>);
                }else{
                    columns.push(<td key={`${i}-${key}`}>{value}</td>);
                }

                
            }

            rows.push(<tr key={i}>{columns}</tr>);
        }

        if(lastRow !== null){

            const columns = [];

            for(const key of Object.keys(props.headers)){

                let value = "";

                if(lastRow[key].displayValue !== undefined){
                    value = lastRow[key].displayValue;
                }else{
                    value = lastRow[key].value;
                }


                const className = (lastRow[key].className !== undefined) ? lastRow[key].className : "";
                

                columns.push(<td 
                    className={`${styles.totals} ${className}`} 
                    key={`last-${key}`}>
                        {value}
                </td>);
                    
            }

            rows.push(<tr key={"last"}>{columns}</tr>);
        }

        return <Table2 width={width} noBottomMargin={(totalPages > 1) ? true : false}>
            
            {renderHeaders()}
            {rows}
        </Table2>   
    }

    const changePage = (bNext) =>{

        if(bNext){

            if(currentPage + 1 >= totalPages) return;
            setCurrentPage(currentPage => { return currentPage + 1});

        }else{

            if(currentPage - 1 < 0) return;
            setCurrentPage(currentPage => { return currentPage - 1});
        }
       
    }


    const renderPagination = () =>{

        if(totalPages < 2) return null;

        if(bDisplayAll){

            if(!bDisplayAll){
                return null;
            }

            return <div className={`${styles.pagination} t-width-${props.width} center`}>
            <div>
            <div className={styles["p-button"]} onClick={() =>{ setbDisplayAll(false)}}>Display less</div>
            </div>
            </div>
        }

        return <div className={`${styles.pagination} t-width-${props.width} center`}>
            <div>
                <div className={styles["p-button"]} onClick={() =>{ changePage(false)}}>Previous</div>
                <div className={styles["p-info"]}>Display page {currentPage + 1} out of {totalPages}</div>     
                <div className={styles["p-button"]} onClick={() =>{ changePage(true)}}>Next</div>
                <div className={styles["p-alt-button"]} onClick={() =>{ setbDisplayAll(true)}}>Display All</div>
            </div>
        </div>
    }

    let tableTitle = null;

    if(props.title !== undefined){
        tableTitle = <TableHeader width={props.width}>{props.title}</TableHeader>
    }

    return <div className={styles.wrapper}>
        {tableTitle}
        {renderPagination()}
        
        {renderData(props.width, totalPages)}
        
        {renderPagination()}
    </div>
}


export default InteractiveTable;