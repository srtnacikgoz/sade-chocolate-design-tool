import React from 'react';
import { DollarSign } from 'lucide-react';

interface CostSummaryProps {
    unitCost: number;
    totalCost: number;
    quantity: number;
}

const CostSummary: React.FC<CostSummaryProps> = ({ unitCost, totalCost, quantity }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
            <h3 className="text-lg font-serif font-bold text-brand-dark mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-brand-gold" />
                Cost Estimation
            </h3>

            <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-stone-50">
                    <span className="text-stone-500">Unit Cost</span>
                    <span className="font-mono font-medium text-brand-dark">${unitCost.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-stone-50">
                    <span className="text-stone-500">Quantity</span>
                    <span className="font-mono font-medium text-brand-dark">{quantity}</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <span className="font-medium text-brand-dark">Total Estimated</span>
                    <span className="font-serif font-bold text-2xl text-brand-dark">${totalCost.toFixed(2)}</span>
                </div>
            </div>

            <div className="mt-6 p-3 bg-brand-mint/30 rounded-lg text-xs text-green-800 leading-relaxed">
                <strong>Note:</strong> Volume discount applied for orders over 1000 units.
            </div>
        </div>
    );
};

export default CostSummary;
