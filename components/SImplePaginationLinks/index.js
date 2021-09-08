import Link from 'next/link';
import React from 'react';


const SimplePaginationLinks = ({url, page, totalPages, totalResults}) =>{

    if(totalPages < 2) return null;

    let previous = page - 1;
    if(previous < 1) previous = 1;

    let next = page + 1;
    if(next > totalPages){
        next = totalPages;
    }

    return <div className="simple-pagination">
    <Link href={`${url}${previous}`}><a><div>Previous</div></a></Link>
    <div>
        <span className="yellow">Viewing Page {page} of {totalPages}</span><br/>
        Total Results {totalResults}
    </div>
    <Link href={`${url}${next}`}><a><div>Next</div></a></Link>
</div>
}

export default SimplePaginationLinks;