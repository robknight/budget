type Currency = "USD";

const currencies = {
  "USD": { symbol: "$" }
}

export interface Money {
  amount: number;
  currency: Currency;
}

export function create(amount: number, currency: Currency): Money {
  return { amount, currency };
}

export function lessThan(a: Money, b: Money): Boolean {
  return a.amount < b.amount;
}

export function greaterThan(a: Money, b: Money): Boolean {
  return a.amount > b.amount;
}

export function add(a: Money, b: Money): Money {
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function subtract(a: Money, b: Money): Money {
  return { amount: a.amount - b.amount, currency: b.currency };
}

export function getCurrencyInfo(currency: Currency) {
  return currencies[currency];
}

export function isPositive(money: Money): Boolean {
  return money.amount > 0;
}

export function fromDecimal(dec: number, currency: Currency): Money {
  return { amount: dec * 100, currency };
}

export function print(money: Money) {
  return (money.amount / 100).toFixed(2);
}