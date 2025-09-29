"use client"
import { removeUnr, firstCharToUpperCase } from "../../../../api/generic.mjs"
import { useRouter } from "next/navigation"



export default function SearchForm({validOptions, name, page, order, perPage, sort, display}){

    const router = useRouter();

    return <div className="form">
        <div className="form-row">
            <label htmlFor="name">Name</label>
            <input type="text" name="name" defaultValue={name} className="default-textbox" placeholder="Map name..." onChange={(e) =>{
                router.push(`/maps?name=${e.target.value}&sort=${sort}&order=${order}&display=${display}&perPage=${perPage}`);
            }}/>
        </div>
        <div className="form-row">
            <label htmlFor="sort">Sort By</label>
            <select name="sort" defaultValue={sort} className="default-select" onChange={(e) =>{
                router.push(`/maps?name=${name}&sort=${e.target.value}&order=${order}&display=${display}&perPage=${perPage}`);
            }}>
                {validOptions.map((v) =>{
                    let display = v;
                    if(v === "last" || v === "first") display = `${v} Match Played`
                    return <option key={v} value={v}>{firstCharToUpperCase(v)}</option>
                })}
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="order">Order</label>
            <select name="order" defaultValue={order} className="default-select" onChange={(e) =>{
                router.push(`/maps?name=${name}&sort=${sort}&order=${e.target.value}&display=${display}&perPage=${perPage}`);
            }}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="display">Display</label>
            <select name="display" defaultValue={display} className="default-select"  onChange={(e) =>{
                router.push(`/maps?name=${name}&sort=${sort}&order=${order}&display=${e.target.value}&perPage=${perPage}`);
            }}>
                <option value="normal">Normal View</option>
                <option value="table">Table View</option>
            </select>
        </div>
        <div className="form-row">
            <label htmlFor="pp">Results Per Page</label>
            <select name="pp" defaultValue={perPage} className="default-select" onChange={(e) =>{
                router.push(`/maps?name=${name}&sort=${sort}&order=${order}&display=${display}&perPage=${e.target.value}`);
            }}>
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </div>
    </div>
}