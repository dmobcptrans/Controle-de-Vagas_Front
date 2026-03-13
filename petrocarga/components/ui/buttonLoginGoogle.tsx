"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function ButtonLoginGoogle() {
  const {  } = useAuth();

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        try {
          const token = credentialResponse.credential;

          if (!token) {
            throw new Error("Token do Google não recebido.");
          }

          await loginWithGoogle(token);

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