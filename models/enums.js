module.exports.order_status = Object.freeze({
    REFUNDED: 'Remboursée',
    VALIDATED: 'Validée',
    WAITING: 'En Attente'
});

module.exports.planning_status = Object.freeze({
    WAITING: 'En Attente',
    VALIDATED: 'Validé',
    ABSENT_WITHOUT_EXCUSES: 'Absent avec excuses',
    ABSENT_WITH_EXCUSES: 'Absent sans excuses'
});

module.exports.cash_funds_operations_type = Object.freeze({
    EXCEPTIONAL: 'Exceptionnelle',
    ORDINARY: 'Ordinaire'
});

module.exports.transaction_means = Object.freeze({
    CARD: 'Carte Bleue',
    CHECK: 'Chèque',
    LIQUID: 'Liquide',
    POINTS: 'Points',
    LYDIA: 'Lydia',
    DEPOSITE: 'Versement'
});

module.exports.transaction_type = Object.freeze({
    SERVICE: 'Service',
    GIFT: 'Cadeau',
    RELOADING: 'Rechargement',
    REFUNDING: 'Remboursement',
    PURCHASE: 'Achat',
    REFUNDING_GAS: 'Remboursement Essence',
    ACCOUNT_CLOSING: 'Solde Compte',
    ACCOUNT_CREDITING: 'Crédit Compte'
});

// TODO: Add permmissions enum
