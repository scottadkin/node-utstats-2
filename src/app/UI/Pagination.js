import styles from "./Pagination.module.css";
import Link from "next/link";

function Button({url, targetPage, currentPage}){
    //HIGHLIGHT BUTTONS HERE 

    //check if targetPage === current page and highlight if true

    let className = styles.button;

    if(targetPage === currentPage){
        className = `${styles.button} ${styles.active}`;
    }

    return <Link key={targetPage} href={`${url}${targetPage}`}>
        <div className={className}>{targetPage}</div>
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

    let totalPages = Math.ceil(results / perPage);

    const nextPage = currentPage + 1;
    const previousPage = currentPage - 1;

    let start = perPage * (currentPage - 1) + 1;
    let end = (start + perPage > results) ? results : start + perPage - 1;

    const buttons = [];

    if(totalPages > 0){
        buttons.push(<Button key="1" url={url} targetPage={1} currentPage={currentPage}/>);
    }

    if(previousPage > 1){
        buttons.push(<Button key="prev" url={url} targetPage={previousPage} currentPage={currentPage}/>);
    }

    if(currentPage > 1 && currentPage <= totalPages){
        buttons.push(<Button key="current" url={url} targetPage={currentPage} currentPage={currentPage}/>);
    }

    if(nextPage < totalPages){
        buttons.push(<Button key="current" url={url} targetPage={nextPage} currentPage={currentPage}/>);
    }

    if(totalPages > 1 && nextPage <= totalPages){
        buttons.push(<Button key="last" url={url} targetPage={totalPages} currentPage={currentPage}/>);
    }

    return <div className={styles.wrapper}>

        <div className={styles.info}>
            Displaying page {currentPage} out of {totalPages}<br/>
            Results {start} to {end}<br/>
            Total Results {results}
        </div>
        {buttons}

    </div>
}