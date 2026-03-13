"use client";

import { clientApi } from "@/lib/clientApi";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

export default function ButtonLoginGoogle() {
    return (
        <GoogleLogin
            onSuccess={async (credentialResponse) => {
                try {
                    const token = credentialResponse.credential;

                    await clientApi(`/petrocarga/auth/loginWithGoogle?token=${token}`, {
                        method: "POST"
                    });

                    toast.success("Login com Google realizado com sucesso!");
                } catch (err: unknown) {
                    const message =
                        err instanceof Error
                            ? err.message
                            : "Erro ao fazer login com Google.";

                    toast.error(message);
                }
            }}
            onError={() => {
                toast.error("Falha no login com Google");
            }}
            size="large"
            shape="pill"
            theme="outline"
        />
    );
}