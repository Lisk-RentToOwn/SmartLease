"use client";
export default function Hero() {
  return (
    <section className="pt-28 bg-blue-50 text-center">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Own Your Dream Home with Ease
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8">
          Rent to own properties designed to help you own a home at your pace.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
            Browse Properties
          </button>
          <button className="bg-white border border-blue-600 text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
}
