import { AuthContext } from '@/context/AuthContext';
import { useContext } from 'react';

/**
 * @hook useAuth
 * @version 1.0.0
 * 
 * @description Hook customizado para acessar o contexto de autenticação.
 * Fornece acesso às informações do usuário, status de autenticação e funções de login/logout.
 * 
 * ----------------------------------------------------------------------------
 * 📋 RETORNO:
 * ----------------------------------------------------------------------------
 * 
 * @property {User | null} user - Dados do usuário autenticado (ou null se não autenticado)
 * @property {boolean} isAuthenticated - Indica se o usuário está autenticado
 * @property {boolean} loading - Estado de carregamento da autenticação
 * @property {function} login - Função para realizar login
 * @property {function} logout - Função para realizar logout
 * 
 * ----------------------------------------------------------------------------
 * 📋 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * 1. VALIDAÇÃO:
 *    - Verifica se o hook está sendo usado dentro de um AuthProvider
 *    - Lança erro se usado fora do contexto apropriado
 * 
 * 2. RETORNO:
 *    - Retorna o valor completo do contexto de autenticação
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - GUARD CLAUSE: Garante que o hook só seja usado dentro do provider correto
 * - TIPAGEM FORTE: Retorna o tipo definido pelo AuthContext
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - AuthContext: Contexto de autenticação
 * - AuthProvider: Provider que envolve a aplicação
 * 
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const { user, isAuthenticated, logout } = useAuth();
 * 
 *   if (!isAuthenticated) {
 *     return <Navigate to="/login" />;
 *   }
 * 
 *   return (
 *     <div>
 *       <h1>Olá, {user?.nome}!</h1>
 *       <button onClick={logout}>Sair</button>
 *     </div>
 *   );
 * }
 * ```
 * 
 * @throws {Error} Se o hook for usado fora de um AuthProvider
 */

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}