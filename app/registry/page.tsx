export const metadata = {
  title: "Gift Registry — Enid & Jason",
};

const FUNDS = [
  {
    icon: "🛶",
    title: "Honeymoon Fund",
    text: "Help us set sail on the adventure after the adventure — flights, boat rides and one very nice hotel breakfast.",
  },
  {
    icon: "🍝",
    title: "Date Nights Forever",
    text: "Contribute to a lifetime supply of pasta dates, from Gargnano trattorias to our kitchen at home.",
  },
  {
    icon: "🏡",
    title: "Our First Home",
    text: "Every brick counts. Help us build the place where all our friends will crash after the next party.",
  },
];

export default function RegistryPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-pixel text-sm text-sage-dark text-center">GIFT REGISTRY</h1>
      <p className="text-center mt-6 text-xl text-ink/80 leading-relaxed">
        Your presence at Lake Garda is truly the greatest gift — many of you are crossing
        oceans to be there, and that means the world to us.
      </p>
      <p className="text-center mt-4 text-xl text-ink/80 leading-relaxed">
        If you&apos;d still like to give something, a contribution to one of these funds
        would make us very happy.
      </p>

      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {FUNDS.map((f) => (
          <div
            key={f.title}
            className="bg-white/60 border border-gold/25 rounded-2xl p-6 text-center shadow-sm"
          >
            <div className="text-4xl">{f.icon}</div>
            <h2 className="text-2xl font-semibold mt-3">{f.title}</h2>
            <p className="mt-2 text-ink/70 leading-relaxed">{f.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-parchment rounded-2xl p-6 text-center">
        <p className="text-lg text-ink/75">
          Bank transfer and payment details will be shared here closer to the date — or
          replace this block with links to your registry of choice (Prezola, Zola, Amazon,
          etc.).
        </p>
      </div>
    </div>
  );
}
