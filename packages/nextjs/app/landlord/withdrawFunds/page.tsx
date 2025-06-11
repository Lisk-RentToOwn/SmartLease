"use client";

import React, { useState } from "react";

export default function WithdrawFundsPage() {
  const initialBalance = 15780.25;
  const [balance, setBalance] = useState(initialBalance);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Smart Wallet (0x71...3F4d)");
  const [lastUpdated, setLastUpdated] = useState("Today at 09:45 AM");

  const handleWithdraw = () => {
    const numericAmount = parseFloat(amount);

    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }

    if (numericAmount > balance) {
      alert("You cannot withdraw more than your available balance.");
      return;
    }

    // Simulate successful withdrawal
    setBalance((prev) => prev - numericAmount);
    setAmount(""); // Reset the input
    setLastUpdated(new Date().toLocaleTimeString());
    alert(`Successfully withdrew $${numericAmount.toFixed(2)} to ${method}`);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-2">Withdraw Funds</h2>

      <p className="text-2xl font-bold text-gray-800">${balance.toFixed(2)}</p>
      <p className="text-sm text-gray-500 mb-4">Last updated: {lastUpdated}</p>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Withdrawal Amount
      </label>
      <input
        type="number"
        placeholder="$ 0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
      />

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Withdrawal Method
      </label>
      <select
        value={method}
        onChange={(e) => setMethod(e.target.value)}
        className="w-full px-4 py-2 mb-6 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
      >
        <option>Smart Wallet (0x71...3F4d)</option>
        {/* More options to be added later */}
      </select>

      <button
        onClick={handleWithdraw}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-semibold"
      >
        Withdraw Funds
      </button>

      <p className="text-xs text-center text-gray-400 mt-2">
        Secured by smart contract
      </p>
    </div>
  );
}
