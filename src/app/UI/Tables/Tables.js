export function BasicTable({headers, rows, width, columnStyles}){

    if(headers === undefined) headers = [];
    if(rows === undefined) rows = [];
    if(width === undefined) width = 1;
    if(columnStyles === undefined) columnStyles = [];

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

    return <table className={`basic-table t-width-${width}`}>
        <tbody>
            {(headerElems.length > 0) ? <tr>{headerElems}</tr> : null}
            {rowElems}
        </tbody>
    </table>

}