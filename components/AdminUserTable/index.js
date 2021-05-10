import React from 'react';
import TimeStamp from '../TimeStamp/';
import Functions from '../../api/functions';
import styles from './AdminUserTable.module.css';
import TrueFalse from '../TrueFalse/';

class AdminUserTable extends React.Component{

    constructor(props){

        super(props);

        this.state = {"accounts": JSON.parse(this.props.accounts), "mode": 2};

        this.changeMode = this.changeMode.bind(this);
        this.activateUser = this.activateUser.bind(this);
        this.changePermission = this.changePermission.bind(this);
    }

    async changePermission(type, id, value){

        if(process.browser){


            if(value == 0){
                value = 1;
            }else{
                value = 0;
            }

            try{

                console.log(`Change user ${id} admin permission  to ${value}`);

                const req = await fetch("/api/permissions", {
                    "method": "POST",
                    "headers": {"Content-Type": "multipart/form-data"},
                    "body": JSON.stringify({"type": type, "user": id, "value": value})
                });

                const result = await req.json();

                this.updateUserAccountPermission(type, id, value);

            }catch(err){
               // console.trace(err);
            }
        }

    }

    updateUserAccountPermission(type, user, value){

        const previous = this.state.accounts;

        const current = [];

        let p = 0;

        for(let i = 0; i < previous.length; i++){

            p = previous[i];

            if(p.id === user){

                if(type === "admin"){
                    p.admin = value;
                }else if(type === "images"){
                    p.upload_images = value;
                }

                current.push(p);

            }else{
                current.push(p);
            }
        }

        this.setState({"accounts": current});
    }


    async activateUser(e){

        try{

            e.preventDefault();

            let userId = parseInt(e.target[0].value);

            const req = await fetch("/api/activateaccount", {
                "method": "POST",
                "Content-type": "application/json",
                "body": JSON.stringify({"userId": userId})
            });

            const result = await req.json();
            

            if(result.message !== undefined){

                if(result.message == "passed"){
                    this.updateUserAccountsState(userId);
                }
            }

        }catch(err){
            console.trace(err);
        }
    }

    updateUserAccountsState(id){

        const previous = this.state.accounts;

        const updated = [];

        let p = 0;

        for(let i = 0; i < previous.length; i++){

            p = previous[i];

            if(p.id === id){
                p.activated = 1;
            }

            updated.push(p);
        }


        this.setState({"accounts": updated});

    }

    changeMode(id){

        this.setState({"mode": id});
    }

    displayAll(){

        if(this.state.mode !== 1) return null; 

        const rows = [];

        let a = 0;
        let adminClassName = "";
        let adminDisplay = "";
        let activatedClassName = "";
        let activatedDisplay = "";
        let bannedDisplay = "";
        let bannedClassName = "";
        let imagesDisplay = "";
        let imagesClassName = "";

        for(let i = 0; i < this.state.accounts.length; i++){

            a = this.state.accounts[i];

            activatedClassName = (a.activated) ? "team-green" : "team-red";
            adminClassName = (a.admin) ? "team-green" : "team-red";
            bannedClassName = (a.banned) ? "team-red" : "team-green" ;
            imagesClassName = (a.upload_images || a.admin) ? "team-green" : "team-red" ;

            activatedDisplay = (a.activated) ? "Yes" : "No";
            adminDisplay = (a.admin) ? "Yes" : "No";
            bannedDisplay = (a.banned) ? "Yes" : "No";
            imagesDisplay = (a.upload_images || a.admin) ? "Yes" : "No";

            rows.push(<tr key={i}>
                <td>{a.name}</td>
                <td><TimeStamp timestamp={a.joined} /></td>
                <td className={activatedClassName}>{activatedDisplay}</td>
                <td className={adminClassName}>{adminDisplay}</td>
                <td className={bannedClassName}>{bannedDisplay}</td>
                <td className={imagesClassName}>{imagesDisplay}</td>
                <td>{Functions.ignore0(a.logins)}</td>
                <td><TimeStamp timestamp={a.last_login} noDayName={true}/></td>
                <td><TimeStamp timestamp={a.last_active} noDayName={true}/></td>
                <td>{a.last_ip}</td>
            </tr>);
        }

        return <div>
            <div className="default-header">All Users</div>
            <table className="t-width-1 td-1-left">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Joined</th>
                        <th>Activated</th>
                        <th>Admin</th>
                        <th>Banned</th>
                        <th>Upload Images</th>
                        <th>Times Logged In</th>
                        <th>Last Login</th>
                        <th>Last Active</th>
                        <th>Last IP</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }


    renderActivateTable(){

        if(this.state.mode !== 0) return null;

        const rows = [];

        let a = 0;

        for(let i = 0; i < this.state.accounts.length; i++){

            a = this.state.accounts[i];

            if(!a.activated){

                rows.push(<tr key={i}>
                    <td>{a.name}</td>
                    <td><TimeStamp timestamp={a.joined} /></td>
                    <td>{a.last_ip}</td>
                    <td>
                        <form action="/" method="POST" onSubmit={this.activateUser}>
                            <input type="hidden" name="accountId" value={a.id} />
                            <input className={styles.activate} type="submit" name="submit" value="Activate Account" />
                        </form>
                    </td>
                </tr>);
            }
        }

        if(rows.length === 0){

            rows.push(<tr key={"i"}>
                <td colSpan="4" style={{"textAlign": "center"}}>
                    No users need their accounts to be activated.
                </td>
            </tr>);
        }

        return <div>
            <div className="default-header">Activate Users</div>
            <table className="t-width-1 td-1-left">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Joined</th>
                        <th>IP</th>
                        <th>Update Account</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }


    createAdminPermissionRow(user){

        return <td>
        <div onClick={
                (() =>{
                    this.changePermission("admin", user.id, user.admin);
                })
            } className={styles.permission}>{(user.admin) ? "Remove" : "Give"} Admin</div>
        </td>
    }


    createImagePermissionRow(user){

        return <td>
            {(user.admin) ? "" :
            <div onClick={
                (() =>{
                    this.changePermission("images", user.id, user.upload_images);
                })
            }
            className={styles.permission}>{(user.upload_images) ? "Remove" : "Allow"} Image Uploads</div>}
        </td>
    }

    renderPermissionsTable(){

        if(this.state.mode !== 2) return null;

        const rows = [];

        let a = 0;


        for(let i = 0; i < this.state.accounts.length; i++){

            a = this.state.accounts[i];


            rows.push(<tr key={i}>
                <td>{a.name}</td>
                <TrueFalse value={a.admin} bTable={true}/>
                <TrueFalse value={a.upload_images} bTable={true}/>
                {this.createAdminPermissionRow(a)}
                {this.createImagePermissionRow(a)}
            </tr>);
        }


        return <div>
            <div className="default-header">User Permissions</div>
            <table className="t-width-1 td-1-left">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Admin</th>
                        <th>Upload Images</th>
                        <th>Change Admin</th>
                        <th>Change Images</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">
                Manage User Accounts
            </div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : "" }`} onClick={(() =>{
                    this.changeMode(0);
                })}>Activate Users</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : "" }`} onClick={(() =>{
                    this.changeMode(2);
                })}>User Permissions</div>
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : "" }`} onClick={(() =>{
                    this.changeMode(3);
                })}>Ban Users</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : "" }`} onClick={(() =>{
                    this.changeMode(1);
                })}>View All</div>
            </div>
            {this.displayAll()}
            {this.renderActivateTable()}
            {this.renderPermissionsTable()}
        </div>
    }
}

export default AdminUserTable;