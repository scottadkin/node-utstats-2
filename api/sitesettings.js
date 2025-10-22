import { simpleQuery } from "./database.js";

export const DEFAULT_PAGE_SETTINGS = {
    "Home": [
		{"name":"Display Latest Match","value":"true","valueType":"bool","pageOrder":0,"moveable":1},
		{"name":"Display Addicted Players","value":"true","valueType":"bool","pageOrder":1,"moveable":1},
		{"name":"Display Recent Matches","value":"true","valueType":"bool","pageOrder":2,"moveable":1},
		{"name":"Display Recent Matches & Player Stats","value":"true","valueType":"bool","pageOrder":3,"moveable":1},
		{"name":"Display Recent Players","value":"true","valueType":"bool","pageOrder":4,"moveable":1},
		{"name":"Display Most Popular Countries","value":"true","valueType":"bool","pageOrder":5,"moveable":1},
		{"name":"Display Most Played Maps","value":"true","valueType":"bool","pageOrder":6,"moveable":1},
		{"name":"Display Most Used Faces","value":"true","valueType":"bool","pageOrder":7,"moveable":1},
		{"name":"Display Most Played Gametypes","value":"true","valueType":"bool","pageOrder":8,"moveable":1},
		{"name":"Recent Matches Display Type","value":"default","valueType":"selection","pageOrder":9,"moveable":0},
		{"name":"Recent Matches To Display","value":"3","valueType":"int","pageOrder":10,"moveable":0},
		{"name":"Popular Countries Display Type","value":"default","valueType":"selection","pageOrder":999999,"moveable":0},
		{"name":"Popular Countries Display Limit","value":"5","valueType":"int","pageOrder":999999,"moveable":0},
    ],
    "Map Pages": [
            {"name":"Recent Matches Per Page","value":"25","valueType":"perpage","pageOrder":0,"moveable":0},
            {"name":"Max Longest Matches","value":"5","valueType":"int","pageOrder":1,"moveable":0},
            {"name":"Max Addicted Players","value":"5","valueType":"int","pageOrder":2,"moveable":0},
            {"name":"Display Summary","value":"true","valueType":"bool","pageOrder":3,"moveable":1},
            {"name":"Display Games Played","value":"true","valueType":"bool","pageOrder":4,"moveable":1},
            {"name":"Display Recent Matches","value":"true","valueType":"bool","pageOrder":5,"moveable":1},
            {"name":"Display CTF Caps","value":"true","valueType":"bool","pageOrder":6,"moveable":1},
            {"name":"Display Map Objectives (Assault)","value":"true","valueType":"bool","pageOrder":7,"moveable":1},
            {"name":"Display Control Points (Domination)","value":"true","valueType":"bool","pageOrder":8,"moveable":1},
            {"name":"Display Combogib General Stats","value":"true","valueType":"bool","pageOrder":9,"moveable":1},
            {"name":"Display Combogib Player Records","value":"true","valueType":"bool","pageOrder":10,"moveable":1},
            {"name":"Display Addicted Players","value":"true","valueType":"bool","pageOrder":11,"moveable":1},
            {"name":"Display Longest Matches","value":"true","valueType":"bool","pageOrder":12,"moveable":1},
            {"name":"Display Spawn Points","value":"true","valueType":"bool","pageOrder":13,"moveable":1},
    ],
    "Maps Page": [
            {"name":"Default Display Per Page","value":"25","valueType":"perpage","pageOrder":0,"moveable":0},
            {"name":"Default Display Type","value":"default","valueType":"selection","pageOrder":0,"moveable":0},
            {"name":"Default Sort By","value":"name","valueType":"selection","pageOrder":0,"moveable":0},
            {"name":"Default Order","value":"asc","valueType":"order","pageOrder":0,"moveable":0},
    ],
    "Match Pages": [
            {"name":"Display Match Report Title","value":"true","valueType":"bool","pageOrder":0,"moveable":0},
            {"name":"Display Summary","value":"true","valueType":"bool","pageOrder":1,"moveable":1},
            {"name":"Display Screenshot","value":"true","valueType":"bool","pageOrder":2,"moveable":1},
            {"name":"Display Domination Summary","value":"true","valueType":"bool","pageOrder":3,"moveable":1},
            {"name":"Display Domination Graphs","value":"true","valueType":"bool","pageOrder":4,"moveable":1},
            {"name":"Display Assault Summary","value":"true","valueType":"bool","pageOrder":5,"moveable":1},
            {"name":"Display Capture The Flag Summary","value":"true","valueType":"bool","pageOrder":6,"moveable":1},
            {"name":"Display Capture The Flag Graphs","value":"true","valueType":"bool","pageOrder":7,"moveable":1},
            {"name":"Display Capture The Flag Times","value":"true","valueType":"bool","pageOrder":8,"moveable":1},
            {"name":"Display Capture The Flag Caps","value":"true","valueType":"bool","pageOrder":9,"moveable":1},
            {"name":"Display Capture The Flag Returns","value":"true","valueType":"bool","pageOrder":10,"moveable":1},
            {"name":"Display Capture The Flag Carry Times","value":"true","valueType":"bool","pageOrder":11,"moveable":1},
            {"name":"Display MonsterHunt Kills","value":"true","valueType":"bool","pageOrder":12,"moveable":1},
            {"name":"Display Frag Summary","value":"true","valueType":"bool","pageOrder":13,"moveable":1},
            {"name":"Display Frags Graphs","value":"true","valueType":"bool","pageOrder":14,"moveable":1},
            {"name":"Display Combogib Stats","value":"true","valueType":"bool","pageOrder":15,"moveable":1},
            {"name":"Display Special Events","value":"true","valueType":"bool","pageOrder":16,"moveable":1},
            {"name":"Display Extended Sprees","value":"true","valueType":"bool","pageOrder":17,"moveable":1},
            {"name":"Display Telefrag Stats","value":"true","valueType":"bool","pageOrder":18,"moveable":1},
            {"name":"Display Rankings","value":"true","valueType":"bool","pageOrder":19,"moveable":1},
            {"name":"Display Ammo Control","value":"true","valueType":"bool","pageOrder":20,"moveable":1},
            {"name":"Display Health/Armour Control","value":"true","valueType":"bool","pageOrder":21,"moveable":1},
            {"name":"Display Weapons Control","value":"true","valueType":"bool","pageOrder":22,"moveable":1},
            {"name":"Display Powerup Control","value":"true","valueType":"bool","pageOrder":23,"moveable":1},
            {"name":"Display Items Summary","value":"true","valueType":"bool","pageOrder":24,"moveable":1},
            {"name":"Display Pickup Summary","value":"true","valueType":"bool","pageOrder":25,"moveable":1},
            {"name":"Display Kills Match Up","value":"true","valueType":"bool","pageOrder":26,"moveable":1},
            {"name":"Display Weapon Statistics","value":"true","valueType":"bool","pageOrder":27,"moveable":1},
            {"name":"Display Player Ping Graph","value":"true","valueType":"bool","pageOrder":28,"moveable":1},
            {"name":"Display Players Connected to Server Graph","value":"true","valueType":"bool","pageOrder":29,"moveable":1},
            {"name":"Display Player Score Graph","value":"true","valueType":"bool","pageOrder":30,"moveable":1},
            {"name":"Display Team Changes","value":"true","valueType":"bool","pageOrder":31,"moveable":1},
            {"name":"Display Time Limit","value":"true","valueType":"bool","pageOrder":32,"moveable":0},
            {"name":"Display Server Settings","value":"true","valueType":"bool","pageOrder":33,"moveable":1},
            {"name":"Display Target Score","value":"true","valueType":"bool","pageOrder":34,"moveable":0},
            {"name":"Display Mutators","value":"true","valueType":"bool","pageOrder":35,"moveable":0},
    ],
    "Matches Page": [
            {"name":"Default Display Per Page","value":"25","valueType":"perpage","pageOrder":0,"moveable":0},
            {"name":"Default Display Type","value":"default","valueType":"selection","pageOrder":0,"moveable":0},
            {"name":"Default Gametype","value":"0","valueType":"selection","pageOrder":0,"moveable":0},
            {"name":"Default Sort By","value":"date","valueType":"selection","pageOrder":0,"moveable":0},
            {"name":"Default Order","value":"asc","valueType":"selection","pageOrder":0,"moveable":0},
            {"name":"Minimum Players","value":"0","valueType":"int","pageOrder":0,"moveable":0},
            {"name":"Minimum Playtime","value":"0","valueType":"int","pageOrder":0,"moveable":0},
    ],
    "Navigation": [
            {"name":"Display Home","value":"true","valueType":"bool","pageOrder":0,"moveable":1},
            {"name":"Display Servers","value":"true","valueType":"bool","pageOrder":1,"moveable":1},
            {"name":"Display Matches","value":"true","valueType":"bool","pageOrder":2,"moveable":1},
            {"name":"Display Players","value":"true","valueType":"bool","pageOrder":3,"moveable":1},
            {"name":"Display Rankings","value":"true","valueType":"bool","pageOrder":4,"moveable":1},
            {"name":"Display Records","value":"true","valueType":"bool","pageOrder":5,"moveable":1},
            {"name":"Display Maps","value":"true","valueType":"bool","pageOrder":6,"moveable":1},
            {"name":"Display ACE","value":"true","valueType":"bool","pageOrder":7,"moveable":1},
            {"name":"Display Admin","value":"true","valueType":"bool","pageOrder":8,"moveable":1},
            {"name":"Display Login/Logout","value":"true","valueType":"bool","pageOrder":9,"moveable":1},
    ],
    "Player Pages": [
            {"name":"Display Summary","value":"true","valueType":"bool","pageOrder":0,"moveable":1},
            {"name":"Display Win Rates","value":"true","valueType":"bool","pageOrder":1,"moveable":1},
            {"name":"Display Gametype Stats","value":"true","valueType":"bool","pageOrder":2,"moveable":1},
            {"name":"Display Map Stats","value":"true","valueType":"bool","pageOrder":3,"moveable":1},
            {"name":"Display Frag Summary","value":"true","valueType":"bool","pageOrder":4,"moveable":1},
            {"name":"Display Monsterhunt Basic Stats","value":"true","valueType":"bool","pageOrder":5,"moveable":1},
            {"name":"Display Monsterhunt Monster Stats","value":"true","valueType":"bool","pageOrder":6,"moveable":1},
            {"name":"Display Capture The Flag Summary","value":"true","valueType":"bool","pageOrder":7,"moveable":1},
            {"name":"Display Assault & Domination","value":"true","valueType":"bool","pageOrder":8,"moveable":1},
            {"name":"Display Capture The Flag Cap Records","value":"true","valueType":"bool","pageOrder":9,"moveable":1},
            {"name":"Display Combogib Stats","value":"true","valueType":"bool","pageOrder":10,"moveable":1},
            {"name":"Display Special Events","value":"true","valueType":"bool","pageOrder":11,"moveable":1},
            {"name":"Display Telefrag Stats","value":"true","valueType":"bool","pageOrder":12,"moveable":1},
            {"name":"Display Rankings","value":"true","valueType":"bool","pageOrder":13,"moveable":1},
            {"name":"Display Pickup History","value":"true","valueType":"bool","pageOrder":14,"moveable":1},
            {"name":"Display Weapon Stats","value":"true","valueType":"bool","pageOrder":15,"moveable":1},
            {"name":"Display Items Summary","value":"true","valueType":"bool","pageOrder":16,"moveable":1},
            {"name":"Display Aliases","value":"true","valueType":"bool","pageOrder":17,"moveable":1},
            {"name":"Recent Matches Per Page","value":"25","valueType":"perpage","pageOrder":18,"moveable":0},
            {"name":"Display Ping History Graph","value":"true","valueType":"bool","pageOrder":18,"moveable":1},
            {"name":"Display Recent Activity Graph","value":"true","valueType":"bool","pageOrder":19,"moveable":1},
            {"name":"Default Weapon Display","value":"default","valueType":"selection","pageOrder":20,"moveable":0},
            {"name":"Display Recent Matches","value":"true","valueType":"bool","pageOrder":20,"moveable":1},
            {"name":"Default Recent Matches Display","value":"table","valueType":"selection","pageOrder":21,"moveable":0},
    ],
    "Players Page": [
            {"name":"Default Display Per Page","value":"25","valueType":"perpage","pageOrder":0,"moveable":0},
            {"name":"Default Display Type","value":"default","valueType":"selection","pageOrder":0,"moveable":0},
            {"name":"Default Order","value":"ASC","valueType":"order","pageOrder":0,"moveable":0},
            {"name":"Default Sort By","value":"name","valueType":"selection","pageOrder":0,"moveable":0},
            {"name":"Default Last Active Range","value":"0","valueType":"selection","pageOrder":0,"moveable":0},
    ],
    "Rankings": [
            {"name":"Rankings Per Gametype (Main)","value":"10","valueType":"perpage","pageOrder":0,"moveable":0},
            {"name":"Rankings Per Page (Individual)","value":"100","valueType":"perpage","pageOrder":0,"moveable":0},
            {"name":"Default Min Playtime","value":"0","valueType":"selection","pageOrder":0,"moveable":0},
            {"name":"Default Last Active","value":"90","valueType":"selection","pageOrder":0,"moveable":0},
    ],
    "Records Page": [
            {"name":"Display Player Records","value":"true","valueType":"bool","pageOrder":0,"moveable":1},
            {"name":"Display Match Records","value":"true","valueType":"bool","pageOrder":0,"moveable":1},
            {"name":"Display CTF Cap Records","value":"true","valueType":"bool","pageOrder":0,"moveable":1},
            {"name":"Display Combogib Records","value":"true","valueType":"bool","pageOrder":0,"moveable":1},
            {"name":"Default Per Page","value":"100","valueType":"perpage","pageOrder":0,"moveable":0},
    ],
    "Servers Page": [
            {"name":"Default Display Type","value":"default","valueType":"selection","pageOrder":0,"moveable":0},
    ],
};

export async function getSettings(cat){

    const query = "SELECT name,value FROM nstats_site_settings WHERE category=?";

    const result = await simpleQuery(query, [cat]);

    const settings = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        settings[r.name] = r.value;
    }
    

    return settings;
}


export async function getNavSettings(){

    const query = "SELECT name,value FROM nstats_site_settings WHERE category=?";

    const result = await simpleQuery(query, ["Navigation"]);

    const settings = {};

    for(let i = 0; i < result.length; i++){

        const r = result[i];

        settings[r.name] = r.value;
    }

    const order = await getPageOrder("Navigation");

    return {"settings": settings, "order": order};    
}

export async function getPageOrder(cat){
    
    const query = `SELECT name,page_order FROM nstats_site_settings WHERE category=? AND (value='true' OR value='false')`;

    const result = await simpleQuery(query, [cat]);

    const data = {};

    for(let i = 0; i < result.length; i++){

        const {name, page_order} = result[i];
        data[name] = parseInt(page_order);
    }

    return data;
}

export function bPageComponentEnabled(settings, targetKey){

    if(settings[targetKey] === undefined) return false;

    if(settings[targetKey] === "true") return true;

    return false;
}

export function getPageOrderIndex(pageOrder, targetKey){

    if(pageOrder[targetKey] === undefined){
        throw new Error(`getPageOrderIndex pageOrder[${targetKey}] does not exist`);
       // return 9999;
    }

    const index = parseInt(pageOrder[targetKey]);
    if(index !== index) throw new Error(`getPageOrderIndex pageOrder must be a valid integer`);

    return index;
}


/**
 * If the component on a page is enabled and has a valid index add it to the elems array
 */
export function addComponentToElems(pageSettings, pageOrder, targetKey, elems, elem){

    if(!bPageComponentEnabled(pageSettings, targetKey)) return;

    const index = getPageOrderIndex(pageOrder, targetKey);

    elems[index] = elem;
}

export class PageComponentManager{

    constructor(pageSettings, pageOrder, elems){

        this.pageSettings = pageSettings;
        this.pageOrder = pageOrder;
        this.elems = elems;
    }

    addComponent(targetKey, elem){

        if(!bPageComponentEnabled(this.pageSettings, targetKey)) return;

        const index = getPageOrderIndex(this.pageOrder, targetKey);

        this.elems[index] = elem;
    }

    bEnabled(targetKey){
        return bPageComponentEnabled(this.pageSettings, targetKey);
    }

}