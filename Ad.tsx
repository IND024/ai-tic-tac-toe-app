import React from 'react';

interface AdProps {
  type: 'sidebar' | 'bottom';
}

const Ad: React.FC<AdProps> = ({ type }) => {
  const baseStyle = "bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center text-gray-500 font-bold rounded-lg shadow-inner";
  
  const style = type === 'sidebar' 
    ? "w-full h-[32rem]" // A fixed height for sidebar ads
    : "w-full h-24"; // Standard banner height for bottom

  return (
    <div className={`${baseStyle} ${style}`} aria-label="Advertisement placeholder">
      {/* 
        =============================================================================
        == AdSense/AdMob बैनर विज्ञापन कोड यहाँ पेस्ट करें ==
        =============================================================================
        
        --- हिन्दी में स्पष्टीकरण: Ad Unit ID बनाम App ID ---
        यह कंपोनेंट एक विशिष्ट विज्ञापन स्थान (जैसे साइडबार या बॉटम बैनर) के लिए है।
        
        - AdMob की तरह, हर विज्ञापन स्थान की अपनी एक अलग 'Ad Unit ID' (विज्ञापन यूनिट आईडी) होती है।
        - AdSense में, इसे 'Ad Slot ID' (विज्ञापन स्लॉट आईडी) कहते हैं।
        
        जब आप AdSense का कोड इस्तेमाल करते हैं, तो:
        - `data-ad-slot="xxxxxxxxxx"`: यह इस बैनर की 'Ad Unit ID' है। हर विज्ञापन स्थान के लिए यह अलग होगी।
        - `data-ad-client="ca-pub-..."`: यह आपकी 'Publisher ID' है, जो AdMob की 'App ID' के बराबर है।
                                          यह आपके पूरे ऐप के लिए एक ही रहती है और `index.html` में पहले से सेट है।
        
        📌 असली विज्ञापन लागू करने के लिए:
        1. नीचे दिए गए उदाहरण `<ins>` टैग को इस प्लेसहोल्डर `<div>` की जगह इस्तेमाल करें।
        2. `data-ad-client` को अपनी Publisher ID से और `data-ad-slot` को इस बैनर की Ad Unit ID से बदलें।
        3. `useEffect` हुक विज्ञापनों को लोड करने के लिए आवश्यक है।

        --- उदाहरण AdSense कंपोनेंट ---
        const AdComponent = () => {
          React.useEffect(() => {
            try {
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
              console.error("AdSense error:", e);
            }
          }, []);

          return (
            <ins className="adsbygoogle"
                 style={{ display: 'block', width: '100%', height: '100%' }}
                 data-ad-client="ca-pub-your-publisher-id" // 📌 आपकी Publisher ID (App ID के बराबर)
                 data-ad-slot="your-ad-slot-id"         // 📌 इस बैनर की Ad Unit ID
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
          );
        };
        
        // और फिर इस AdComponent को इस प्लेसहोल्डर के बजाय प्रस्तुत करें।
      */}
      <span className="text-xl tracking-widest">ADVERTISEMENT</span>
    </div>
  );
};

export default Ad;
