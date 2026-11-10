# Spec: `habit-reminders` (front)

Módulo do mapa [`README.md`](README.md) (N3). Branch `feature/habit-reminders`, a partir da `dev`, nos dois repos, **depois** do `pwa` (e, de preferência, do `account-settings`, que tem o lugar da seção Notificações). Contrato da API: [`LifeManager/docs/specs/habit-reminders.md`](../../../LifeManager/docs/specs/habit-reminders.md).

## Objetivo

Escolher um horário de lembrete por hábito e receber a notificação no celular quando o hábito ainda não foi feito.

## Escopo

1. **Horário no hábito** (`HabitFormModal`):
   - campo "Lembrete" com um `Select` "Sem lembrete" / 06:00 … 23:00;
   - só para hábitos **a construir**: some ao trocar para "evitar", e o valor vira `null`;
   - `toRequestDto` envia `reminderHour`;
   - `HabitList` e o detalhe do hábito mostram um sino com a hora.
2. **Ativar neste aparelho** (seção "Notificações" da tela Minha conta; até ela existir, um cartão no topo da tela Hoje):
   - **Estados**, vindos da função pura `shared/utils/pushSupport.ts`:
     - não suportado;
     - iOS fora do app instalado ("Instale o app para receber lembretes", com o link para as instruções do `pwa`);
     - permissão negada ("Libere nas configurações do navegador");
     - desativado;
     - ativado.
   - **"Ativar lembretes":**
     1. `Notification.requestPermission()`, **só no clique**: nunca pedir ao abrir a página;
     2. `GET /api/Push/PublicKey`;
     3. `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })`;
     4. `PUT /api/Push/Subscriptions`, com `label` = navegador · sistema.
   - **"Desativar":** `unsubscribe()` e `DELETE`.
   - **No logout:** o `useLogout` apaga a assinatura deste aparelho antes de sair, para a próxima pessoa no mesmo celular não receber lembretes de outra conta. Uma falha não bloqueia o logout.
3. **Service worker** (`src/sw.ts`, do `pwa`):
   - **`push`:** lê `{ title, body, url, tag }` e chama `showNotification` com o ícone 192, o `badge` e o `tag` (agrupa em vez de empilhar).
   - **`notificationclick`:** foca uma aba aberta do app e navega para `url`, ou abre uma janela nova.

## Critérios de aceite

- **Android (Chrome):** ativar, criar um hábito com lembrete na próxima hora cheia e não marcar. A notificação chega entre HH:05 e HH:10, e tocar nela abre a tela Hoje.
- **iPhone (iOS ≥ 16.4, app instalado):** o mesmo. **Fora do app instalado:** a mensagem de instalar.
- Marcar o hábito antes da hora: nenhuma notificação.
- **Desativar ou sair da conta:** nenhuma notificação depois.
- A permissão nunca é pedida sem um clique.
- `npm test`, `npm run lint` e `npm run build` passam.

## Testes

- **Vitest:**
  - `pushSupport` (cada estado);
  - a conversão da chave VAPID (base64url → `Uint8Array`, `shared/utils/vapidKey.ts`);
  - o `habitSchema` com `reminderHour`;
  - o `toRequestDto`.
- **Manual (usuário, celular real, com o build de produção, porque o service worker não roda no dev server):** os critérios acima.

## Docs

`CLAUDE.md` (Habits: lembrete; PWA: o `push`) e `docs/fluxo-de-telas.md` (o campo Lembrete e a seção Notificações).

## Arquivos

`habits/components/HabitFormModal/*`, `habits/validation/habitSchema.ts` (+ teste), `habits/types/HabitDtos.ts`, `habits/components/HabitList/*`, `habits/pages/HabitDetailsPage.tsx`, `account/components/NotificationsSection/` (novo), `shared/services/pushService.ts`, `shared/utils/pushSupport.ts` e `vapidKey.ts` (+ testes), `shared/hooks/useLogout.ts`, `src/sw.ts`, as locales, `CLAUDE.md` e `docs/fluxo-de-telas.md`.
