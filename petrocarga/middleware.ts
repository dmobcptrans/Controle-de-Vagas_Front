import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const COOKIE_NAME = 'auth-token';

type UserRole = 'gestor' | 'motorista' | 'agente' | 'admin';

interface JwtPayload {
  permissao: string;
  exp: number;
}

const publicRoutes = [
  '/',
  '/quemsomos',
  '/contato',
  '/autorizacao/login',
  '/autorizacao/cadastro',
  '/autorizacao/verificacao',
  '/autorizacao/nova-senha',
];

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) =>
    route === '/' ? pathname === '/' : pathname.startsWith(route)
  );
}

function getHomeByRole(role: string): string {
  const homes: Record<string, string> = {
    gestor: '/gestor/visualizar-vagas',
    motorista: '/motorista/dashboard',
    agente: '/agente/home',
    admin: '/gestor/visualizar-vagas',
  };
  return homes[role.toLowerCase()] || '/autorizacao/login';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  // Tenta decodificar apenas para pegar a ROLE e redirecionar da Home/Login
  // Se não conseguir ler (pq o cookie está em outro domínio), assumimos null.
  let decoded: JwtPayload | null = null;
  if (token) {
    try {
      decoded = jwtDecode<JwtPayload>(token);
    } catch (err) {
      decoded = null;
    }
  }

  // 1. SE ESTIVER EM ROTA PÚBLICA (Login/Home)
  // E o middleware conseguir ver o token (o que pode não acontecer em localhost x cloud run),
  // redireciona para o painel.
  if (isPublicRoute(pathname)) {
    if (decoded) {
      const homeUrl = getHomeByRole(decoded.permissao);
      return NextResponse.redirect(new URL(homeUrl, request.url));
    }
    return NextResponse.next();
  }

  // 2. SE ESTIVER EM ROTA PROTEGIDA
  // ⚠️ MUDANÇA CRÍTICA: Não bloqueamos mais aqui.
  // Como o cookie pode estar invisível para o middleware (Cross-Domain),
  // deixamos a requisição passar.
  // Quem vai barrar o usuário é o `AuthContext` no Client-Side quando o /me falhar.

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|offline|.*\\..*).*)',
  ],
};
