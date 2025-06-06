"use client";
export default function Navbar() {
  return (
    <header className="w-full bg-white shadow-md fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold text-blue-600">SmartLease</div>
        <nav className="space-x-6">
          <a href="#" className="text-gray-700 hover:text-blue-600">
            Home
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-600">
            Browse
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-600">
            How It Works
          </a>
          <a href="#" className="text-gray-700 hover:text-blue-600">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
