export function BasicTable({headers, rows, width, columnStyles, title}){

    if(headers === undefined) headers = [];
    if(rows === undefined) rows = [];
    if(width === undefined) width = 1;
    if(columnStyles === undefined) columnStyles = [];
    if(title === undefined) title = "";

    const headerElems = [];

    for(let i = 0; i < headers.length; i++){

        headerElems.push(<th key={`h-${i}`}>
            {headers[i]}
        </th>);
    }

    const rowElems = [];

    for(let i = 0; i < rows.length; i++){

        const currentRow = [];

        for(let x = 0; x < rows[i].length; x++){

            const style = (columnStyles[x] != undefined) ? columnStyles[x] : "";

            currentRow.push(<td className={style} key={`d-${i}-${x}`}>{rows[i][x]}</td>);
        }

        rowElems.push(<tr key={`r-${i}`}>{currentRow}</tr>);
    }

    if(rowElems.length === 0){
        rowElems.push(<tr key="none"><td colSpan={headers.length}>No Data</td></tr>);
    }

    const titleElem = (title === "") ? null : <div className={`table-title t-width-${width} center`}>{title}</div>;

    return <>
        {titleElem}
        <table className={`basic-table t-width-${width}`}>
            <tbody>
                {(headerElems.length > 0) ? <tr>{headerElems}</tr> : null}
                {rowElems}
            </tbody>
        </table>
    </>

}