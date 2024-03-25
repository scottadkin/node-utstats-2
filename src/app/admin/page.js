import { cookies } from "next/headers";
import ErrorBox from "../UI/ErrorBox";
import Header from "../UI/Header";
import { bSessionValid, bAccountAdmin, bSessionAdminUser } from "../lib/authentication";
import Tabs from "../UI/Tabs";
import FTPManager from "../UI/admin/FTPManager";

export default async function AdminPage({params, searchParams}){

    console.log(params, searchParams);
    const sId = cookies().get("nstats_sid");
    const userId = cookies().get("nstats_userid");

    let selectedMode = (searchParams.mode === undefined) ? "" : searchParams.mode;


    if(sId === undefined || userId === undefined){

        return <div>
            <Header>Admin Control Panel</Header>
            <ErrorBox title="Access Denied">You are not logged in</ErrorBox>
        </div>
    }

    const {bAdmin, error} = await bSessionAdminUser();


    if(!bAdmin){

        return <div>
            <Header>Admin Control Panel</Header>
            <ErrorBox title="Access Denied">{error}</ErrorBox>
        </div>
    }

    return <div>
        <Header>Admin Control Panel</Header>
        ADMIN PAGE
        <Tabs 
            options={[
                {"name": "Test", "value": "test"},
                {"name": "FTP Manager", "value": "ftp"},
            ]}
            selectedValue={selectedMode}
            tabName="mode"
            url="/admin/"
        />
        {(selectedMode === "ftp") ? <FTPManager /> : null }
    </div>
}