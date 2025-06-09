"use client";
export default function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-10 text-center">
          <div>
            <div className="text-blue-600 text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Browse Listings</h3>
            <p className="text-gray-600">
              Find rent-to-own homes that match your preferences and location.
            </p>
          </div>
          <div>
            <div className="text-blue-600 text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Apply & Sign</h3>
            <p className="text-gray-600">
              Apply easily and sign the agreement digitally through our
              platform.
            </p>
          </div>
          <div>
            <div className="text-blue-600 text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold mb-2">Move In & Pay</h3>
            <p className="text-gray-600">
              Move in right away and pay monthly towards your future ownership.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
