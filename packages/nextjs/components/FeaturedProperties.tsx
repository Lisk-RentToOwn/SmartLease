"use client";
export default function FeaturedProperties() {
  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          Featured Properties
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="bg-white shadow-lg rounded-xl overflow-hidden"
            >
              <div className="bg-gray-300 h-48"></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">3-Bedroom House</h3>
                <p className="text-gray-600 mb-4">Nairobi, Kenya</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
