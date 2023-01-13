import {React, useState, useEffect} from "react";
import Table2 from "../Table2";
import styles from "./InteractiveTable.module.css";
import Link from "next/link";
import TableHeader from "../TableHeader";
import MouseOver from "../MouseOver";


const InteractiveTable = (props) =>{

    const [orderBy, setOrderBy] = useState(null);
    const [bAsc, setbAsc] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [displayPerPage, setDisplayPerPage] = useState(5);


    useEffect(() =>{

        console.log("render");

        console.log(props.data.length);

        let newTotalPages = 0;


        if(props.data.length > 0 && displayPerPage > 0){
            newTotalPages = Math.ceil(props.data.length / displayPerPage);
        }
        
        setTotalPages(newTotalPages);
        console.log(`new total pages = ${newTotalPages} (${props.data.length} / ${displayPerPage})`);


    }, [props.headers, props.data]);


    const changeOrder = (newOrderBy) =>{
        
        
        if(orderBy === newOrderBy){

            const newOrdering = !bAsc;
            setbAsc(newOrdering);
            console.log("chnage asc");
        }else{
            console.log("change order");
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

    const renderData = () =>{

        const rows = [];

        const data = [...props.data];

        if(orderBy !== null){

            data.sort((a, b) =>{

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
            });
        }

        let lastRow = null;

        const start = currentPage * displayPerPage;
        let end = data.length;

        if(start + displayPerPage < data.length){
            end = start + displayPerPage;
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

                let value = lastRow[key].value;

                columns.push(<td className={styles.totals} key={`last-${key}`}>{value}</td>);
                    
            }

            rows.push(<tr key={"last"}>{columns}</tr>);
        }

        return rows;     
    }

    const changePage = (bNext) =>{

        if(bNext){

            if(currentPage + 1 >= totalPages) return;

            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);

        }else{

            if(currentPage - 1 < 0) return;

            const previousPage = currentPage - 1;
            setCurrentPage(previousPage);
        }
       
    }

    let tableTitle = null;

    if(props.title !== undefined){
        tableTitle = <TableHeader width={props.width}>{props.title}</TableHeader>
    }

    return <div className={styles.wrapper}>
        {tableTitle}
        <div>
            Display page {currentPage + 1} out of {totalPages}
        </div>
        <span onClick={() =>{ changePage(false)}}>Previous</span>
        <span onClick={() =>{ changePage(true)}}>Next</span>
        <Table2 width={props.width}>
            {renderHeaders()}
            {renderData()}
        </Table2>  
    </div>
}


export default InteractiveTable;