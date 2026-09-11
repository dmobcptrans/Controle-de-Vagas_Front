'use client';

import { useState } from 'react';

import FormularioMotorista from '@/features/usuarios/auth/components/autorização/cadastro/FormularioMotorista';
import CadastroConcluidoCard from '@/features/usuarios/auth/components/autorização/cadastro/CadastroConcluidoCard';
import ModalAtivacaoConta from '@/features/usuarios/auth/components/modal/autorizacao/login/ModalAtivacaoConta';

export default function CadastroMotoristaPage() {
  const [cadastroConcluido, setCadastroConcluido] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  function handleCloseModal() {
    setMostrarModal(false);
  }

return (
  <div
    className="
      relative
      flex
      items-center
      justify-center
      min-h-[calc(100dvh-64px)]
      overflow-hidden
      bg-blue-800
      px-6
    "
  >
    {/* Domo */}
    <div
      className="
        absolute
        left-1/2
        bottom-0
        -translate-x-1/2
        w-[150%]
        h-[50%]
        bg-blue-900
        pointer-events-none
        z-0
      "
      style={{
        borderTopLeftRadius: '50%',
        borderTopRightRadius: '50%',
        boxShadow: '0 -20px 60px rgba(30,58,138,.35)',
      }}
    />

    <main
      className="
        relative
        z-10
        flex
        w-full
        max-w-5xl
        flex-col
        items-center
        justify-center
      "
    >
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">
          Cadastro de Motorista
        </h1>

        <p className="mt-2 text-blue-100">
          Preencha os dados para solicitar o cadastro.
        </p>
      </div>

      <div className="w-full flex mb-8 justify-center animate-in slide-in-from-bottom-6 fade-in duration-500">
        {!cadastroConcluido ? (
          <FormularioMotorista onSuccess={() => setCadastroConcluido(true)} />
        ) : (
          <CadastroConcluidoCard
            tipo="motorista"
            onAtivarConta={() => setMostrarModal(true)}
          />
        )}
      </div>
    </main>

    <ModalAtivacaoConta
      open={mostrarModal}
      onOpenChange={setMostrarModal}
      onClose={handleCloseModal}
      tipo='motorista'
    />
  </div>
);
}
