'use client';

import { useState } from 'react';

import FormularioEmpresa from '@/components/autorização/cadastro/FormularioEmpresa';
import CadastroConcluidoCard from '@/components/autorização/cadastro/CadastroConcluidoCard';
import ModalAtivacaoConta from '@/components/modal/autorizacao/login/ModalAtivacaoConta';

export default function CadastroEmpresaPage() {
  const [cadastroConcluido, setCadastroConcluido] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  function handleCloseModal() {
    setMostrarModal(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <main className="flex-col justify-center items-center">
         <div className="text-center mb-8 mt-6">
          <h1 className="text-3xl font-bold text-blue-800">
            Cadastro de Empresa
          </h1>
        </div>
        <div className="mx-auto flex max-w-4xl justify-center animate-in slide-in-from-bottom-6 fade-in duration-500 ">
        {!cadastroConcluido ? (
          <FormularioEmpresa
            onSuccess={() => setCadastroConcluido(true)}
          />
        ) : (
          <CadastroConcluidoCard
            tipo="empresa"
            onAtivarConta={() => setMostrarModal(true)}
          />
        )}
        </div>
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