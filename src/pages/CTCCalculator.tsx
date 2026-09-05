import React, { useState, useMemo } from 'react';
import { Calculator, Info, IndianRupee } from 'lucide-react';

export default function CTCCalculator() {
  const [ctc, setCtc] = useState<string>('600000');
  const [basicPercent, setBasicPercent] = useState<string>('40');

  const breakdown = useMemo(() => {
    const annualCtc = parseFloat(ctc) || 0;
    const basicRatio = (parseFloat(basicPercent) || 40) / 100;
    
    // Assumptions
    const basicAnnual = annualCtc * basicRatio;
    const employerPfAnnual = basicAnnual * 0.12;
    const employeePfAnnual = basicAnnual * 0.12;
    
    // Gross Salary = CTC - Employer PF
    const grossAnnual = annualCtc - employerPfAnnual;
    const grossMonthly = grossAnnual / 12;
    
    // Deductions
    const employeePfMonthly = employeePfAnnual / 12;
    const ptMonthly = 200; // Standard professional tax estimate
    const ptAnnual = ptMonthly * 12;

    // Income Tax (New Regime FY 2024-25 / AY 2025-26)
    const standardDeduction = 75000; // Updated budget 2024 standard deduction
    const taxableIncome = Math.max(0, grossAnnual - standardDeduction);

    let annualTax = 0;
    if (taxableIncome > 700000) {
      // Slabs: 0-3L(0%), 3-7L(5%), 7-10L(10%), 10-12L(15%), 12-15L(20%), >15L(30%)
      if (taxableIncome > 300000) annualTax += Math.min(400000, taxableIncome - 300000) * 0.05;
      if (taxableIncome > 700000) annualTax += Math.min(300000, taxableIncome - 700000) * 0.10;
      if (taxableIncome > 1000000) annualTax += Math.min(200000, taxableIncome - 1000000) * 0.15;
      if (taxableIncome > 1200000) annualTax += Math.min(300000, taxableIncome - 1200000) * 0.20;
      if (taxableIncome > 1500000) annualTax += (taxableIncome - 1500000) * 0.30;
      
      // Marginal relief (simplified) is ignored for basic fresher tool, but let's add 4% cess
      annualTax = annualTax * 1.04;
    }

    const tdsMonthly = annualTax / 12;
    const netMonthly = grossMonthly - employeePfMonthly - ptMonthly - tdsMonthly;

    return {
      grossMonthly,
      employeePfMonthly,
      ptMonthly,
      tdsMonthly,
      netMonthly,
      annualTax
    };
  }, [ctc, basicPercent]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.max(0, val));
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-amber-500" />
          CTC to In-Hand Calculator
        </h1>
        <p className="text-gray-600 text-lg">
          Estimate your actual monthly take-home salary after standard Indian deductions.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Input Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Annual CTC (INR)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={ctc}
                  onChange={(e) => setCtc(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm"
                  placeholder="e.g. 600000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Basic Pay % of CTC <span className="text-gray-400 font-normal">(Default: 40%)</span>
              </label>
              <input
                type="number"
                value={basicPercent}
                onChange={(e) => setBasicPercent(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 shadow-sm"
                placeholder="40"
              />
            </div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-3xl shadow-sm border border-amber-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Monthly Breakdown</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-amber-200/50">
              <span className="text-gray-600 font-medium">Gross Monthly</span>
              <span className="text-gray-900 font-bold">{formatCurrency(breakdown.grossMonthly)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-amber-200/50">
              <span className="text-gray-600">Employee PF (12% of Basic)</span>
              <span className="text-red-600">- {formatCurrency(breakdown.employeePfMonthly)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-amber-200/50">
              <span className="text-gray-600">Professional Tax (Est.)</span>
              <span className="text-red-600">- {formatCurrency(breakdown.ptMonthly)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-amber-200/50">
              <span className="text-gray-600">TDS (New Regime)</span>
              <span className="text-red-600">- {formatCurrency(breakdown.tdsMonthly)}</span>
            </div>
            
            <div className="pt-4">
              <div className="flex justify-between items-center p-4 bg-white rounded-xl border border-amber-200 shadow-sm">
                <span className="text-lg font-bold text-gray-900">Net In-Hand</span>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(breakdown.netMonthly)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-gray-50 rounded-2xl p-6 border border-gray-100 flex gap-4">
        <Info className="w-6 h-6 text-gray-400 flex-shrink-0" />
        <div className="text-sm text-gray-500 space-y-2">
          <p><strong>Disclaimer:</strong> This is a simplified estimate intended for freshers evaluating job offers. Actual in-hand salary will vary based on:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your exact company compensation structure (e.g., allowances, performance bonuses, gratuity deductions).</li>
            <li>State-specific professional tax rules (usually ₹150 - ₹200).</li>
            <li>Whether your CTC figure already includes the Employer's PF contribution (we assume it does, which is standard practice in India).</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
