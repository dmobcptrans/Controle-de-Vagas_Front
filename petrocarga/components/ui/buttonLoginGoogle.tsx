"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

declare global {
  interface Window {
    google: any;
  }
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.73 1.22 9.24 3.6l6.9-6.9C35.64 2.6 30.2 0 24 0 14.82 0 6.73 5.48 2.69 13.44l8.05 6.26C12.5 13.13 17.77 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.14-3.14-.4-4.64H24v9.27h12.7c-.55 2.96-2.2 5.46-4.7 7.14l7.2 5.6c4.2-3.87 6.6-9.57 6.6-16.37z"/>
      <path fill="#FBBC05" d="M10.74 28.7c-.5-1.5-.78-3.1-.78-4.7s.28-3.2.78-4.7l-8.05-6.26C1 16.1 0 19.94 0 24s1 7.9 2.69 11.0l8.05-6.3z"/>
      <path fill="#34A853" d="M24 48c6.2 0 11.4-2.05 15.2-5.56l-7.2-5.6c-2 1.35-4.56 2.15-8 2.15-6.23 0-11.5-3.63-13.26-8.86l-8.05 6.3C6.73 42.52 14.82 48 24 48z"/>
    </svg>
  );
}

export default function ButtonLoginGoogle() {
  const { loginWithGoogle } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleCallback,
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
        });

        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  const handleCallback = async (response: any) => {
    try {
      const token = response.credential;

      if (!token) {
        throw new Error("Token do Google não recebido.");
      }

      await loginWithGoogle(token);

      toast.success("Login com Google realizado com sucesso!");
    } catch (err: any) {
      let message = "Erro ao fazer login com Google.";

      if (err?.response?.data?.erro) {
        message = err.response.data.erro;
      } else if (err?.erro) {
        message = err.erro;
      } else if (err instanceof Error) {
        message = err.message;
      }

      toast.error(message);
    }
  };

  const handleLogin = () => {
    const button = googleBtnRef.current?.querySelector("div[role=button]") as HTMLElement;
    button?.click(); // dispara o botão oficial
  };

  return (
    <div className="w-full">
      {/* botão invisível do Google */}
      <div ref={googleBtnRef} className="hidden" />

      {/* seu botão custom */}
      <button
        onClick={handleLogin}
        className="w-full h-12 flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition hover:shadow-xl shadow-lg hover:border-gray-400"
      >
        <GoogleIcon />
        Entrar com Google
      </button>
    </div>
  );
}