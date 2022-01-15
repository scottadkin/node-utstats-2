import React from 'react';


class AdminSiteSettings extends React.Component{

    constructor(props){

        super(props);
        this.state = {"categories": null, "mode": 0};
        this.changeMode = this.changeMode.bind(this);
    }

    async changeMode(id){

        this.setState({"mode": id});
    }

    async loadCategoryNames(){

        try{

            const req = await fetch("/api/admin",{
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "settingCategories"})
            });

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"categories": res.data});
            }

        }catch(err){
            console.trace(err);
        }
    }

    async loadData(){

        try{

            const req = await fetch("/api/admin",{
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "loadSettingsCategory", "cat": this.state.categories[this.state.mode]})
            });

            const res = await req.json();

            console.log(res);

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadCategoryNames();
        await this.loadData();
    }

    async componentDidUpdate(prevProps, prevState){

        if(this.state.mode !== prevState.mode){
            await this.loadData();
        }
    }

    renderTabs(){

        if(this.state.categories === null) return null;

        const tabs = [];

        for(let i = 0; i < this.state.categories.length; i++){

            const c = this.state.categories[i];

            tabs.push(<div key={i} 
                className={`tab ${(this.state.mode === i) ? "tab-selected" : ""}`}
                onClick={(() =>{
                    this.changeMode(i);
                })}>
                {c}
            </div>);
        }

        return <div className="tabs">
            {tabs}
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Site Settings</div>
            {this.renderTabs()}
        </div>
    }
}

export default AdminSiteSettings;