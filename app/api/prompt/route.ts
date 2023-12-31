import admin from "firebase-admin";
import { adminDb } from "@/firebase/firebaseAdmin";
import { query } from "@/lib/queryApi";

export async function POST(request: Request) {
    const { prompt, outboundMessages, id, model, session } =
        await request.json();

    if (!prompt) {
        return new Response(
            JSON.stringify({ response: "Please provide a prompt!" }),
            {
                status: 400,
            }
        );
    }

    if (!id) {
        return new Response(
            JSON.stringify({ response: "Please provide a valid Chat ID" }),
            {
                status: 400,
            }
        );
    }

    // ChatGPT Query
    const response = await query(outboundMessages, id, model);

    const message: Message = {
        text: response || "Chat could not find a response",
        createdAt: admin.firestore.Timestamp.now(),
        user: {
            _id: "ChatGPT",
            name: "Chat",
            avatar: "/public/chatgpt-logo.png",
        },
    };

    await adminDb
        .collection("users")
        .doc(session?.user?.email)
        .collection("chats")
        .doc(id)
        .collection("messages")
        .add(message);

    return new Response(JSON.stringify({ response: message.text }), {
        status: 200,
    });
}
