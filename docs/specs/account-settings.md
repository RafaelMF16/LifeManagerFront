# Spec: `account-settings` (front)

Módulo do mapa [`README.md`](README.md) (N1). Branch `feature/account-settings`, a partir da `dev`, nos dois repos. Contrato da API: [`LifeManager/docs/specs/account-settings.md`](../../../LifeManager/docs/specs/account-settings.md).

## Objetivo

Uma tela "Minha conta" para editar o nome, trocar a senha, sair de todos os aparelhos, baixar os dados e excluir a conta.

## Rota e módulo

- **Módulo novo:** `src/account/`, com namespace `account` registrado em `i18n.ts`, e as pastas `pages/`, `components/`, `services/`, `hooks/`, `validation/` e `locales/`.
- **Rota:** `/account` (protegida, dentro do `ProtectedRoute`, com rota `lazy` do `review-fixes`), com `Header` e `Footer` como a Home.
- **Acesso:** item "Minha conta" no menu do `Header`, entre o nome do usuário e Tema.

## Seções da página (uma coluna; cada seção é um cartão)

1. **Perfil:**
   - nome com o botão "Editar", que abre um `Dialog` com o campo (`userNameSchema`, o mesmo do cadastro);
   - o e-mail só para leitura.
   - Salvar atualiza o nome no `Header` na hora: o `useCurrentUser` vira um store (`useSyncExternalStore`, como o `usePrivacyMode`), com `setCurrentUserName`.
2. **Segurança:**
   - **"Trocar senha":** `Dialog` com a senha atual, a nova e a confirmação (`newPasswordSchema`, o mesmo da redefinição). `User.WrongPassword` aparece no campo da senha atual. Sucesso: toast "Senha alterada. Os outros aparelhos foram desconectados."
   - **"Sair de todos os aparelhos":** `ConfirmDialog` → `POST LogoutAll` → limpa o token local → `/auth`, com o toast "Você saiu de todos os aparelhos".
3. **Meus dados:**
   - "Baixar meus dados (JSON)": `fetch` com o token → `blob` → link temporário com `download`. O botão mostra "Preparando…" enquanto baixa.
   - 429: "Você já baixou há pouco. Tente de novo em alguns minutos."
4. **Zona de perigo** (borda `--danger`):
   - **"Excluir conta"** abre um `Dialog` (`alertdialog`) que explica:
     - "Sua conta e todos os dados serão apagados em **7 dias**";
     - "Entrar de novo até lá cancela";
     - "Grupos de ranking que você criou passam para o membro mais antigo".
   - Pede a senha e que se digite **EXCLUIR** (ou **DELETE** em inglês).
   - Confirmar → `POST Deletion` → limpa o token → `/auth`, com o toast "Exclusão agendada para dd/mm".
5. **Notificações:** a seção que o `habit-reminders` acrescenta depois. Este módulo só deixa o lugar.

## Cancelamento pelo login

Quando o `LoginResponseDto` traz `deletionCancelled: true`, o `LoginForm` mostra, depois da transição de entrada, o toast "Bem-vindo de volta! A exclusão da sua conta foi cancelada."

## Critérios de aceite

- Todas as ações funcionam a 360px, e os `Dialog`s são bottom sheet.
- O nome editado aparece no `Header` e no Perfil de Hábitos sem recarregar.
- **Trocar senha:** outro navegador logado cai para o login no próximo refresh, e este continua logado.
- O JSON baixado abre e tem o nome do arquivo com a data.
- **Excluir:** sem digitar a palavra, o botão fica desabilitado. Depois de confirmar, o app volta ao login. Entrar de novo mostra o aviso de cancelamento.
- Tour novo da tela "Minha conta", nas duas línguas, e `docs/fluxo-de-telas.md` atualizado.
- `npm test`, `npm run lint` e `npm run build` passam.

## Testes

- **Vitest:**
  - os schemas (troca de senha, confirmação da exclusão por idioma);
  - o mapa de erros;
  - o store do `useCurrentUser` (atualizar o nome avisa os assinantes);
  - o nome do arquivo e o download (`shared/utils/downloadBlob.ts`, reaproveitado pelo `transactions-export`);
  - o teste do tour.
- **Manual (usuário):** os critérios acima, com dois navegadores para a troca de senha.

## Arquivos

`src/account/**` (novo), `src/App.tsx` (rota), `src/i18n/i18n.ts`, `shared/components/Header/*`, `shared/hooks/useCurrentUser.ts`, `shared/services/authSession.ts` (`logoutAll`), `shared/utils/downloadBlob.ts` (+ teste), `auth/components/LoginForm/*`, `auth/types/*`, `shared/locales/*`, `CLAUDE.md` (módulo `account/`) e `docs/fluxo-de-telas.md`.
