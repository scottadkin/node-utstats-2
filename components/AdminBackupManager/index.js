import {useReducer} from "react";
import Loading from "../Loading";
import NotificationSmall from "../NotificationSmall";

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                ...state,
                "bLoading": false
            };
        }
        case "startBackup": {
            return {
                ...state,
                "bCreatingBackup": true,
                "error": null,
                "backupName": null
            }
        }
        case "backupPass": {
            return {
                ...state,
                "bCreatingBackup": false,
                "backupName": action.fileName,
                "error": null
            }
        }
        case "backupError": {
            return {
                ...state,
                "bCreatingBackup": false,
                "backupName": null,
                "error": action.errorMessage
            }
        }
    }

    return state;
}

const createBackup = async (dispatch) =>{


    dispatch({"type": "startBackup"});

    const req = await fetch("/api/admin", {
        "headers": {"Content-type": "application/json"},
        "method": "POST",
        "body": JSON.stringify({"mode": "create-backup"})
    });

    const res = await req.json();

    if(res.error === undefined){

        dispatch({"type": "backupPass", "fileName": res.fileName});
        return;
    }else{
        dispatch({"type": "backupError", "errorMessage": res.error});
        return;
    }
}

const renderBackup = (state, dispatch) =>{

    let button = null;

    if(!state.bCreatingBackup){
        button = <div className="search-button" onClick={async () => await createBackup(dispatch)}>Create Database Backup</div>
    }else{
        button = <Loading />;
    }

    let notification = null;

    if(state.backupName !== null && state.error === null){
        notification = <NotificationSmall type="pass">Successfully created database backup: <b>/backups/{state.backupName}.zip</b></NotificationSmall>
    }

    if(state.error !== null){
        notification = <NotificationSmall type="error">There was a problem creating the database backup: <b>{state.error}</b></NotificationSmall>
    }



    return <div>
        <div className="form">
            <div className="default-sub-header">Create Database Backup</div>
            <div className="form-info">Create a backup of the mysql database saved as a file called <b>DBBACKUP-DAY-MONTH-YEAR-HHMM.zip</b> that is stored in the website&apos;s main directory in a folder called backups.</div>
            {button}
        </div>
        {notification}
    </div>
   
}

const AdminBackupManager = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "bCreatingBackup": false,
        "backupName": null,
        "error": null
    });

    if(state.bLoading)

    return <div>
        <div className="default-header">Backup Manager</div>

        {renderBackup(state, dispatch)}
    </div>
}

export default AdminBackupManager;