export interface UtilityTier {
  from: number;
  to: number | null;
  price: number;
}

export const DEFAULT_ELECTRICITY_TIERS_VN: UtilityTier[] = [
  {from: 0, to: 50, price: 1806},
  {from: 51, to: 100, price: 1866},
  {from: 101, to: 200, price: 2167},
  {from: 201, to: 300, price: 2729},
  {from: 301, to: 400, price: 3050},
  {from: 401, to: null, price: 3151},
];

export function calculateTieredAmount(
  usage: number,
  tiers: UtilityTier[] = DEFAULT_ELECTRICITY_TIERS_VN,
) {
  if (usage <= 0) {
    return 0;
  }

  return tiers.reduce((total, tier) => {
    if (usage < tier.from) {
      return total;
    }

    const tierEnd = tier.to ?? usage;
    const firstUnit = tier.from === 0 ? 0 : tier.from - 1;
    const units = Math.min(usage, tierEnd) - firstUnit;
    return total + Math.max(units, 0) * tier.price;
  }, 0);
}

export function parseMoneyInput(value: string) {
  const amount = parseInt(value.replace(/\D/g, ''), 10);
  return Number.isNaN(amount) ? 0 : amount;
}
