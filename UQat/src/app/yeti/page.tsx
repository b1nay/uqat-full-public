"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { FiPlay, FiPause, FiVolume2, FiVolumeX, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const audioSamples = [
  {
    id: "sample1",
    name: "Yeti Introducing Herself",
    src: "/sample_1.wav",
    description: "Hey there ! I am Yeti <haha> your friendly security compliance assistant here in Security pal's office , Kathmandu."
  },
  {
    id: "sample2",
    name: "Conversational Response",
    src: "/sample_2.wav",
    description: "Soooo, if you're ever reading something like 'Clause 5.2.1 under ISO 27001' and go <groan> 'What does *that* even mean?'—just ask me!"
  }
  
];

export default function YetiTtsPage() {
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [yetiAnimating, setYetiAnimating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    // Create audio elements for each sample
    audioSamples.forEach(sample => {
      if (!audioRefs.current[sample.id]) {
        const audio = new Audio(sample.src);
        audio.addEventListener('ended', () => {
          setActiveAudio(null);
          setYetiAnimating(false);
        });
        audioRefs.current[sample.id] = audio;
      }
    });

    // Cleanup function
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.removeEventListener('ended', () => {
          setActiveAudio(null);
          setYetiAnimating(false);
        });
      });
    };
  }, []);

  const playAudio = (id: string) => {
    // Stop any currently playing audio
    if (activeAudio && activeAudio !== id) {
      audioRefs.current[activeAudio].pause();
      audioRefs.current[activeAudio].currentTime = 0;
    }

    // Play the selected audio
    if (activeAudio === id) {
      audioRefs.current[id].pause();
      audioRefs.current[id].currentTime = 0;
      setActiveAudio(null);
      setYetiAnimating(false);
    } else {
      audioRefs.current[id].play();
      setActiveAudio(id);
      setYetiAnimating(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Meet the Voice of UQat</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Experience our next-generation TTS technology that brings Yeti to life with 
          human-like expressions, natural pauses, and emotional intelligence.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Yeti Visualization */}
        <div className="col-span-1 flex flex-col items-center">
          <div className="relative w-64 h-64 mb-4">
            <motion.div
              animate={yetiAnimating ? {
                y: [0, -5, 0, -3, 0],
                rotate: [0, 1, 0, -1, 0]
              } : {}}
              transition={{
                duration: 3,
                repeat: yetiAnimating ? Infinity : 0,
                repeatType: "reverse"
              }}
              className="w-full h-full relative"
            >
              <Image
                src="/logo-dark.png"
                alt="Yeti Mascot"
                width={300}
                height={300}
                className="object-contain"
                priority
              />
              
              {activeAudio && (
                <motion.div 
                  className="absolute bottom-4 right-0"
                  animate={{ 
                    scale: [1, 1.2, 1, 1.1, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity 
                  }}
                >
                  <FiVolume2 className="text-main text-3xl" />
                </motion.div>
              )}
            </motion.div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <h3 className="font-medium text-blue-800 flex items-center gap-2">
              <FiInfo /> Coming Soon
            </h3>
            <p className="text-blue-700 text-sm mt-1">
              Our Yeti will soon be able to laugh, sigh, pause thoughtfully, and express 
              emotions—creating a truly human-like conversation experience.
            </p>
          </div>
        </div>

        {/* Audio Samples */}
        <div className="col-span-1 lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">Voice Samples</h2>
              <p className="text-gray-500 text-sm mt-1">
                Click on any sample to hear our Orpheus TTS model in action
              </p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {audioSamples.map((sample) => (
                <div 
                  key={sample.id}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    activeAudio === sample.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => playAudio(sample.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button 
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activeAudio === sample.id 
                            ? 'bg-main text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {activeAudio === sample.id ? <FiPause /> : <FiPlay />}
                      </button>
                      <div>
                        <h3 className="font-medium text-gray-900">{sample.name}</h3>
                        <p className="text-sm text-gray-500">{sample.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-gray-400">
                      {activeAudio === sample.id ? <FiVolume2 /> : <FiVolumeX />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 bg-gradient-to-r from-main/10 to-blue-50 rounded-xl p-6 border border-main/20">
            <h3 className="font-semibold text-gray-800 mb-2">The Future of Yeti TTS</h3>
            <p className="text-gray-700">
              We're developing an advanced TTS system that doesn't just read text—it expresses it. Our locally-run 
              Orpheus model captures the nuances of human speech: natural pauses, emphasis on key points, 
              thoughtful sighs, and even appropriate laughter.
            </p>
            <p className="text-gray-700 mt-3">
              Soon, your security compliance questions will be answered by a Yeti with personality—making complex 
              information more engaging and easier to understand.
            </p>
            
            <button 
              onClick={() => setShowModal(true)}
              className="mt-4 bg-main text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Learn About the Technology
            </button>
          </div>
        </div>
      </div>
      
      {/* Information Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Orpheus TTS Technology</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <p className="mb-4">
                  The Orpheus model represents the next generation of text-to-speech technology, 
                  running locally to ensure privacy and performance. Unlike traditional TTS systems 
                  that produce robotic, monotone speech, Orpheus captures the full range of human expression:
                </p>
                
                <ul className="list-disc pl-5 mb-4 space-y-2">
                  <li><span className="font-medium">Emotional Intelligence</span> - Detects sentiment in text and applies appropriate emotional tone</li>
                  <li><span className="font-medium">Natural Pauses</span> - Places thoughtful pauses where humans naturally would</li>
                  <li><span className="font-medium">Expressive Sounds</span> - Adds laughs, sighs, hmms, and other non-verbal sounds</li>
                  <li><span className="font-medium">Dynamic Emphasis</span> - Emphasizes important words and concepts</li>
                  <li><span className="font-medium">Conversation Flow</span> - Maintains natural rhythm even in complex explanations</li>
                </ul>
                
                <p>
                  By running this advanced model locally, we ensure that your security and compliance 
                  conversations remain private while delivering a more engaging, human-like experience.
                </p>
                
                <div className="mt-6 text-right">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}