import styles from './pagination.module.css';
import Link from 'next/link';


const PageButton = ({url, page, anchor, current}) =>{

    let currentClass = styles.button;

    if(current !== undefined){
        currentClass = styles.abutton;

    }

    return (
        <Link href={`${url}${page}${anchor}`}>
            <a>
                <div className={`${currentClass}`}>
                    {page}
                </div>
            </a>
        </Link>
    );
}

const Pagination = ({currentPage, results, pages, perPage, url, anchor}) =>{

    currentPage = parseInt(currentPage);
    pages = parseInt(pages);
    //console.log(currentPage);
    //console.log(pages);
    const elems = [];
    
    if(currentPage !== 1){
        elems.push(
            <PageButton url={url} page={1} anchor={anchor}/>
        );
    }else{
        elems.push(
            <PageButton url={url} page={1} current={1} anchor={anchor}/>
        );
    }


    if(currentPage - 1 > 1){
        elems.push(
            <PageButton url={url} page={currentPage - 1} anchor={anchor}/>
        );
    }


    if(currentPage > 1 && currentPage !== pages){
        elems.push(
            <PageButton url={url} page={currentPage} current={1} anchor={anchor}/>
        );
    }

    if(currentPage + 1 < pages){
        elems.push(
            <PageButton url={url} page={currentPage + 1} anchor={anchor}/>
        );
    }

    if(pages > 1){
        if(currentPage !== pages){
            elems.push(
                <PageButton url={url} page={pages} anchor={anchor}/>
            );
        }else{
            elems.push(
                <PageButton url={url} page={pages} current={1} anchor={anchor}/>
            );
        }
    }

    return (<div className={styles.wrapper}>

        <div className={styles.header}>
            Showing Page {currentPage} of {pages}
        </div>
        <div className={styles.result}>
            Showing results {(currentPage === 1) ? 1 : (currentPage - 1) * perPage} to {(currentPage !== pages ) ? currentPage * perPage : results} out of a possible {results}
        </div>
        {elems}
    </div>);
}


export default Pagination;