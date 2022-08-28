import React from "react";
import FormCheckBox from "../FormCheckBox";
import Loading from "../Loading";

class AdminLogsFolderEdit extends React.Component{

    constructor(props){

        super(props);
        
        this.updateValue = this.updateValue.bind(this);
        this.save = this.save.bind(this);
    }

    updateValue(name, value){

        this.props.updateValue(name, value);
    }


    async save(e){

        e.preventDefault();

        await this.props.saveChanges();
    }

    renderForm(){


        if(this.props.data === null) return null;

        const d = this.props.data;

        return <form action="/" method="POST" onSubmit={this.save}>
            <div className="select-row">
                <div className="select-label">Ignore Duplicates</div>
                <FormCheckBox inputName={"bIgnoreDuplicates"} valueName="ignore_duplicates" value={d.ignore_duplicates} updateValue={this.updateValue}/>
            </div>
            <div className="select-row">
                <div className="select-label">Ignore Bots</div>
                <FormCheckBox inputName={"bIgnoreBots"} valueName="ignore_bots" value={d.ignore_bots} updateValue={this.updateValue}/>
            </div>
            <div className="select-row">
                <div className="select-label">Minimum Players</div>
                <input type="number" className="default-textbox" min="0" value={d.min_players} onChange={((e) =>{
                    this.updateValue("min_players", e.target.value);
                })}/>
            </div>
            <div className="select-row">
                <div className="select-label">Minimum Playtime(in seconds)</div>
                <input type="number" className="default-textbox" value={d.min_playtime} min="0" onChange={((e) =>{
                    this.updateValue("min_playtime", e.target.value);
                })} />
            </div>
            <div className="select-row">
                <div className="select-label">Import ACE</div>
                <FormCheckBox inputName={"bImportAce"} valueName="import_ace" value={d.import_ace} updateValue={this.updateValue}/>
            </div>
            <input type="submit" className="search-button" value="Save Changes" />
        </form>

    }

    renderLoading(){

        if(this.props.data !== null) return null;

        return <Loading />;
    }

    render(){

        return <div>
            <div className="default-header">Logs Folder Settings</div>
            <div className="form">
                <div className="default-sub-header-alt">Information</div>
                <div className="form-info m-bottom-10">
                    These are the settings that are used if you place files in the website's Logs folder instead of using the ftp, or sftp importer.
                </div>
                {this.renderLoading()}
                {this.renderForm()}
                
            </div>
        </div>
    }
}

export default AdminLogsFolderEdit;