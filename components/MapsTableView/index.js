import CustomTable from "../CustomTable";
import { removeUnr, convertTimestamp, toPlaytime } from '../../api/generic.mjs';

const MapsDefaultView = ({data, dispatch}) =>{

    const headers = {
        "name": {
            "display": "Name",
            "mouseOver": {
                "title": "test title",
                "content": "This is some content"
            },
            "onClick": () =>{
                dispatch({"type": "changeSortBy", "value": "name"});
            }
        },
        "first": {
            "display": "First",
            "mouseOver": {
                "title": "First Match Date",
                "content": "The date of the first match played for this map."
            },
            "onClick": () =>{
                dispatch({"type": "changeSortBy", "value": "first"});
            }
        },
        "last": {
            "display": "Last",
            "mouseOver": {
                "title": "Last Match Date",
                "content": "The date of the most recent match played for this map."
            },
            "onClick": () =>{
                dispatch({"type": "changeSortBy", "value": "last"});
            }
        },
        "playtime": {
            "display": "Playtime",
            "onClick": () =>{
                dispatch({"type": "changeSortBy", "value": "playtime"});
            }
        },
        "matches": {
            "display": "Matches",
            "onClick": () =>{
                dispatch({"type": "changeSortBy", "value": "matches"});
            }
        }
    };

    const elems = data.map((d) =>{

        return {
            "name": {
                "value": d.name.toLowerCase(), 
                "displayValue": removeUnr(d.name), 
                "className": "text-left",
                "url": `/map/${d.id}`
            },
            /*"author": {
                "value": map.author.toLowerCase(),
                "displayValue": map.author
            }*/
            "first": {
                "value": d.first,
                "displayValue": convertTimestamp(d.first, true),
                "className": "playtime"
            },
            "last": {
                "value": d.last,
                "displayValue": convertTimestamp(d.last, true),
                "className": "playtime"
            },
            "playtime": {
                "value": d.playtime,
                "displayValue": toPlaytime(d.playtime),
                "className": "playtime"
            },
            "matches": {
                "value": d.matches
            },
        }
    });

   return  <CustomTable headers={headers} data={elems}/>

}


export default MapsDefaultView;