import {
  getDisponibilidadeVagas,
  addDisponibilidadeVagas,
  editarDisponibilidadeVagas,
  deleteDisponibilidadeVagas,
} from '@/lib/api/disponibilidadeVagasApi';

// -------------------------------------------------------
// GET — Carregar todas as disponibilidades
// -------------------------------------------------------
export async function fetchDisponibilidades() {
  return await getDisponibilidadeVagas();
}

// -------------------------------------------------------
// POST — Criar disponibilidade
// -------------------------------------------------------
export async function postDisponibilidade(
  vagaIds: string[],
  inicio: string,
  fim: string
) {
  const form = new FormData();

  vagaIds.forEach((id) => form.append('vagaid', id));
  form.append('inicio', inicio);
  form.append('fim', fim);

  return await addDisponibilidadeVagas(form);
}

// -------------------------------------------------------
// PUT — Editar disponibilidade
// -------------------------------------------------------
export async function updateDisponibilidade(
  id: string,
  vagaId: string,
  inicio: string,
  fim: string
) {
  return await editarDisponibilidadeVagas(id, vagaId, inicio, fim);
}

// -------------------------------------------------------
// DELETE — Deletar disponibilidade por ID
// -------------------------------------------------------
export async function removeDisponibilidade(id: string) {
  return await deleteDisponibilidadeVagas(id);
}
