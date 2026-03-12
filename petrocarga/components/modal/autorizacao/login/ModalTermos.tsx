'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ModalTermosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export default function ModalTermos({
  open,
  onOpenChange,
  onClose,
}: ModalTermosProps) {
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
                Este serviço é fornecido pela CPTrans (Companhia Petropolitana
                de Trânsito e Transporte) em conformidade com as leis
                brasileiras, especialmente a Lei Federal nº 12.965/2014 (Marco
                Civil da Internet) e a Lei Federal nº 13.709/2018 (Lei Geral de
                Proteção de Dados Pessoais - LGPD).
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
                A <i>CPTrans</i> se compromete a cumprir as normas da LGPD e
                respeitar os seguintes princípios:
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
                  <strong>Controlador:</strong> <i>CPTrans</i>
                </p>
                <p className="text-gray-600 text-sm">
                  <strong>Encarregado (DPO):</strong> <i>Esther Faria Lima </i>
                  (Coordenadora de Segurança de Dados) - (24) 2237-1703 -
                  {' Ramal 242'}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">
                6. Tratamento dos dados
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                O tratamento de dados pessoais pela <i>CPTrans</i> é realizado
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
                A <i>CPTrans</i> se responsabiliza por:
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
                  <strong>Encarregado (DPO):</strong> Esther Faria Lima
                </p>
                <p className="text-sm">
                  <strong>E-mail:</strong> contato@cptrans.petropolis.rj.gov.br
                </p>
                <p className="text-sm">
                  <strong>Telefone:</strong> (24) 2246-9300
                </p>
                <p className="text-sm">
                  <strong>Endereço:</strong> Rua Alberto Torres, 115 - Centro,
                  Petrópolis - RJ, CEP 25610-060
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
                Fica eleito o Foro da Comarca de Petrópolis para dirimir
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
            Última atualização: 12 de Março de 2026
          </p>
          <Button type="button" variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
