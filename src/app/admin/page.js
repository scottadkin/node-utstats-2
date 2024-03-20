import { cookies } from "next/headers";
import ErrorBox from "../UI/ErrorBox";
import Header from "../UI/Header";
import { bSessionValid, bAccountAdmin } from "../lib/authentication"

export default async function AdminPage({}){


    const sId = cookies().get("nstats_sid");
    const userId = cookies().get("nstats_userid");


    if(sId === undefined || userId === undefined){

        return <div>
            <Header>Admin Control Panel</Header>
            <ErrorBox title="Access Denied">You are not logged in</ErrorBox>
        </div>
    }

    const bValidSession = await bSessionValid(userId.value, sId.value);

    if(!bValidSession){
        return <div>
            <Header>Admin Control Panel</Header>
            <ErrorBox title="Access Denied">User session not valid or expired.</ErrorBox>
        </div>
    }

    const bAdmin = await bAccountAdmin(userId.value);

    if(!bAdmin){

        return <div>
            <Header>Admin Control Panel</Header>
            <ErrorBox title="Access Denied">You do not have the required permissions to use this page.</ErrorBox>
        </div>
    }
    return <div>
        <Header>Admin Control Panel</Header>
        ADMIN PAGE
    </div>
}