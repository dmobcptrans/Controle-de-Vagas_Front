'use client';

import { useState, useEffect, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  Key,
  CheckCircle,
  RefreshCw,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/hooks/useAuth';
import { ativarConta, reenviarCodigoAtivacao } from '@/lib/api/recuperacaoApi';

function ModalTermos({
  open,
  onOpenChange,
  onClose,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-600">
            Termos de Uso e Política de Privacidade
          </DialogTitle>
          <DialogDescription>
            Leia atentamente os termos abaixo antes de continuar
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            <section className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">
                Informações importantes
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Este serviço é fornecido pela [Nome da Prefeitura/Secretaria] em
                conformidade com as leis brasileiras, especialmente a Lei
                Federal nº 12.965/2014 (Marco Civil da Internet) e a Lei Federal
                nº 13.709/2018 (Lei Geral de Proteção de Dados Pessoais - LGPD).
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">
                1. Informações neste documento
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Neste Termo de Uso e Política de Privacidade, você encontrará
                informações sobre:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>O funcionamento do serviço solicitado</li>
                <li>O embasamento legal relacionado à prestação do serviço</li>
                <li>Suas responsabilidades ao utilizar o serviço</li>
                <li>As responsabilidades da administração pública</li>
                <li>Informações para contato</li>
                <li>O tratamento dos dados pessoais realizados</li>
                <li>Quais dados são necessários para a prestação do serviço</li>
                <li>Medidas de segurança implementadas</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">2. Base Legal</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Este documento foi elaborado em conformidade com:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>
                  Lei Federal nº 12.965, de 23 de abril de 2014 (Marco Civil da
                  Internet)
                </li>
                <li>Lei Federal nº 13.709, de 14 de agosto de 2018 (LGPD)</li>
                <li>
                  Lei nº 12.527, de 18 de novembro de 2011 (Lei de Acesso à
                  Informação)
                </li>
                <li>Decretos e normativos municipais aplicáveis</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">
                3. Princípios da LGPD (Art. 6º)
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                A [Nome da Prefeitura] se compromete a cumprir as normas da LGPD
                e respeitar os seguintes princípios:
              </p>
              <div className="space-y-3 mt-2">
                <p className="text-gray-600 text-sm">
                  <strong>I - Finalidade:</strong> tratamento para propósitos
                  legítimos, específicos e informados ao titular
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>II - Adequação:</strong> compatibilidade do tratamento
                  com as finalidades informadas
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>III - Necessidade:</strong> limitação ao mínimo
                  necessário para a realização das finalidades
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>IV - Livre acesso:</strong> consulta facilitada sobre
                  o tratamento dos dados
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>V - Qualidade dos dados:</strong> garantia de exatidão
                  e atualização dos dados
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>VI - Transparência:</strong> informações claras sobre
                  o tratamento
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>VII - Segurança:</strong> medidas técnicas e
                  administrativas de proteção
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>VIII - Prevenção:</strong> medidas para prevenir danos
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>IX - Não discriminação:</strong> impossibilidade de
                  tratamento para fins discriminatórios
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>X - Responsabilização:</strong> demonstração de
                  medidas eficazes
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">
                4. Aceitação dos Termos
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Ao utilizar os serviços, você confirma que leu, compreendeu e
                concorda com este Termo de Uso e Política de Privacidade.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">5. Definições</h3>
              <div className="grid grid-cols-1 gap-3">
                <p className="text-gray-600 text-sm">
                  <strong>Agentes de tratamento:</strong> controlador e operador
                  responsáveis pelo tratamento de dados
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Dado pessoal:</strong> informação relacionada a pessoa
                  natural identificada ou identificável
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Titular:</strong> pessoa natural a quem se referem os
                  dados pessoais
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Tratamento:</strong> toda operação realizada com dados
                  pessoais
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Controlador:</strong> [Nome do Órgão/Secretaria]
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Encarregado (DPO):</strong> [Nome do Encarregado] -
                  [e-mail de contato]
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">
                6. Tratamento dos dados
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                O tratamento de dados pessoais pela [Nome do Órgão] é realizado
                com base no:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>
                  Cumprimento de obrigação legal ou regulatória (Art. 7º, II da
                  LGPD)
                </li>
                <li>Execução de políticas públicas (Art. 7º, III da LGPD)</li>
                <li>Exercício de competências legais do órgão público</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">7. Seus direitos</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                De acordo com a LGPD, você tem direito a:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>
                  <strong>Confirmação e acesso:</strong> saber se seus dados são
                  tratados e acessá-los
                </li>
                <li>
                  <strong>Retificação:</strong> corrigir dados incompletos ou
                  desatualizados
                </li>
                <li>
                  <strong>Limitação:</strong> solicitar eliminação de dados
                  desnecessários
                </li>
                <li>
                  <strong>Oposição:</strong> opor-se ao tratamento em
                  determinadas hipóteses
                </li>
                <li>
                  <strong>Portabilidade:</strong> solicitar a portabilidade dos
                  dados
                </li>
                <li>
                  <strong>Informação:</strong> sobre compartilhamento de dados
                </li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">
                8. Responsabilidades do usuário
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Você se responsabiliza por:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>Precisão e veracidade dos dados informados</li>
                <li>Fornecer apenas seus dados pessoais, não de terceiros</li>
                <li>Manter o sigilo de sua senha (pessoal e intransferível)</li>
                <li>Atualizar suas informações cadastrais</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">
                9. Responsabilidades do órgão
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                A [Nome do Órgão] se responsabiliza por:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>Preservar a funcionalidade do serviço</li>
                <li>Garantir a segurança e confidencialidade dos dados</li>
                <li>Adotar medidas de proteção adequadas</li>
                <li>Comunicar incidentes de segurança quando aplicável</li>
              </ul>
              <p className="text-gray-600 text-sm mt-2">
                <strong>Não nos responsabilizamos por:</strong> equipamentos
                infectados por códigos maliciosos, vulnerabilidades nos sistemas
                dos usuários, ou uso indevido por compartilhamento de
                credenciais.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">
                10. Segurança da informação
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Em conformidade com os princípios da segurança e prevenção da
                LGPD, adotamos:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>Criptografia na transmissão de dados</li>
                <li>Controle de acesso baseado em necessidade</li>
                <li>Medidas técnicas e organizativas de proteção</li>
                <li>Monitoramento e registro de acessos</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">
                11. Cookies e tecnologia
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Utilizamos cookies e tecnologias semelhantes para:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>Garantir o funcionamento adequado do serviço</li>
                <li>Registrar acessos conforme o Marco Civil da Internet</li>
                <li>Melhorar a experiência do usuário</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">
                12. Compartilhamento de dados
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Seus dados podem ser compartilhados:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>Para execução de políticas públicas</li>
                <li>
                  Com outros órgãos públicos, no cumprimento de competências
                  legais
                </li>
                <li>
                  Por determinação judicial ou requisição do Ministério Público
                </li>
                <li>Com prestadores de serviços tecnológicos contratados</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">
                13. Dados anonimizados
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Dados anonimizados podem ser utilizados para:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>Pesquisas e geração de estatísticas</li>
                <li>Melhoria contínua dos serviços</li>
                <li>Transparência pública (Dados Abertos)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">14. Contato e DPO</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Para esclarecer dúvidas sobre este Termo ou sobre o tratamento
                de seus dados:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg mt-2">
                <p className="text-sm">
                  <strong>E-mail:</strong>{' '}
                  [contato@cptrans.petropolis.rj.gov.br]
                </p>
                <p className="text-sm">
                  <strong>Telefone:</strong> [(24) 2246-9300]
                </p>
                <p className="text-sm">
                  <strong>Endereço:</strong> [Rua Alberto Torres, 115 - Centro,
                  Petrópolis - RJ, CEP 25610-060]
                </p>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                Você também pode entrar em contato através da Ouvidoria ou
                Plataforma Fala.BR.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">15. Foro</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Fica eleito o Foro da Comarca de [Nome da Cidade] para dirimir
                quaisquer controvérsias decorrentes deste Termo, com renúncia
                expressa a qualquer outro, por mais privilegiado que seja.
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Sem prejuízo, você tem direito de apresentar reclamação à
                Autoridade Nacional de Proteção de Dados (ANPD).
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">
                16. Alterações deste termo
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Este Termo tem validade indeterminada, mas está sujeito a
                alterações sem aviso prévio, especialmente para adequação à
                legislação vigente e evolução dos serviços. Recomenda-se a
                consulta periódica desta página.
              </p>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t pt-4">
          <p className="text-xs text-gray-500 text-left flex-1">
            Última atualização: [data]
          </p>
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function identificarTipoLogin(
  input: string,
): 'email' | 'cpf' | 'invalido' | 'indeterminado' {
  if (!input.trim()) return 'indeterminado';

  const apenasNumeros = input.replace(/\D/g, '');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (emailRegex.test(input)) {
    return 'email';
  } else if (/^\d+$/.test(input) && apenasNumeros.length === 11) {
    return 'cpf';
  } else if (
    /^\d+$/.test(input) &&
    apenasNumeros.length > 0 &&
    apenasNumeros.length < 11
  ) {
    return 'cpf';
  }

  return 'invalido';
}

function LoginContent() {
  const [loginInput, setLoginInput] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cpfAtivacao, setCpfAtivacao] = useState('');
  const [codigo, setCodigo] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [reenviandoCodigo, setReenviandoCodigo] = useState(false);
  const [tipoInput, setTipoInput] = useState<
    'email' | 'cpf' | 'invalido' | 'indeterminado'
  >('indeterminado');
  const [aceitarTermos, setAceitarTermos] = useState(false);
  const [mostrarModalTermos, setMostrarModalTermos] = useState(false);

  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const ativarContaParam = searchParams.get('ativar-conta');

    if (ativarContaParam === 'true') {
      setMostrarModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (mostrarModal) {
      const currentParams = new URLSearchParams(window.location.search);
      const hasParam = currentParams.get('ativar-conta') === 'true';

      if (!hasParam) {
        currentParams.set('ativar-conta', 'true');
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [mostrarModal]);

  useEffect(() => {
    const tipo = identificarTipoLogin(loginInput);
    setTipoInput(tipo);
  }, [loginInput]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      switch (user.permissao) {
        case 'ADMIN':
        case 'GESTOR':
          router.replace('/gestor/visualizar-vagas');
          break;
        case 'MOTORISTA':
          router.replace('/motorista/reservar-vaga');
          break;
        case 'AGENTE':
          router.replace('/agente/reserva-rapida');
          break;
      }
    }
  }, [authLoading, isAuthenticated, user, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  async function handleLogin() {
    setLoading(true);
    setError('');

    try {
      const loginProcessado =
        tipoInput === 'email'
          ? loginInput.trim().toLowerCase()
          : loginInput.replace(/\D/g, '');

      const decodedUser = await login({
        login: loginProcessado,
        senha,
      });

      switch (decodedUser.permissao) {
        case 'ADMIN':
        case 'GESTOR':
          window.location.href = '/gestor/visualizar-vagas';
          break;
        case 'MOTORISTA':
          window.location.href = '/motorista/reservar-vaga';
          break;
        case 'AGENTE':
          window.location.href = '/agente/reserva-rapida';
          break;
        default:
          setError('Permissão desconhecida');
      }
    } catch (err: unknown) {
      setError(
        (err as Error).message || 'Erro ao fazer login. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  }

  const handleAtivarConta = async () => {
    // Limpar mensagens anteriores
    setModalError('');
    setModalSuccess('');

    // Validações
    if (!cpfAtivacao.trim()) {
      setModalError('Por favor, insira seu CPF');
      return;
    }

    if (!codigo.trim()) {
      setModalError('Por favor, insira o código de ativação');
      return;
    }

    if (!aceitarTermos) {
      setModalError(
        'Você precisa aceitar os termos de uso e política de privacidade',
      );
      return;
    }

    setModalLoading(true);

    try {
      const cpfLimpo = cpfAtivacao.replace(/\D/g, '');

      if (cpfLimpo.length !== 11) {
        throw new Error('CPF deve conter 11 dígitos');
      }

      await ativarConta(cpfLimpo, codigo.trim(), aceitarTermos);

      setModalSuccess(
        'Conta ativada com sucesso! Agora você pode fazer login.',
      );

      setTimeout(() => {
        handleCloseModal();
        setAceitarTermos(false);
      }, 2000);
    } catch (err: unknown) {
      setModalError(
        (err as Error).message ||
          'Código inválido ou expirado. Verifique e tente novamente.',
      );
    } finally {
      setModalLoading(false);
    }
  };

  const handleReenviarCodigo = async () => {
    if (!cpfAtivacao.trim()) {
      setModalError('Por favor, insira seu CPF');
      return;
    }

    setReenviandoCodigo(true);
    setModalError('');
    setModalSuccess('');

    try {
      const cpfLimpo = cpfAtivacao.replace(/\D/g, '');

      if (cpfLimpo.length !== 11) {
        throw new Error('CPF deve conter 11 dígitos');
      }

      const resultado = await reenviarCodigoAtivacao(cpfLimpo);

      if (resultado.valido === true) {
        setModalSuccess(
          resultado.message || 'Novo código enviado para seu email!',
        );
      } else if (resultado.valido === false) {
        setModalError(resultado.message || 'Erro ao solicitar novo código');
      } else {
        setModalSuccess('Código reenviado com sucesso!');
      }
    } catch (err: unknown) {
      setModalError(
        (err as Error).message ||
          'Erro ao solicitar novo código. Tente novamente.',
      );
    } finally {
      setReenviandoCodigo(false);
    }
  };

  const handleOpenModal = () => {
    if (tipoInput === 'cpf') {
      setCpfAtivacao(loginInput.replace(/\D/g, ''));
    } else {
      setCpfAtivacao('');
    }

    setCodigo('');
    setModalError('');
    setModalSuccess('');
    setAceitarTermos(false);
    setMostrarModal(true);

    const params = new URLSearchParams(searchParams.toString());
    params.set('ativar-conta', 'true');
    window.history.replaceState({}, '', `?${params.toString()}`);
  };

  const handleCloseModal = () => {
    setMostrarModal(false);
    setCpfAtivacao('');
    setCodigo('');
    setModalSuccess('');
    setModalError('');
    setAceitarTermos(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('ativar-conta');

    const newUrl =
      params.toString() === ''
        ? window.location.pathname
        : `?${params.toString()}`;

    window.history.replaceState({}, '', newUrl);
  };

  const getInputIcon = () => {
    if (tipoInput === 'email') {
      return (
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      );
    } else if (tipoInput === 'cpf') {
      return (
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      );
    } else {
      return (
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
      );
    }
  };

  const getFormatHint = () => {
    if (tipoInput === 'email') {
      return (
        <span className="text-xs text-green-600 mt-1 flex items-center gap-1">
          ✓ Formato de email válido
        </span>
      );
    } else if (tipoInput === 'cpf') {
      const apenasNumeros = loginInput.replace(/\D/g, '');
      if (apenasNumeros.length === 11) {
        return (
          <span className="text-xs text-green-600 mt-1 flex items-center gap-1">
            ✓ CPF válido (11 dígitos)
          </span>
        );
      } else {
        return (
          <span className="text-xs text-amber-600 mt-1">
            ⚠ CPF: {apenasNumeros.length}/11 dígitos
          </span>
        );
      }
    } else if (loginInput && tipoInput === 'invalido') {
      return (
        <span className="text-xs text-red-600 mt-1">
          ✗ Formato inválido. Use email ou CPF (apenas números)
        </span>
      );
    } else {
      return (
        <span className="text-xs text-gray-500 mt-1">
          Digite seu email ou CPF (11 dígitos)
        </span>
      );
    }
  };

  const handleInputChange = (value: string) => {
    if (tipoInput === 'cpf' || /^\d+$/.test(value)) {
      const apenasNumeros = value.replace(/\D/g, '');
      if (apenasNumeros.length <= 11) {
        setLoginInput(apenasNumeros);
      }
    } else {
      setLoginInput(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob-more-delayed"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-2xl backdrop-blur-sm bg-white/90 border-0">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Bem-vindo
          </CardTitle>
          <CardDescription className="text-base">
            Entre com email ou CPF para acessar o sistema
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email ou CPF
              </label>
              <div className="relative">
                {getInputIcon()}
                <Input
                  type="text"
                  value={loginInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="seu@email.com ou 12345678900"
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                  disabled={loading}
                  inputMode={tipoInput === 'cpf' ? 'numeric' : 'text'}
                />
              </div>
              {getFormatHint()}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleOpenModal}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline flex items-center gap-1"
              >
                <Key className="w-4 h-4" />
                Ativar Conta
              </button>

              <div className="flex-1 text-center mx-4">
                <div className="h-px bg-gray-300"></div>
              </div>

              <Link
                href="/autorizacao/verificacao"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Esqueceu sua senha?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={
                loading || !loginInput || !senha || tipoInput === 'invalido'
              }
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-4 space-y-4">
            <Link href="/autorizacao/cadastro">
              <Button className="w-full h-12 bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
                Criar Conta
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={mostrarModal}
        onOpenChange={(open) => {
          if (open) {
            setMostrarModal(true);
            if (!searchParams.get('ativar-conta')) {
              const params = new URLSearchParams(searchParams.toString());
              params.set('ativar-conta', 'true');
              window.history.replaceState({}, '', `?${params.toString()}`);
            }
          } else {
            handleCloseModal();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Key className="w-6 h-6 text-blue-600" />
              Ativar Conta
            </DialogTitle>
            <DialogDescription>
              Insira seu CPF e o código de ativação recebido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {modalError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{modalSuccess}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                CPF
              </label>
              <Input
                type="text"
                value={cpfAtivacao}
                onChange={(e) => {
                  const apenasNumeros = e.target.value.replace(/\D/g, '');
                  if (apenasNumeros.length <= 11) {
                    setCpfAtivacao(apenasNumeros);
                  }
                }}
                placeholder="12345678900"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
                disabled={modalLoading}
                inputMode="numeric"
              />
              <p className="text-xs text-gray-500">
                Digite apenas números, sem pontuações
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Código de Ativação
                </label>
                <button
                  type="button"
                  onClick={handleReenviarCodigo}
                  disabled={reenviandoCodigo || modalLoading}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
                >
                  {reenviandoCodigo ? (
                    <>
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      <span>Solicitar novo código</span>
                    </>
                  )}
                </button>
              </div>
              <Input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                placeholder="Digite o código recebido"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-all font-mono text-center text-lg"
                disabled={modalLoading}
              />
            </div>

            {/* Checkbox de aceitar dos termos */}
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="termos"
                checked={aceitarTermos}
                onCheckedChange={(checked) => {
                  setAceitarTermos(checked as boolean);
                }}
                disabled={modalLoading}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="termos"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  Li e aceito os{' '}
                  <button
                    type="button"
                    onClick={() => setMostrarModalTermos(true)}
                    className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2 hover:no-underline transition-colors"
                  >
                    Termos de Uso e Política de Privacidade
                  </button>
                </label>
                <p className="text-xs text-gray-500">
                  É necessário aceitar os termos para ativar sua conta
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
              disabled={modalLoading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAtivarConta}
              disabled={modalLoading || !cpfAtivacao || !codigo}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              {modalLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Ativando...</span>
                </div>
              ) : (
                'Ativar Conta'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Termos */}
      <ModalTermos
        open={mostrarModalTermos}
        onOpenChange={setMostrarModalTermos}
        onClose={() => setMostrarModalTermos(false)}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
