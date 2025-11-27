export default function TablePagination({width, next, previous}){
    
    if(width === undefined) width = 1;

    return <div className={`center t-width-${width} table-pagination`}>
        <button className="button" onClick={previous}>Previous</button>
        <button className="button" onClick={next}>Next</button>
    </div>
}