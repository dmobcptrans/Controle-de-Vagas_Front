'use client';

import { useState } from 'react';

import FormularioMotorista from '@/components/autorização/cadastro/FormularioMotorista';
import CadastroConcluidoCard from '@/components/autorização/cadastro/CadastroConcluidoCard';
import ModalAtivacaoConta from '@/components/modal/autorizacao/login/ModalAtivacaoConta';

export default function CadastroMotoristaPage() {
  const [cadastroConcluido, setCadastroConcluido] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  function handleCloseModal() {
    setMostrarModal(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <main className="mx-auto flex max-w-4xl justify-center px-4 py-8">
        {!cadastroConcluido ? (
          <FormularioMotorista
            onSuccess={() => setCadastroConcluido(true)}
          />
        ) : (
          <CadastroConcluidoCard
            tipo="motorista"
            onAtivarConta={() => setMostrarModal(true)}
          />
        )}
      </main>

      <ModalAtivacaoConta
        open={mostrarModal}
        onOpenChange={setMostrarModal}
        onClose={handleCloseModal}
        cpfInicial="" 
      />
    </div>
  );
}