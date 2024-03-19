import { updateSession } from "@/app/lib/authentication";

export async function POST(request){

    await updateSession();

    return Response.json({"message": "hi"});
}