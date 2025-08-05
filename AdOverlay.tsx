import React, { useEffect, useState } from 'react';

interface AdOverlayProps {
  duration: number; // in ms
  onComplete: () => void;
}

const AdOverlay: React.FC<AdOverlayProps> = ({ duration, onComplete }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        // यह एक सिमुलेशन है। असली विज्ञापन में, आप SDK के 'ad closed' या 'ad dismissed'
        // इवेंट पर onComplete() को कॉल करेंगे। यह टाइमर सिर्फ एक सिमुलेशन है और इसे हटा दिया जाना चाहिए।
        const timer = setTimeout(onComplete, duration);

        const interval = setInterval(() => {
            setProgress(prev => Math.max(0, prev - (100 / (duration / 100))));
        }, 100);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [duration, onComplete]);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-300"
            role="dialog"
            aria-modal="true"
            aria-label="Advertisement"
        >
            <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-yellow-500/50 w-full max-w-md text-center transform scale-100 transition-transform duration-300">
                {/* 
                    =============================================================================
                    == AdSense/AdMob इंटरस्टीशियल विज्ञापन कोड यहाँ लागू करें ==
                    =============================================================================
                    यह एक इंटरस्टीशियल (फुल-स्क्रीन) विज्ञापन के लिए प्लेसहोल्डर है।
                    
                    --- हिन्दी में स्पष्टीकरण ---
                    इंटरस्टीशियल विज्ञापन एक फुल-स्क्रीन विज्ञापन होता है जो ऐप के सामान्य प्रवाह के बीच में दिखाई देता है,
                    जैसे एक लेवल पूरा होने के बाद।
                    
                    - AdMob की तरह, इस इंटरस्टीशियल विज्ञापन की भी अपनी एक अलग 'Ad Unit ID' होती है।
                    - आपको AdSense/AdMob डैशबोर्ड में एक नई 'Ad Unit' बनानी होगी और उसकी ID यहाँ इस्तेमाल करनी होगी।

                    📌 असली विज्ञापन लागू करने के लिए:
                    1. जब यह कंपोनेंट दिखाया जाए (जैसे `useEffect` में), तो AdSense/AdMob के फंक्शन को कॉल करके विज्ञापन का अनुरोध करें और दिखाएं।
                       वेब के लिए, यह आमतौर पर एक जावास्क्रिप्ट फंक्शन होता है जिसे आप अपनी Ad Unit ID के साथ कॉल करते हैं।
                        
                    2. विज्ञापन नेटवर्क के SDK से 'ad closed' (विज्ञापन बंद होने वाला) इवेंट सुनें।
                    
                    3. जब उपयोगकर्ता विज्ञापन बंद कर दे, तो `onComplete()` फंक्शन को कॉल करें ताकि गेम फिर से शुरू हो सके।
                    
                    यह मौजूदा UI और टाइमर सिर्फ एक सिमुलेशन है। असली कार्यान्वयन में, विज्ञापन नेटवर्क अपना खुद का UI दिखाएगा,
                    और आपको उसे दिखाने और बंद होने पर प्रतिक्रिया देने के लिए उनके कोड का उपयोग करना होगा।
                */}
                <h3 className="text-3xl font-black text-amber-400 mb-4">Advertisement</h3>
                <p className="text-gray-300 mb-6">Your game will resume shortly.</p>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}></div>
                </div>
            </div>
        </div>
    );
};

export default AdOverlay;