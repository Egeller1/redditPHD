import { Search, TrendingUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { GlobalPostsVisualization } from './GlobalPostsVisualization';
import { User } from 'lucide-react';
import { queryParamToSlug } from '@/lib/slug';

const trendingSearches = [
  { 
    term: 'Creatine', 
    category: 'Supplements',
    color: '#7c3aed',
    path: 'M0,120 Q50,80 100,90 T200,70 T300,85 T400,60 T500,75 T600,50 T700,65 T800,45 T900,55 T1000,35'
  },
  { 
    term: 'Cold showers', 
    category: 'Wellness',
    color: '#0ea5e9',
    path: 'M0,140 Q50,110 100,120 T200,100 T300,110 T400,85 T500,95 T600,70 T700,80 T800,60 T900,70 T1000,50'
  },
  { 
    term: 'SSRIs', 
    category: 'Mental Health',
    color: '#ec4899',
    path: 'M0,160 Q50,130 100,140 T200,125 T300,135 T400,115 T500,120 T600,100 T700,105 T800,85 T900,90 T1000,75'
  },
  { 
    term: 'Ashwagandha', 
    category: 'Supplements',
    color: '#10b981',
    path: 'M0,150 Q50,115 100,125 T200,110 T300,120 T400,95 T500,105 T600,85 T700,90 T800,70 T900,80 T1000,60'
  },
  { 
    term: 'Intermittent fasting', 
    category: 'Diet',
    color: '#f59e0b',
    path: 'M0,135 Q50,105 100,115 T200,95 T300,105 T400,80 T500,90 T600,65 T700,75 T800,55 T900,65 T1000,45'
  },
];

const relatedTopics = [
  { 
    title: '78% report strength gains',
    description: 'Users see results within 2-4 weeks',
    source: 'r/fitness • 2.4k posts',
    image: '💪'
  },
  { 
    title: 'Loading phase unnecessary',
    description: 'Consistent daily 5g works best',
    source: 'r/supplements • 1.8k posts',
    image: '📊'
  },
  { 
    title: 'Water retention is temporary',
    description: 'Subsides after first 2 weeks',
    source: 'r/bodybuilding • 1.2k posts',
    image: '💧'
  },
];

export function LandingHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingSearches.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentSearch = trendingSearches[currentIndex];

  const handleExplore = () => {
    const slug = queryParamToSlug(currentSearch.term);
    if (slug) navigate(`/search/${slug}`);
  };

  return (
    <main className="relative overflow-hidden">
      {/* Hero Section with Network Background */}
      <div className="relative min-h-[600px] flex items-center">
        {/* Network Visualization Background */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.svg 
            className="absolute inset-0 w-full h-full" 
            viewBox="0 0 1400 700"
            preserveAspectRatio="xMidYMid slice"
            initial={{ x: 0 }}
            animate={{ x: -200 }}
            transition={{ 
              duration: 60, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <defs>
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Connection Lines - Random connections */}
            <g opacity="0.1">
              <line x1="80" y1="65" x2="145" y2="110" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="145" y1="110" x2="230" y2="85" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="230" y1="85" x2="310" y2="140" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="310" y1="140" x2="420" y2="95" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="145" y1="110" x2="180" y2="175" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="180" y1="175" x2="285" y2="160" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="285" y1="160" x2="365" y2="220" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="230" y1="85" x2="310" y2="140" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="420" y1="95" x2="520" y2="125" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="520" y1="125" x2="610" y2="90" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="610" y1="90" x2="695" y2="155" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="695" y1="155" x2="780" y2="110" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="180" y1="175" x2="120" y2="245" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="120" y1="245" x2="210" y2="280" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="210" y1="280" x2="335" y2="250" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="285" y1="160" x2="365" y2="220" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="365" y1="220" x2="460" y2="195" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="460" y1="195" x2="555" y2="240" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="555" y1="240" x2="640" y2="205" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="640" y1="205" x2="730" y2="260" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="730" y1="260" x2="820" y2="225" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="210" y1="280" x2="175" y2="350" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="175" y1="350" x2="270" y2="380" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="270" y1="380" x2="380" y2="340" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="335" y1="250" x2="380" y2="340" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="380" y1="340" x2="490" y2="310" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="490" y1="310" x2="575" y2="365" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="575" y1="365" x2="670" y2="330" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="670" y1="330" x2="755" y2="385" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="755" y1="385" x2="850" y2="340" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="270" y1="380" x2="230" y2="465" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="230" y1="465" x2="325" y2="490" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="325" y1="490" x2="435" y2="455" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="435" y1="455" x2="525" y2="500" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="525" y1="500" x2="620" y2="470" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="620" y1="470" x2="710" y2="520" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="710" y1="520" x2="800" y2="485" stroke="#ef4444" strokeWidth="0.5" />
              
              {/* Additional cross connections */}
              <line x1="80" y1="65" x2="120" y2="245" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="520" y1="125" x2="555" y2="240" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="365" y1="220" x2="335" y2="250" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="780" y1="110" x2="820" y2="225" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="490" y1="310" x2="460" y2="195" stroke="#ef4444" strokeWidth="0.5" />
              
              {/* Extended connections for scrolling */}
              <line x1="850" y1="340" x2="940" y2="120" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="940" y1="120" x2="1030" y2="175" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1030" y1="175" x2="1120" y2="140" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1120" y1="140" x2="1210" y2="195" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="940" y1="120" x2="920" y2="250" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="920" y1="250" x2="1015" y2="280" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1015" y1="280" x2="1105" y2="245" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1105" y1="245" x2="1195" y2="295" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="920" y1="250" x2="880" y2="370" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="880" y1="370" x2="970" y2="405" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="970" y1="405" x2="1065" y2="370" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1065" y1="370" x2="1150" y2="420" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="880" y1="370" x2="860" y2="495" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="860" y1="495" x2="950" y2="530" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="950" y1="530" x2="1040" y2="495" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1040" y1="495" x2="1130" y2="540" stroke="#ef4444" strokeWidth="0.5" />
              
              {/* Connect all smaller dots - Cluster 1 */}
              <line x1="95" y1="135" x2="145" y2="110" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="95" y1="135" x2="80" y2="65" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="265" y1="120" x2="230" y2="85" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="265" y1="120" x2="310" y2="140" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="375" y1="115" x2="420" y2="95" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="375" y1="115" x2="310" y2="140" stroke="#ef4444" strokeWidth="0.5" />
              
              {/* Connect Cluster 2 smaller dots */}
              <line x1="565" y1="105" x2="520" y2="125" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="565" y1="105" x2="610" y2="90" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="650" y1="130" x2="610" y2="90" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="650" y1="130" x2="695" y2="155" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="735" y1="135" x2="695" y2="155" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="735" y1="135" x2="780" y2="110" stroke="#ef4444" strokeWidth="0.5" />
              
              {/* Connect Cluster 3 smaller dots */}
              <line x1="155" y1="210" x2="180" y2="175" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="155" y1="210" x2="120" y2="245" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="245" y1="220" x2="210" y2="280" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="245" y1="220" x2="285" y2="160" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="195" y1="195" x2="180" y2="175" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="195" y1="195" x2="210" y2="280" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="140" y1="290" x2="120" y2="245" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="140" y1="290" x2="210" y2="280" stroke="#ef4444" strokeWidth="0.5" />
              
              {/* Connect Cluster 4 smaller dots */}
              <line x1="410" y1="210" x2="365" y2="220" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="410" y1="210" x2="460" y2="195" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="505" y1="220" x2="460" y2="195" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="505" y1="220" x2="555" y2="240" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="595" y1="225" x2="555" y2="240" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="595" y1="225" x2="640" y2="205" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="685" y1="235" x2="640" y2="205" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="685" y1="235" x2="730" y2="260" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="775" y1="245" x2="730" y2="260" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="775" y1="245" x2="820" y2="225" stroke="#ef4444" strokeWidth="0.5" />
              
              {/* Connect Cluster 5 smaller dots */}
              <line x1="220" y1="365" x2="175" y2="350" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="220" y1="365" x2="270" y2="380" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="325" y1="360" x2="270" y2="380" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="325" y1="360" x2="380" y2="340" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="435" y1="325" x2="380" y2="340" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="435" y1="325" x2="490" y2="310" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="530" y1="340" x2="490" y2="310" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="530" y1="340" x2="575" y2="365" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="620" y1="350" x2="575" y2="365" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="620" y1="350" x2="670" y2="330" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="715" y1="360" x2="670" y2="330" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="715" y1="360" x2="755" y2="385" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="805" y1="365" x2="755" y2="385" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="805" y1="365" x2="850" y2="340" stroke="#ef4444" strokeWidth="0.5" />
              
              {/* Connect Cluster 6 smaller dots */}
              <line x1="280" y1="478" x2="230" y2="465" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="280" y1="478" x2="325" y2="490" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="380" y1="475" x2="325" y2="490" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="380" y1="475" x2="435" y2="455" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="480" y1="480" x2="435" y2="455" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="480" y1="480" x2="525" y2="500" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="575" y1="485" x2="525" y2="500" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="575" y1="485" x2="620" y2="470" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="665" y1="495" x2="620" y2="470" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="665" y1="495" x2="710" y2="520" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="755" y1="505" x2="710" y2="520" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="755" y1="505" x2="800" y2="485" stroke="#ef4444" strokeWidth="0.5" />
              
              {/* Connect extended clusters */}
              <line x1="985" y1="150" x2="940" y2="120" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="985" y1="150" x2="1030" y2="175" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1075" y1="160" x2="1030" y2="175" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1075" y1="160" x2="1120" y2="140" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1165" y1="170" x2="1120" y2="140" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1165" y1="170" x2="1210" y2="195" stroke="#ef4444" strokeWidth="0.5" />
              
              <line x1="965" y1="265" x2="920" y2="250" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="965" y1="265" x2="1015" y2="280" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1060" y1="265" x2="1015" y2="280" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1060" y1="265" x2="1105" y2="245" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1150" y1="270" x2="1105" y2="245" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1150" y1="270" x2="1195" y2="295" stroke="#ef4444" strokeWidth="0.5" />
              
              <line x1="925" y1="390" x2="880" y2="370" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="925" y1="390" x2="970" y2="405" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1020" y1="390" x2="970" y2="405" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1020" y1="390" x2="1065" y2="370" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1110" y1="395" x2="1065" y2="370" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1110" y1="395" x2="1150" y2="420" stroke="#ef4444" strokeWidth="0.5" />
              
              <line x1="905" y1="515" x2="860" y2="495" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="905" y1="515" x2="950" y2="530" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="995" y1="515" x2="950" y2="530" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="995" y1="515" x2="1040" y2="495" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1085" y1="520" x2="1040" y2="495" stroke="#ef4444" strokeWidth="0.5" />
              <line x1="1085" y1="520" x2="1130" y2="540" stroke="#ef4444" strokeWidth="0.5" />
            </g>

            {/* Data Points (Nodes) - More random placement */}
            <g>
              {/* Cluster 1 - Top Left */}
              <circle cx="80" cy="65" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="145" cy="110" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="230" cy="85" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="310" cy="140" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="420" cy="95" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="95" cy="135" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="265" cy="120" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="375" cy="115" r="2" fill="#ef4444" opacity="0.5" />
              
              {/* Cluster 2 - Upper Middle */}
              <circle cx="520" cy="125" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="610" cy="90" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="695" cy="155" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="780" cy="110" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="565" cy="105" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="650" cy="130" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="735" cy="135" r="2" fill="#ef4444" opacity="0.5" />
              
              {/* Cluster 3 - Middle Left */}
              <circle cx="180" cy="175" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="120" cy="245" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="210" cy="280" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="285" cy="160" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="335" cy="250" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="155" cy="210" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="245" cy="220" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="195" cy="195" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="140" cy="290" r="2" fill="#ef4444" opacity="0.5" />
              
              {/* Cluster 4 - Center */}
              <circle cx="365" cy="220" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="460" cy="195" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="555" cy="240" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="640" cy="205" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="730" cy="260" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="820" cy="225" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="410" cy="210" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="505" cy="220" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="595" cy="225" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="685" cy="235" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="775" cy="245" r="2" fill="#ef4444" opacity="0.5" />
              
              {/* Cluster 5 - Lower Middle */}
              <circle cx="175" cy="350" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="270" cy="380" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="380" cy="340" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="490" cy="310" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="575" cy="365" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="670" cy="330" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="755" cy="385" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="850" cy="340" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="220" cy="365" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="325" cy="360" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="435" cy="325" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="530" cy="340" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="620" cy="350" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="715" cy="360" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="805" cy="365" r="2" fill="#ef4444" opacity="0.5" />
              
              {/* Cluster 6 - Bottom */}
              <circle cx="230" cy="465" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="325" cy="490" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="435" cy="455" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="525" cy="500" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="620" cy="470" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="710" cy="520" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="800" cy="485" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="280" cy="478" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="380" cy="475" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="480" cy="480" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="575" cy="485" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="665" cy="495" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="755" cy="505" r="2" fill="#ef4444" opacity="0.5" />
              
              {/* Extended clusters for scrolling effect */}
              <circle cx="940" cy="120" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="1030" cy="175" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="1120" cy="140" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="1210" cy="195" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="985" cy="150" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="1075" cy="160" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="1165" cy="170" r="2" fill="#ef4444" opacity="0.5" />
              
              <circle cx="920" cy="250" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="1015" cy="280" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="1105" cy="245" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="1195" cy="295" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="965" cy="265" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="1060" cy="265" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="1150" cy="270" r="2" fill="#ef4444" opacity="0.5" />
              
              <circle cx="880" cy="370" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="970" cy="405" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="1065" cy="370" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="1150" cy="420" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="925" cy="390" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="1020" cy="390" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="1110" cy="395" r="2" fill="#ef4444" opacity="0.5" />
              
              <circle cx="860" cy="495" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="950" cy="530" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="1040" cy="495" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="1130" cy="540" r="3" fill="#ef4444" opacity="0.7" />
              <circle cx="905" cy="515" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="995" cy="515" r="2" fill="#ef4444" opacity="0.5" />
              <circle cx="1085" cy="520" r="2" fill="#ef4444" opacity="0.5" />
              
              {/* Highlighted nodes with glow */}
              <circle cx="460" cy="195" r="6" fill="url(#nodeGlow)" />
              <circle cx="460" cy="195" r="3" fill="#ef4444" />
              
              <circle cx="670" cy="330" r="6" fill="url(#nodeGlow)" />
              <circle cx="670" cy="330" r="3" fill="#ef4444" />
              
              <circle cx="1030" cy="175" r="6" fill="url(#nodeGlow)" />
              <circle cx="1030" cy="175" r="3" fill="#ef4444" />
            </g>
          </motion.svg>

          {/* Sample Post Cards - Static, no shift animation */}
          <div className="absolute top-[200px] left-[40px] w-[280px] bg-[#111111]/90 backdrop-blur-sm border border-[#1f1f1f] rounded-lg p-4 shadow-xl">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-[#ef4444]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] font-medium text-white">u/fitness_enthusiast</span>
                  <span className="text-[11px] text-[#6b7280]">r/fitness</span>
                </div>
                <p className="text-[13px] text-[#a1a1a1] leading-relaxed line-clamp-3">
                  "Been taking creatine for 3 months now. Definitely seeing strength gains, especially on compound lifts..."
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-[100px] right-[100px] w-[280px] bg-[#111111]/90 backdrop-blur-sm border border-[#1f1f1f] rounded-lg p-4 shadow-xl">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#ef4444]/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-[#ef4444]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] font-medium text-white">u/health_seeker</span>
                  <span className="text-[11px] text-[#6b7280]">r/supplements</span>
                </div>
                <p className="text-[13px] text-[#a1a1a1] leading-relaxed line-clamp-3">
                  "My experience: 5g daily, no loading phase. Water retention went away after week 2. Highly recommend..."
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative max-w-[900px] mx-auto px-8 py-20 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-[56px] font-[600] text-white tracking-[-0.02em] leading-[1.2] mb-4">
              Skip the rabbit hole,<br />
              <span className="text-[#a1a1a1]">get the consensus</span>
            </h1>

            <p className="text-[16px] text-[#a1a1a1] leading-[1.6] mb-12 max-w-[520px] mx-auto">
              Personalized recommendations from millions of real people
            </p>
          </motion.div>

          {/* Animated Search Bar with Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-[640px] mx-auto mb-8"
          >
            <div 
              className={`relative bg-[#111111] rounded-full border transition-all duration-200 ${
                isSearchFocused ? 'border-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.3)]' : 'border-[#1f1f1f]'
              }`}
            >
              <div className="flex items-center px-6 py-4">
                <div className="w-5 h-5 mr-4 flex-shrink-0">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.4 }}
                      className="w-5 h-5 rounded-full"
                      style={{ backgroundColor: currentSearch.color }}
                    />
                  </AnimatePresence>
                </div>

                <div className="flex-1 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <input
                        type="text"
                        value={currentSearch.term}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        className="w-full bg-transparent border-none outline-none text-[16px] text-white"
                        readOnly
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  className="ml-4 px-5 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-md transition-colors text-[14px] font-medium"
                  onClick={handleExplore}
                >
                  Explore
                </button>
              </div>
            </div>

            {/* Carousel Dots */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {trendingSearches.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="group p-1"
                >
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'w-6 bg-[#7c3aed]' 
                        : 'w-2 bg-[#404040] group-hover:bg-[#6b7280]'
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Why is X trending? */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-8"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[14px] text-[#a1a1a1]"
              >
                Why is <span className="font-medium text-white">{currentSearch.term}</span> trending?
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Related Topics Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-3 gap-4 max-w-[800px] mx-auto"
          >
            <AnimatePresence>
              {relatedTopics.map((topic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-[#111111] rounded-lg p-4 border border-[#1f1f1f] hover:border-[#7c3aed]/30 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="text-3xl mb-2">{topic.image}</div>
                  <h3 className="text-[14px] font-medium text-white mb-1 group-hover:text-[#a78bfa] transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-[12px] text-[#a1a1a1] mb-2">{topic.description}</p>
                  <p className="text-[11px] text-[#6b7280]">{topic.source}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Global Posts Visualization */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-[#0a0a0a] py-20"
      >
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-[500] text-white mb-3">Powered by real experiences</h2>
            <p className="text-[16px] text-[#a1a1a1]">
              We aggregate millions of Reddit posts from around the world to give you the most comprehensive insights.
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlobalPostsVisualization />
          </motion.div>
        </div>
      </motion.div>

      {/* Dive Deeper Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="bg-[#0f0f0f] py-20 border-t border-[#1f1f1f]"
      >
        <div className="max-w-[1200px] mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-[500] text-white mb-3">Dive deeper</h2>
            <p className="text-[16px] text-[#a1a1a1]">
              Explore issues and events in detail. Curated by the Reddit PhD Data Team.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {['Supplements', 'Mental Health', 'Fitness'].map((category, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-[#111111] rounded-lg overflow-hidden border border-[#1f1f1f] hover:border-[#7c3aed]/30 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="h-48 bg-gradient-to-br from-[#7c3aed]/10 to-[#6366f1]/10" />
                <div className="p-6">
                  <h3 className="text-[18px] font-medium text-white mb-2 group-hover:text-[#a78bfa] transition-colors">
                    {category}
                  </h3>
                  <p className="text-[14px] text-[#a1a1a1]">
                    What Reddit is experiencing right now
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-[#1f1f1f] bg-[#0a0a0a]">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <p className="text-[12px] text-[#6b7280]">
            Reddit PhD aggregates real user experiences. Not medical advice.
          </p>
        </div>
      </footer>
    </main>
  );
}