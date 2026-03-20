"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function ButtonLoginGoogle() {
  const { loginWithGoogle } = useAuth();

  return (
    <div className="w-full">
      <div className="w-full 
        [&>div]:!w-full 
        [&>div>iframe]:!w-full 
        [&>div>iframe]:!min-w-full 
        [&>div>iframe]:!max-w-full">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              const token = credentialResponse.credential;

              if (!token) {
                throw new Error("Token do Google não recebido.");
              }

              await loginWithGoogle(token);

              toast.success("Login com Google realizado com sucesso!");
            } catch (err: any) {
              let message = "Erro ao fazer login com Google.";

              if (err?.response?.data?.erro) {
                message = err.response.data.erro;
              }
  
              else if (err?.erro) {
                message = err.erro;
              }

              else if (err instanceof Error) {
                message = err.message;
              }

              toast.error(message);
            }
          }}
          onError={() => {
            toast.error("Falha no login com Google");
          }}
          size="large"
          shape="rectangular"
          theme="outline"
          width="100%"
        />
      </div>
    </div>
  );
}