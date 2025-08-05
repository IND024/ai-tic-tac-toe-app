import React, { useState, useEffect } from 'react';
import { playSound } from '../services/soundService';

interface RewardedAdOverlayProps {
  onConfirm: () => void;
  onClose: () => void;
}

const RewardedAdOverlay: React.FC<RewardedAdOverlayProps> = ({ onConfirm, onClose }) => {
  const [adState, setAdState] = useState<'prompt' | 'playing'>('prompt');
  const [progress, setProgress] = useState(100);
  const adDuration = 5000; // 5 seconds for simulation

  useEffect(() => {
    let timer: number | undefined;
    let interval: number | undefined;

    if (adState === 'playing') {
      // यह एक सिमुलेशन है। असली विज्ञापन में, आप विज्ञापन नेटवर्क के कॉलबैक का
      // इंतज़ार करेंगे, और onConfirm() को तब कॉल करेंगे जब विज्ञापन सफलतापूर्वक देख लिया गया हो।
      // आपको इस setTimeout() को हटाना होगा।
      timer = window.setTimeout(() => {
        onConfirm();
      }, adDuration);

      // यह प्रोग्रेस बार सिर्फ सिमुलेशन के लिए है।
      interval = window.setInterval(() => {
        setProgress(prev => Math.max(0, prev - (100 / (adDuration / 100))));
      }, 100);
    }

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [adState, onConfirm]);

  const handleWatchAd = () => {
    playSound('notification');
    setAdState('playing');
    
    /* 
      =============================================================================
      == AdSense/AdMob रिवार्डेड विज्ञापन कोड यहाँ लागू करें ==
      =============================================================================
      
      --- हिन्दी में स्पष्टीकरण ---
      रिवार्डेड विज्ञापन (इनाम वाला विज्ञापन) एक वीडियो विज्ञापन होता है जिसे उपयोगकर्ता स्वेच्छा से 
      ऐप में एक इनाम (जैसे गेम में हिंट) पाने के लिए देखता है।
      
      - AdMob की तरह, इस रिवार्डेड विज्ञापन की भी अपनी एक अलग 'Ad Unit ID' (विज्ञापन यूनिट आईडी) होती है।
      - आपको AdSense/AdMob डैशबोर्ड में इस इनाम वाले विज्ञापन के लिए एक नई 'Ad Unit' बनानी होगी और उसकी ID यहाँ इस्तेमाल करनी होगी।

      📌 एक असली ऐप में, आप यहाँ अपने विज्ञापन नेटवर्क का फंक्शन कॉल करेंगे।
      उदाहरण के लिए: `admob.rewarded.show();`
      
      विज्ञापन नेटवर्क का SDK आपको कॉलबैक (callbacks) या इवेंट्स (events) देगा:
      - **जब उपयोगकर्ता विज्ञापन सफलतापूर्वक देख ले (user earned reward):** इस कॉलबैक में `onConfirm()` को कॉल करें ताकि उपयोगकर्ता को इनाम मिल सके।
      - **जब उपयोगकर्ता विज्ञापन स्किप कर दे या कोई त्रुटि हो:** इस कॉलबैक में `onClose()` को कॉल करें।
      
      `useEffect()` में मौजूद लॉजिक सिर्फ एक सिमुलेशन है और इसे आपके 
      विज्ञापन नेटवर्क के SDK से बदल दिया जाना चाहिए।
    */
  };

  const handleClose = () => {
    playSound('button');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rewarded-ad-title"
    >
      <style>{'.animate-fade-in { animation: fadeIn 0.3s ease-in-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }'}</style>
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl border border-purple-500/50 w-full max-w-md text-center transform scale-100 transition-transform duration-300">
        
        {adState === 'prompt' ? (
          <>
            <h3 id="rewarded-ad-title" className="text-3xl font-black text-purple-400 mb-2">Get a Hint!</h3>
            <p className="text-gray-300 mb-6">Watch a short video ad to get the best move suggestion.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleWatchAd}
                className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition-all duration-300 transform hover:scale-105"
              >
                Watch Ad
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition-all duration-300"
              >
                No, Thanks
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-3xl font-black text-amber-400 mb-4">Ad in Progress...</h3>
            <p className="text-gray-300 mb-6">Your reward will be ready shortly.</p>
             {/* 
                यह UI सिर्फ एक प्लेसहोल्डर है यह दिखाने के लिए कि विज्ञापन चल रहा है।
                अधिकांश रिवार्डेड वीडियो विज्ञापन SDK द्वारा प्रदान किए गए फुलस्क्रीन ओवरले में दिखाए जाते हैं।
                आपको इस UI को बदलने की आवश्यकता नहीं हो सकती है, क्योंकि विज्ञापन नेटवर्क अपना UI खुद दिखा सकता है।
            */}
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RewardedAdOverlay;