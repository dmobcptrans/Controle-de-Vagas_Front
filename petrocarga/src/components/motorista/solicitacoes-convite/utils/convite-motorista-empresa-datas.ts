/**
 * --------------------------------------------------------------------------
 * HELPERS DE DATA — convites motorista/empresa
 * --------------------------------------------------------------------------
 */

/**
 * Converte:
 * "28/08/2026 12:44:29"
 * para um objeto Date.
 */
export function parseData(data: string) {
  try {
    const [dataParte, horaParte] = data.split(' ');

    const [dia, mes, ano] = dataParte.split('/').map(Number);

    const [hora = 0, minuto = 0, segundo = 0] = (horaParte ?? '')
      .split(':')
      .map(Number);

    return new Date(ano, mes - 1, dia, hora, minuto, segundo);
  } catch {
    return null;
  }
}

/**
 * Mostra somente a data:
 * 28/08/2026
 */
export function formatarData(data: string) {
  const date = parseData(data);

  if (!date) {
    return data;
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Calcula a expiração do convite.
 *
 * O convite expira 7 dias após a criação.
 */
export function calcularDataExpiracao(data: string) {
  const dataCriacao = parseData(data);

  if (!dataCriacao) {
    return null;
  }

  const dataExpiracao = new Date(dataCriacao);

  dataExpiracao.setDate(dataExpiracao.getDate() + 7);

  return dataExpiracao;
}

/**
 * Retorna somente a quantidade de DIAS restantes.
 *
 * Exemplo:
 * - Criado hoje       -> 7 dias
 * - Amanhã            -> 6 dias
 * - Faltam 2 dias     -> 2 dias
 * - Data de expiração -> expirado
 */
export function calcularDiasRestantes(data: string) {
  const expiracao = calcularDataExpiracao(data);

  if (!expiracao) {
    return null;
  }

  const agora = new Date();

  // Zera o horário para comparar somente as datas
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

  const dataExpiracao = new Date(
    expiracao.getFullYear(),
    expiracao.getMonth(),
    expiracao.getDate(),
  );

  const diferenca = dataExpiracao.getTime() - hoje.getTime();

  const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));

  return {
    expirado: dias <= 0,
    dias: Math.max(0, dias),
  };
}