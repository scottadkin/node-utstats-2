import { cookies } from "next/headers";
import { bSessionAdminUser } from "@/app/lib/authentication";

export async function POST(a,b,c){

    //console.log(a,b,c);
    console.log("-------------------------------------------------------");
    console.log(cookies().getAll());

    await bSessionAdminUser();

    //Check if admin, if not return error message

    return Response.json({"message": "hi"});
}