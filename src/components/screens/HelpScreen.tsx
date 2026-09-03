import React, { useState } from 'react';
import { Phone, MessageSquare, ChevronDown, ChevronUp, ShieldCheck, Clock, HelpCircle, MapPin } from 'lucide-react';

export const HelpScreen: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does pricing work?',
      a: 'KaamWala displays upfront starting prices and honest price ranges for standard labour in Kadi. If replacement parts (like a brass tap, fan capacitor, or copper pipe) are required, the professional will inform you of the material cost and seek your approval before purchasing or installing.'
    },
    {
      q: 'How are professionals verified in Kadi?',
      a: 'Every KaamWala professional goes through a strict in-person verification process at our local operations desk: Government photo ID check, residential address confirmation in Kadi taluka, minimum 3 years of trade experience, and police background clearance.'
    },
    {
      q: 'How does cancellation work?',
      a: 'You can cancel free of charge at any time before the professional reaches your location. Once the professional is physically on site and has completed inspection, a minimal ₹99 visit fee applies only if you choose not to proceed with the recommended repair.'
    },
    {
      q: 'What if the professional doesn’t arrive on time?',
      a: 'Our dispatch team monitors every active booking. If a technician is held up at an earlier job, we notify you immediately and can dispatch a nearby backup technician from our Kadi network.'
    },
    {
      q: 'What if the final price changes from the estimate?',
      a: 'Estimates cover standard repair scenarios. If your plumbing or electrical system has hidden damage requiring extra labour or scaffolding, the professional must provide a revised quote for your consent before beginning the extra work.'
    }
  ];

  return (
    <div className="pb-24 animate-in fade-in duration-150 px-5 pt-3">
      {/* Help Hero / Emergency Support */}
      <div className="bg-[#075B43] text-white p-4 rounded-2xl shadow-2xs mb-5">
        <h2 className="text-base font-bold">Need Help or have an issue?</h2>
        <p className="text-xs text-emerald-100 mt-1">
          Our Kadi Operations Desk is active daily 7:00 AM – 9:00 PM
        </p>

        {/* Contact Buttons */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
          <button
            onClick={() => {
              try {
                window.open('tel:+919825100000', '_self');
              } catch {}
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white text-[#075B43] font-bold text-xs rounded-xl hover:bg-emerald-50 transition-colors shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Support</span>
          </button>
          <button
            onClick={() => {
              try {
                window.open('https://wa.me/919825100000?text=Hi%20KaamWala%20Support%2C%20I%20need%20help%20with%20a%20service%20in%20Kadi.', '_blank', 'noopener,noreferrer');
              } catch {}
            }}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#F5B51B] text-[#111817] font-bold text-xs rounded-xl hover:bg-[#E5A817] transition-colors shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E7E9E6] shadow-2xs mb-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#075B43]/10 text-[#075B43] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-bold text-[#111817]">KaamWala 7-Day Warranty</div>
          <div className="text-[11px] text-[#66706D]">
            Free revisit if the same problem reoccurs within 7 days of service.
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <h3 className="text-sm font-bold text-[#111817] mb-3">Common Questions</h3>
      <div className="space-y-2.5">
        {faqs.map((faq, i) => {
          const isOpen = openFaq === i;
          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#E7E9E6] overflow-hidden shadow-2xs"
            >
              <button
                onClick={() => setOpenFaq(isOpen ? null : i)}
                className="w-full p-3.5 text-left flex items-center justify-between text-xs font-bold text-[#111817] hover:bg-gray-50 transition-colors"
              >
                <span>{faq.q}</span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                )}
              </button>
              {isOpen && (
                <div className="px-3.5 pb-3.5 text-xs text-[#66706D] leading-relaxed border-t border-gray-100 pt-2.5">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Local Office Address */}
      <div className="mt-6 p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600">
        <div className="font-bold text-[#111817] flex items-center gap-1.5 mb-1">
          <MapPin className="w-3.5 h-3.5 text-[#075B43]" />
          <span>Kadi Local Center</span>
        </div>
        <p className="text-[11px]">
          Shop 4, 1st Floor, Fuwara Chowk Commercial Complex, Kadi, Mehsana, Gujarat 382715
        </p>
      </div>
    </div>
  );
};
