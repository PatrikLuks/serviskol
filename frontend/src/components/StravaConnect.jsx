import React from 'react';

export default function StravaConnect() {
  const handleConnect = () => {
    window.location.href = '/api/integrations/strava/auth';
  };
  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow mt-8">
      <h2 className="text-lg font-bold mb-2">Propojení se Strava</h2>
      <p className="mb-2">Propojte svůj účet Strava a sledujte své aktivity přímo v ServisKol.</p>
      <button onClick={handleConnect} className="bg-orange-600 text-white px-4 py-2 rounded">Propojit se Strava</button>
    </div>
  );
}
