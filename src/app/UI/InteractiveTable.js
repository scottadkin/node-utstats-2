"use client"

function createHeaders(headers){

    const elems = [];

    for(let i = 0; i < headers.length; i++){

        const h = headers[i];

        elems.push(<th key={i}>{h.title}</th>);
    }

    for(const [name, content] of Object.entries(headers)){
        elems.push(<th key={name}>{content.title}</th>);
    }

    return <tr>{elems}</tr>;
}

function createRows(headers, rows){

    const elems = [];

    for(let i = 0; i < rows.length; i++){

        const r = rows[i];

        const columns = [];

        for(const name of Object.keys(headers)){

            columns.push(<td key={name}>
                {r[name]?.displayValue ?? r[name]?.value}
            </td>);
            
        }

        elems.push(<tr key={i}>{columns}</tr>);
    }

    

    return elems;
}

export default function InteractiveTable({headers, rows}){

    return <>
        <table>
            <tbody>
                {createHeaders(headers)}
                {createRows(headers, rows)}
            </tbody>
        </table>
    </>
}