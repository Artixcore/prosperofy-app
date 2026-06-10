type Props = {
  feeAmount: string;
  feeCurrency: string;
  cashbackRate: string;
};

export function CardHero({ feeAmount, feeCurrency, cashbackRate }: Props) {
  const feeLabel =
    feeCurrency.toUpperCase() === "USD" ? `$${feeAmount}` : `${feeAmount} ${feeCurrency}`;

  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-foreground">Prosperity Card</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Virtual card access for WFL users.
      </p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>Card fee: {feeLabel}</li>
        <li>Cashback destination: Save Wallet</li>
        <li>Funding source: Spend Wallet</li>
        <li>Eligible cashback rate: {cashbackRate}%</li>
      </ul>
    </section>
  );
}
