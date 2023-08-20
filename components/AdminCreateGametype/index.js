const createGametype = async (dispatch, nDispatch, name) =>{

    try{


        const req = await fetch("/api/gametypeadmin", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "create", "name": name})
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

        if(res.message === "passed"){

            dispatch({"type": "addGametype", "id": res.id, "name": name});

            nDispatch({
                "type": "add", 
                "notification": {
                    "type": "pass", 
                    "content": <>Created gametype <b>{name}</b> successfully.</>
                }
            });
        }
    }catch(err){

        console.trace(err);
    }
}

const renderForm = (state, dispatch, nDispatch, bGametypeAlreadyExists) =>{

    if(state.bLoading) return null;

    const bExists = bGametypeAlreadyExists(state.gametypes, state.newName);

    let elems = null;

    if(bExists){
        elems = <div className="grey p-10">
            There is already a gametype called <b>{state.newName}</b>, you can not create the same gametype again(gametype names are case insensitive)
        </div>
    }else if(state.newName.length > 0){
        elems = <div className="search-button" onClick={() =>{
            createGametype(dispatch, nDispatch, state.newName);
        }}>Create Gametype</div>
    }


    return <div className="form">
        <div className="form-info">
            Create a new Gametype
        </div>
        <div className="form-row">
            <div className="form-label">
                Name
            </div>
            <input 
                type="text" 
                className="default-textbox" 
                placeholder="gametype name..." 
                value={state.newName}
                onChange={(e) => dispatch({"type": "setNewName", "value": e.target.value})}
            />
        </div>
        {elems}
    </div>
}

const AdminCreateGametype = ({state, dispatch, nDispatch, bGametypeAlreadyExists}) =>{

    return <>
        <div className="default-header">Create Gametype</div>        
        {renderForm(state, dispatch, nDispatch, bGametypeAlreadyExists)}
    </>
}

export default AdminCreateGametype;