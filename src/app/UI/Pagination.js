import styles from "./Pagination.module.css";
import Link from "next/link";

function Button({url, targetPage, currentPage}){
    //HIGHLIGHT BUTTONS HERE 

    //check if targetPage === current page and highlight if true

    return <Link key={targetPage} href={`${url}${targetPage}`}>
        <div className={styles.button}>{targetPage}</div>
    </Link>
}

export default function Pagination({url, results, currentPage, perPage}){

    results = parseInt(results);
    if(results !== results) results = 0;

    if(results === 0) return null;

    currentPage = parseInt(currentPage);
    if(currentPage !== currentPage) currentPage = 1;

    perPage = parseInt(perPage);
    if(perPage !== perPage) perPage = 25;
    if(perPage < 1) perPage = 1;

    let totalPages = Math.floor(results / perPage);

    const nextPage = currentPage + 1;
    const previousPage = currentPage - 1;


    const buttons = [];

    if(totalPages > 0){
        buttons.push(<Link key={"1"} href={`${url}1`}>
            <div className={styles.button}>1</div>
        </Link>);   
    }

    if(previousPage > 1){

        buttons.push(<Link key={"prev"} href={`${url}${previousPage}`}>
            <div className={styles.button}>{previousPage}</div>
        </Link>);  
    }

    if(currentPage > 1 && currentPage <= totalPages){
        buttons.push(<div key="current" className={`${styles.button} ${styles.active}`}>{currentPage}</div>);
    }

    if(nextPage < totalPages){

        buttons.push(<Link key={"next"} href={`${url}${nextPage}`}>
            <div className={styles.button}>{nextPage}</div>
        </Link>);  
    }

    if(totalPages > 1 && nextPage <= totalPages){
        buttons.push(<Link key={"last"} href={`${url}${totalPages}`}>
            <div className={styles.button}>{totalPages}</div>
        </Link>);  
    }

    return <div className={styles.wrapper}>

        Displaying page {currentPage} out of {totalPages}<br/>
        {buttons}

    </div>
}