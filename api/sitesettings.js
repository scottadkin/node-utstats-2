import { simpleQuery } from "./database.js";
import Gametypes from "./gametypes.js";
import Message from "./message.js";

export default class SiteSettings{

    constructor(){

        this.defaultPerPageValues = [
            {"name": 5, "value": 5},
            {"name": 10, "value": 10},
            {"name": 25, "value": 25},
            {"name": 50, "value": 50},
            {"name": 75, "value": 75},
            {"name": 100, "value": 100}
        ]

        this.defaultDiplayTypes = [
            {"name": "Default", "value": 0},
            {"name": "Table", "value": 1}
        ];


        this.genericNumberRange = [
            {"name": "1", "value": 1},
            {"name": "2", "value": 2},
            {"name": "3", "value": 3},
            {"name": "4", "value": 4},
            {"name": "5", "value": 5},
            {"name": "10", "value": 10},
            {"name": "15", "value": 15},
            {"name": "20", "value": 20},
            {"name": "25", "value": 25}
        ]
    }


    async debugGetAllSettings(){

        const query = "SELECT * FROM nstats_site_settings ORDER BY category ASC, name ASC";
        return await simpleQuery(query);

    }


    async updateSetting(category, name, value){


        const query = "UPDATE nstats_site_settings SET value=? WHERE category=? AND name=?";

        return await simpleQuery(query, [value, category, name]);
    }

    async updateSettings(data, category){

        try{

            let d = 0;
            

            for(let i = 0; i < data.length; i++){

                d = data[i];

                console.log(`update ${category}.${d.name} to ${d.value}`);

                await this.updateSetting(category, d.name, d.value);
            }

            return true;

        }catch(err){
            console.trace(err);
            return false;
        }
    }

    getPlayersPageValidSettings(){

        return {
            "Default Sort Type": [
                {"name": "Name", "value": "name"},
                {"name": "Country", "value": "country"},
                {"name": "Matches", "value": "matches"},
                {"name": "Score", "value": "score"},
                {"name": "Kills", "value": "kills"},
                {"name": "Deaths", "value": "deaths"},
                {"name": "First", "value": "first"},
                {"name": "Last", "value": "last"},
            ],
            "Default Order": [
                {"name": "Ascending", "value": "ASC"},
                {"name": "Descending", "value": "DESC"},
            ],
            "Default Display Per Page": 
                this.defaultPerPageValues,
            "Default Display Type": this.defaultDiplayTypes
        };
    }

    getHomePageValidSettings(){

        return {
            "Recent Matches Display Type": this.defaultDiplayTypes,
            "Popular Countries Display Type": this.defaultDiplayTypes,
            "Popular Countries Display Limit": this.genericNumberRange,
            "Recent Matches To Display": this.genericNumberRange
        };
    }

    getRecordsPageValidSettings(){

        return {
            "Default Per Page": this.defaultPerPageValues,
            "Default Record Type": [
                {"name": "Player", "value": "0"},
                {"name": "Match", "value": "1"},
            ],
            "Maximum Assisted Caps To Display": this.defaultPerPageValues,
            "Maximum Solo Caps To Display": this.defaultPerPageValues,
            "Minimum Assisted Caps Before Displayed": this.genericNumberRange,
            "Minimum Solo Caps Before Displayed": this.genericNumberRange,
        }
    }


    getRankingsValidSettings(){

        return {
            "Rankings Per Gametype (Main)": this.defaultPerPageValues,
            "Rankings Per Page (Individual)": this.defaultPerPageValues,
            "Default Min Playtime": [
                {"name": "No Limit", "value": "0"},
                {"name": "1 Hour", "value": "1"},
                {"name": "2 Hours", "value": "2"},
                {"name": "3 Hours", "value": "3"},
                {"name": "6 Hours", "value": "6"},
                {"name": "12 Hours", "value": "12"},
                {"name": "24 Hours", "value": "24"},
                {"name": "48 Hours", "value": "48"},
            ],
            "Default Last Active": [
                {"name": "No Limit", "value": "0"},
                {"name": "1 Day", "value": "1"},
                {"name": "7 Days", "value": "7"},
                {"name": "28 Days", "value": "28"},
                {"name": "90 Days", "value": "90"},
                {"name": "365 Days", "value": "365"},
            ]
        }
    }

    getMapsPageValidSettings(){

        return {
            "Default Display Per Page": this.defaultPerPageValues,
            "Default Display Type": this.defaultDiplayTypes
        }
    }

    getPlayerPagesValidSettings(){

        return {
            "Default Recent Matches Display": this.defaultDiplayTypes,
            "Default Weapon Display": this.defaultDiplayTypes,
            "Recent Matches Per Page": this.defaultPerPageValues
        };
    }

    getMapPagesValidSettings(){

        return {
            "Max Addicted Players": this.defaultPerPageValues,
            "Max Longest Matches": this.defaultPerPageValues,
            "Recent Matches Per Page": this.defaultPerPageValues
        }
    }

    getServersPageValidSettings(){

        return {
            "Default Display Type": this.defaultDiplayTypes
        }
    }

    async getValidSettings(category){

        if(category === "Home"){
            return this.getHomePageValidSettings();
        }else if(category === "Map Pages"){
            return this.getMapPagesValidSettings();
        }else if(category === "Maps Page"){
            return this.getMapsPageValidSettings();
        }else if(category === "Match Pages"){
            return {};
        }else if(category === "Matches Page"){
            return await this.getMatchesPageValidSettings();
        }else if(category === "Navigation"){
            return {};
        }else if(category === "Player Pages"){
            return this.getPlayerPagesValidSettings();
        }else if(category === "Players Page"){
            return this.getPlayersPageValidSettings();
        }else if(category === "Rankings"){
            return this.getRankingsValidSettings();
        }else if(category === "Records Page"){
            return this.getRecordsPageValidSettings();
        }else if(category === "Servers Page"){
            return this.getServersPageValidSettings();
        }

        return {};
    }

    async getMatchesPageValidSettings(){

        try{

            const g = new Gametypes();

            const names = await g.getAllNames();

            const nameValues = [
                {"name": "All", "value": 0}
            ];

            for(const [key, value] of Object.entries(names)){
                nameValues.push({"name": value, "value": parseInt(key)});
            }

            const playersLimits = [];

            for(let i = 2; i <= 32; i++){
                playersLimits.push({"name": `${i} Players`, "value": i});
            }

            const timeLimits = [];

            for(let i = 120, mins = 2; i <= 60 * 60; i+=60, mins++){

                timeLimits.push({
                    "name": `${mins} Minutes`,
                    "value": i
                });
            }

            return {
                "Default Display Type": this.defaultDiplayTypes,
                "Default Gametype": nameValues,
                "Default Display Per Page":
                    this.defaultPerPageValues,
                "Minimum Players": [
                    {"name": "No Limit", "value": 0},
                    {"name": "1 Player", "value": 1},
                    ...playersLimits
                ],
                "Minimum Playtime": [
                    {"name": "No Limit", "value": 0},
                    {"name": "1 Minute", "value": 60},
                    ...timeLimits
                ]
            };

        }catch(err){
            console.trace(err);
            return {};
        }
    }

    async getCategorySettings(cat){

        throw new Error(`Dont use getCategorySettings`);
    }

    //lazy copy paste until I replace calls to the above function
    static async getSettings(cat){
        
        throw new Error(`DONT USE THIS METHOD`);
    }


    async getDuplicates(){

        const query = "SELECT DISTINCT category,name,COUNT(*) as total_found, MAX(id) as last_id FROM nstats_site_settings GROUP BY category,name";
        const result = await simpleQuery(query);

        const found = [];

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(r.total_found > 1) found.push(r);
        }

        return found;
    }


    async deleteDuplicates(){

        const dups = await this.getDuplicates();

        const query = "DELETE FROM nstats_site_settings WHERE category=? AND name=? AND id!=?";

        if(dups.length === 0){
            new Message(`No duplicate settings found`, "pass");
        }
    
        for(let i = 0; i < dups.length; i++){

            const d = dups[i];
            await simpleQuery(query, [d.category, d.name, d.last_id]);
            new Message(`Deleted duplicate site setting entry ${d.category}, ${d.name} with id not equal to ${d.last_id}`,"pass");
            
        }
    }


    async getCategoryNames(){

        const query = "SELECT DISTINCT category FROM nstats_site_settings ORDER BY category ASC";

        const result = await simpleQuery(query);

        const names = [];

        for(let i = 0; i < result.length; i++){

            names.push(result[i].category);
        }

        return names;
    }


    async getCategory(category){

        const query = "SELECT * FROM nstats_site_settings WHERE category=? ORDER BY page_order ASC";

        const result =  await simpleQuery(query, [category]);

        let currentOrder = 0;

        for(let i = 0; i < result.length; i++){

            const r = result[i];

            if(r.value === "true" || r.value === "false"){
                r.page_order = currentOrder;
                currentOrder++;
                
            }else{
                r.page_order = 999999;
            }
        }

        return result;
    }


    /*async updateSetting(category, type, newValue){


        const query = "UPDATE nstats_site_settings SET value=? WHERE category=? AND name=?";

        const result = await mysql.updateReturnAffectedRows(query, [newValue, category, type]);

        if(result >= 1) return true;

        return false;
    }

    async updateSettingOrder(id, position){

        const query = "UPDATE nstats_site_settings SET page_order=? WHERE id=?";

        return await mysql.updateReturnAffectedRows(query, [position, id]);
    }

    async updateSettingsOrder(newIds){


        const errors = [];

        for(let i = 0; i < newIds.length; i++){

            const n = newIds[i];

            const result = await this.updateSettingOrder(n.id, n.order);

            if(result === 0){
                errors.push(n.id);
            }
        }

        return errors;
    }*/



    async getAllSettings(){

        const names = await this.getCategoryNames();

        const settings = {};

        for(let i = 0; i < names.length; i++){
            
            const name = names[i];

            const current = {};
            
            current.settings = await this.getCategory(name);      
            current.validSettings = await this.getValidSettings(name);
            settings[name] = current;
        }

        return settings;
    }

    async updateSetting(category, name, value, pageOrder){

        const query = `UPDATE nstats_site_settings SET value=?,page_order=? WHERE category=? AND name=?`;

        const vars = [value, pageOrder, category, name];

        return await simpleQuery(query, vars);
    }

    async updateSettings(settings){

        //console.log(settings);

        for(let i = 0; i < settings.length; i++){

            const s = settings[i];
            console.log(s);
            await this.updateSetting(s.category, s.name, s.value, s.page_order);
        }
    }
}


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