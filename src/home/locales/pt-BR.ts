export default {
  greeting: {
    morning: 'Bom dia',
    afternoon: 'Boa tarde',
    evening: 'Boa noite',
    withName: '{{greeting}}, {{name}}',
  },
  card: {
    error: 'Não foi possível carregar o resumo.',
    retry: 'Tentar de novo',
  },
  habits: {
    title: 'Hábitos',
    loading: 'Carregando os hábitos de hoje',
    progress_one: '{{done}} de {{count}} feito hoje',
    progress_other: '{{done}} de {{count}} feitos hoje',
    progressLabel: 'Hábitos feitos hoje',
    onlyAvoiding: 'Hoje é só manter os hábitos a evitar.',
    yesterdayPending_one: '{{count}} pendente de ontem',
    yesterdayPending_other: '{{count}} pendentes de ontem',
    bestStreak_one: '{{name}} · {{count}} dia de sequência',
    bestStreak_other: '{{name}} · {{count}} dias de sequência',
    relapses_one: '{{count}} recaída hoje',
    relapses_other: '{{count}} recaídas hoje',
    nothingToday: 'Nenhum hábito para hoje. Aproveite o descanso.',
    player: {
      level: 'Nível {{level}}',
      hp: '{{hp}}/{{maxHp}} HP',
      coins_one: '{{count}} moeda',
      coins_other: '{{count}} moedas',
    },
    goToToday: 'Ir para Hoje',
    new: {
      title: 'Comece pelo primeiro hábito',
      body: 'Escolha uma rotina pequena e marque todo dia para ganhar moedas e XP.',
      action: 'Criar primeiro hábito',
    },
  },
  modulesTitle: 'Módulos',
  modules: {
    financas: {
      name: 'Financeiro',
      description: 'Transações, categorias e resumos mensais.',
    },
    habitos: {
      name: 'Hábitos',
      description: 'Rotinas diárias e sequências em andamento.',
    },
  },
  moduleCard: {
    comingSoon: 'Em breve',
  },
} as const
