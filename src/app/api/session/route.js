import { updateSession } from "@/app/lib/authentication";

export async function POST(request){

    const userName = await updateSession();

    return Response.json({"userName": userName});
}