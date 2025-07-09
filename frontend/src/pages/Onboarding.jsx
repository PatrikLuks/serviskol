import React from 'react';
import { Link } from 'react-router-dom';

export default function Onboarding() {
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Vítejte v ServisKol!</h1>
      <ol className="list-decimal ml-6 mb-4">
        <li>Zaregistrujte se a přihlaste do aplikace.</li>
        <li>Přidejte své kolo a jeho komponenty.</li>
        <li>Vytvořte první servisní záznam nebo využijte AI dotazník pro doporučení servisu.</li>
        <li>Komunikujte s technikem přes chat.</li>
        <li>Sledujte věrnostní body, úrovně a odznaky za aktivitu.</li>
        <li>Exportujte si servisní historii nebo sledujte počasí pro vaše vyjížďky.</li>
      </ol>
      <div className="mb-2">Potřebujete poradit? Kontaktujte podporu nebo si projděte <Link to="/help" className="text-primary-dark underline">nápovědu</Link>.</div>
      <Link to="/register" className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded font-semibold">Začít</Link>
    </div>
  );
}
