import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DebugPage() {
    // 🛡️ Chỉ cho phép truy cập trong development — production sẽ redirect
    if (process.env.NODE_ENV !== "development") {
        redirect("/sign-in");
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    let connectionStatus = "Unknown";
    let user = null;

    try {
        const supabase = await createClient();
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
            connectionStatus = `Auth Error: ${error.message}`;
        } else {
            connectionStatus = "Connected to Supabase ✅";
            user = session?.user;
        }

    } catch (err: any) {
        connectionStatus = `Client Init Error ❌: ${err.message}`;
    }

    return (
        <div className="p-10 font-mono text-sm space-y-4">
            <h1 className="text-xl font-bold">🛠️ Supabase Environment Debugger</h1>

            <div className="border p-4 rounded bg-muted">
                <h2 className="font-bold mb-2">Environment Variables</h2>
                <div>NEXT_PUBLIC_SUPABASE_URL: <span className={url ? "text-green-500" : "text-red-500"}>{url ? "Loaded ✅" : "MISSING ❌"}</span></div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: <span className={key ? "text-green-500" : "text-red-500"}>{key ? "Loaded ✅" : "MISSING ❌"}</span></div>
            </div>

            <div className="border p-4 rounded bg-muted">
                <h2 className="font-bold mb-2">Connection Status</h2>
                <div>Status: <span className={connectionStatus.includes("Error") ? "text-red-500" : "text-green-500"}>{connectionStatus}</span></div>
            </div>

            <div className="border p-4 rounded bg-muted">
                <h2 className="font-bold mb-2">Current Session</h2>
                <pre className="bg-black/10 p-2 rounded overflow-auto">
                    {user ? JSON.stringify(user, null, 2) : "No active session (Not logged in)"}
                </pre>
            </div>
        </div>
    );
}
