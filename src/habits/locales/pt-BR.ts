export default {
  module: {
    label: 'Módulo',
    name: 'Hábitos',
  },
  sidebar: {
    navAria: 'Navegação do módulo Hábitos',
    items: {
      today: 'Hoje',
      habits: 'Hábitos',
      shop: 'Loja',
      history: 'Histórico',
    },
  },
  player: {
    aria: 'Seu personagem',
    loading: 'Carregando seu personagem…',
    level: 'Nível {{level}}',
    levelShort: 'Nv {{level}}',
    hp: 'HP',
    hpAria: 'Pontos de vida',
    hpValue: '{{hp}}/{{max}}',
    xp: 'XP',
    xpAria: 'Experiência até o nível {{next}}',
    xpValue: '{{xp}}/{{max}} XP',
    coins: 'Moedas',
    coinsAria: 'Moedas: {{count}}',
    freezes: 'Proteções de ofensiva',
    freezesAria: 'Proteções de ofensiva: {{count}} de {{max}}',
    freezesValue: '{{count}}/{{max}}',
  },
  today: {
    title: 'Hoje',
    empty: {
      title: 'Nenhum hábito por aqui ainda',
      message: 'Seus hábitos de hoje vão aparecer aqui. Comece com 1 a 3 hábitos fáceis.',
    },
  },
} as const
