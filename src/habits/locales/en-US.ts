export default {
  module: {
    label: 'Module',
    name: 'Habits',
  },
  sidebar: {
    navAria: 'Habits module navigation',
    items: {
      today: 'Today',
      habits: 'Habits',
      shop: 'Shop',
      history: 'History',
    },
  },
  player: {
    aria: 'Your character',
    loading: 'Loading your character…',
    level: 'Level {{level}}',
    levelShort: 'Lv {{level}}',
    hp: 'HP',
    hpAria: 'Health points',
    hpValue: '{{hp}}/{{max}}',
    xp: 'XP',
    xpAria: 'Experience to level {{next}}',
    xpValue: '{{xp}}/{{max}} XP',
    coins: 'Coins',
    coinsAria: 'Coins: {{count}}',
    freezes: 'Streak freezes',
    freezesAria: 'Streak freezes: {{count}} of {{max}}',
    freezesValue: '{{count}}/{{max}}',
  },
  today: {
    title: 'Today',
    empty: {
      title: 'No habits here yet',
      message: "Today's habits will show up here. Start with 1 to 3 easy habits.",
    },
  },
} as const
