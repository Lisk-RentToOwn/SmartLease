"use client";
export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Clients Say
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="bg-blue-50 p-6 rounded-xl shadow">
              <p className="text-gray-700 italic mb-4">
                “RentToOwn helped me get a home I never thought I could afford.
                Transparent, smooth, and easy.”
              </p>
              <div className="text-blue-600 font-semibold">Jane Doe</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
