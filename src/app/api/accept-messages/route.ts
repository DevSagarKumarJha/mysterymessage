import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";


export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions)

    const user: User = session?.user as User

    if (!session || !session.user) {
        return Response.json
            (
                {
                    success: false,
                    message: "Not Authenticated "
                },
                {
                    status: 401
                }
            )
    }

    const userId = user._id;
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {
                isAcceptingMessages: acceptMessages
            },
            {
                new: true
            }
        )

        if (!updatedUser) {
            return Response.json
                (
                    {
                        success: false,
                        message: "Failed to toggle status of accept messages"
                    },
                    {
                        status: 401
                    }
                )
        }

        return Response.json
            (
                {
                    success: true,
                    message: "Message acceptance status changed",
                    updatedUser
                },
                {
                    status: 401
                }
            )
    } catch (error) {
        console.log("Failed to toggle status of accept messages")
        return Response.json(
            {
                success: false,
                message: "Failed to toggle status of accept messages"
            },
            {
                status: 500
            }
        )
    }
}


export async function GET(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions);

    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json(
            {
                success: false,
                message: "Unauthenticated User"
            },
            {
                status: 401
            }
        )
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId)
        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 401
                }
            )
        }
        return Response.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessages
            },
            {
                status: 200
            }
        )
    } catch (error) {
        console.log("Failed to get status of accept messages",error)
        return Response.json(
            {
                success: false,
                message: "Failed to get status of accept messages"
            },
            {
                status: 500
            }
        )
    }
}