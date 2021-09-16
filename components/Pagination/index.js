import styles from './Pagination.module.css';
import Link from 'next/link';


const PageButton = ({url, page, anchor, current}) =>{

    let currentClass = styles.button;

    if(anchor === undefined){
        anchor = '';
    }

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

const Pagination = ({currentPage, results, perPage, url, anchor}) =>{

    currentPage = parseInt(currentPage);

    let pages = Math.ceil(results / perPage);

    if(pages !== pages) pages = 1;

    if(pages <= 1) return null;

    const elems = [];
    
    if(currentPage !== 1){
        elems.push(
            <PageButton key={`pagination_1`} url={url} page={1} anchor={anchor}/>
        );
    }else{
        elems.push(
            <PageButton key={`pagination_1`} url={url} page={1} current={1} anchor={anchor}/>
        );
    }


    if(currentPage - 1 > 1){
        elems.push(
            <PageButton key={`pagination_${currentPage - 1}`} url={url} page={currentPage - 1} anchor={anchor}/>
        );
    }


    if(currentPage > 1 && currentPage !== pages){
        elems.push(
            <PageButton key={`pagination_${currentPage}`} url={url} page={currentPage} current={1} anchor={anchor}/>
        );
    }

    if(currentPage + 1 < pages){
        elems.push(
            <PageButton url={url} key={`pagination_${currentPage + 1}`} page={currentPage + 1} anchor={anchor}/>
        );
    }

    if(pages > 1){
        if(currentPage !== pages){
            elems.push(
                <PageButton url={url} key={`pagination_${pages}`} page={pages} anchor={anchor}/>
            );
        }else{
            elems.push(
                <PageButton url={url} key={`pagination_${pages}`} page={pages} current={1} anchor={anchor}/>
            );
        }
    }

    if(results === 0){
        return (<div className={styles.wrapper}>
        </div>);
    }

    return (<div className={styles.wrapper}>

        <div className={styles.header}>
            Displaying Page {currentPage} of {pages}
        </div>
        <div className={styles.result}>
            Displaying results {(currentPage === 1) ? 1 : 1 + ((currentPage - 1) * perPage)} to {(currentPage !== pages ) ? currentPage * perPage : results} out of {results}
        </div>
        {elems}
    </div>);
}


export default Pagination;