import React from 'react';

export default function Help() {
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h1 className="text-2xl font-bold mb-4">Nápověda & FAQ</h1>
      <h2 className="text-lg font-semibold mt-4 mb-2">Nejčastější dotazy</h2>
      <ul className="list-disc ml-6 mb-4">
        <li><b>Jak přidám nové kolo?</b> – V menu zvolte „Přidat kolo“ a vyplňte základní údaje.</li>
        <li><b>Jak funguje servisní kniha?</b> – U každého kola můžete přidávat, editovat a exportovat servisní záznamy.</li>
        <li><b>Co je AI dotazník?</b> – Pomůže vám určit vhodný servis na základě příznaků a používání kola.</li>
        <li><b>Jak získám věrnostní body?</b> – Za servis, aktivitu v chatu, doporučení a další akce.</li>
        <li><b>Jak kontaktovat technika?</b> – Použijte chat v detailu kola.</li>
        <li><b>Jak exportuji data?</b> – Na domovské stránce najdete tlačítko pro export servisní historie.</li>
      </ul>
      <h2 className="text-lg font-semibold mt-4 mb-2">Kontakt na podporu</h2>
      <div className="mb-2">E-mail: <a href="mailto:podpora@serviskol.cz" className="text-primary-dark underline">podpora@serviskol.cz</a></div>
      <div>Máte další dotaz? Napište nám nebo využijte chat v aplikaci.</div>
    </div>
  );
}
