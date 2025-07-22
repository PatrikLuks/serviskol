import React from 'react';
import FeedbackForm from '../components/FeedbackForm';
import WidgetBox from '../components/WidgetBox';

// Moderní landing page podle strategického plánu
const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Hero sekce */}
      <header className="py-12 px-4 text-center bg-white shadow-sm">
        <img src="/logo192.png" alt="Serviskol logo" className="mx-auto mb-4 w-20 h-20" />
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2">Serviskol</h1>
        <p className="text-lg text-gray-700 mb-6">Moderní platforma pro servisní týmy s AI, gamifikací a reportingem</p>
        <a href="/register" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition">Začít zdarma</a>
      </header>

      {/* Jak Serviskol pomáhá */}
      <section className="py-12 px-4 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-blue-600 text-4xl mb-2">🏆</span>
          <h3 className="font-bold mb-1">Gamifikace</h3>
          <p className="text-gray-600 text-sm text-center">Motivujte tým soutěživě a sledujte výsledky v reálném čase.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-blue-600 text-4xl mb-2">🤖</span>
          <h3 className="font-bold mb-1">AI reporty</h3>
          <p className="text-gray-600 text-sm text-center">Automatizované analýzy a doporučení pro efektivnější provoz.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-blue-600 text-4xl mb-2">🛠️</span>
          <h3 className="font-bold mb-1">Správa zakázek</h3>
          <p className="text-gray-600 text-sm text-center">Přehledná evidence a workflow pro všechny servisní požadavky.</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
          <span className="text-blue-600 text-4xl mb-2">💬</span>
          <h3 className="font-bold mb-1">Zpětná vazba</h3>
          <p className="text-gray-600 text-sm text-center">Získejte cenné postřehy od zákazníků i týmu.</p>
        </div>
      </section>

      {/* Ukázka dashboardu */}
      <section className="py-12 px-4 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Ukázka dashboardu</h2>
        <img src="/dashboard-demo.png" alt="Ukázka dashboardu" className="mx-auto rounded-xl shadow-lg border" style={{maxHeight: 320}} />
      </section>

      {/* Reference */}
      <section className="py-8 px-4 bg-blue-50">
        <h2 className="text-xl font-bold text-center mb-6 text-blue-700">Co říkají naši uživatelé</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <p className="italic text-gray-700 mb-2">„Serviskol nám zjednodušil práci a tým je motivovanější.“</p>
            <div className="text-sm text-gray-500">— Jana, vedoucí servisu</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="italic text-gray-700 mb-2">„AI reporty nám šetří hodiny analýz každý měsíc.“</p>
            <div className="text-sm text-gray-500">— Petr, manažer kvality</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <p className="italic text-gray-700 mb-2">„Díky gamifikaci máme lepší výsledky i atmosféru.“</p>
            <div className="text-sm text-gray-500">— Lucie, HR</div>
          </div>
        </div>
      </section>

      {/* Bezpečnost a důvěra */}
      <section className="py-8 px-4 max-w-3xl mx-auto text-center">
        <h2 className="text-lg font-bold mb-2 text-blue-700">Bezpečnost a důvěra</h2>
        <p className="text-gray-600 mb-2">Vaše data jsou chráněna podle GDPR a nejvyšších bezpečnostních standardů. Serviskol je provozován v EU a podporuje dvoufaktorové ověření.</p>
        <div className="flex justify-center gap-4 mt-4">
          <img src="/gdpr.svg" alt="GDPR" className="h-10" />
          <img src="/secure.svg" alt="Bezpečnost" className="h-10" />
        </div>
      </section>

      {/* Zpětná vazba */}
      <section className="py-8 px-4 max-w-2xl mx-auto">
        <WidgetBox title="Zpětná vazba">
          <FeedbackForm />
        </WidgetBox>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 px-4 bg-white border-t text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} Serviskol. Všechna práva vyhrazena. | <a href="mailto:info@serviskol.cz" className="text-blue-600 hover:underline">Kontakt</a>
      </footer>
    </div>
  );
};

export default Landing;
