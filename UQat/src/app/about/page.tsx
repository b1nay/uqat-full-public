"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  FiDatabase, 
  FiLayers, 
  FiUsers, 
  FiFileText, 
  FiMessageCircle, 
  FiStar, 
  FiAward,
  FiCode,
  FiSettings
} from "react-icons/fi";
import { 
  TbBrandPython, 
  TbBrandReact, 
  TbBrandNextjs,
  TbVectorTriangle,
  TbRobot
} from "react-icons/tb";
import { LuBrain } from "react-icons/lu";
import { HiOutlineLightBulb, HiOutlineDocumentText, HiOutlineSpeakerphone } from "react-icons/hi";

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState("challenge");

  const teamMembers = [
    {
      name: "Binayak Karki",
      role: "Full-Stack Developer & AI Engineer",
      institution: "Mechi Multiple Campus, Nepal",
      emoji: "👨‍💻",
      links: {
        github: "https://github.com/binayakkarki",
        linkedin: "https://linkedin.com/in/binayakkarki",
      }
    },
    {
      name: "Binit Bhattarai",
      role: "Senior Researcher: LLMs and SpeechAI",
      institution: "Vellore Institute of Technology, India",
      emoji: "🧠",
      links: {
        github: "https://github.com/binitbhattarai",
        linkedin: "https://linkedin.com/in/binitbhattarai",
      }
    },
    {
      name: "Saurabh Baral",
      role: "Mathematics and System Design",
      institution: "St. Joseph's University, USA",
      emoji: "🔧",
      links: {
        github: "https://github.com/saurabhbaral",
        linkedin: "https://linkedin.com/in/saurabhbaral",
      }
    }
  ];

  const tabs = [
    { id: "challenge", label: "Challenge", icon: <HiOutlineLightBulb className="text-yellow-500" /> },
    { id: "solution", label: "Solution", icon: <LuBrain className="text-green-500" /> }, 
    { id: "research", label: "Research", icon: <HiOutlineDocumentText className="text-blue-500" /> },
    { id: "team", label: "Team", icon: <FiUsers className="text-purple-500" /> }
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            About UQat
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unified QnA Assistant for Security Compliance
          </p>
          
          <div className="flex justify-center mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <FiAward className="mr-1" /> NepalHacks @ SecurityPal powered by NAAMII 2025
            </span>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 overflow-x-auto py-2">
        <div className="flex space-x-1 p-1 bg-gray-100 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Section */}
      {activeTab === "challenge" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <HiOutlineLightBulb className="text-yellow-500 mr-2" />
              The Challenge We Tackled
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="prose max-w-none">
                  <p>
                    Security compliance is a critical area where organizations face numerous challenges in handling questionnaires and information retrieval:
                  </p>
                  
                  <ul className="space-y-3 mt-4">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 mr-3 mt-0.5">
                        🔍
                      </span>
                      <span>
                        <strong className="text-gray-900">Information Overload:</strong> Security teams must navigate through extensive policy documents to answer compliance questions
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 text-orange-600 mr-3 mt-0.5">
                        ⏱️
                      </span>
                      <span>
                        <strong className="text-gray-900">Time Consumption:</strong> Manual processing of security questionnaires is resource-intensive and time-consuming
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600 mr-3 mt-0.5">
                        📊
                      </span>
                      <span>
                        <strong className="text-gray-900">Consistency Issues:</strong> Different team members might provide inconsistent answers to similar questions
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 mr-3 mt-0.5">
                        🔄
                      </span>
                      <span>
                        <strong className="text-gray-900">Process Inefficiency:</strong> Lack of automation creates bottlenecks in the compliance workflow
                      </span>
                    </li>
                  </ul>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">
                      We approached this as a research problem: How can we leverage AI to automate security compliance questionnaire processing while maintaining accuracy and context awareness?
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <Image
                  src="/our.jpg"
                  alt="Our team's solution approach"
                  width={500}
                  height={400}
                  className="rounded-lg shadow-md"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Solution Section */}
      {activeTab === "solution" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <LuBrain className="text-green-500 mr-2" />
              Our AI-Powered Solution
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="col-span-1 lg:col-span-2">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Unified QnA Assistant</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md bg-blue-100 text-blue-600 mr-4">
                      <TbVectorTriangle className="text-xl" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Embedding Model</h4>
                      <p className="text-gray-600">
                        Using SentenceTransformer 'all-MiniLM-L6-v2' to convert text to vectors, enabling semantic similarity searching in our retrieval phase.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md bg-purple-100 text-purple-600 mr-4">
                      <LuBrain className="text-xl" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Language Model</h4>
                      <p className="text-gray-600">
                        Implementing TinyLlama-1.1B-Chat-v1.0 to generate natural text responses in the response phase, providing AI-enhanced answers with context.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md bg-amber-100 text-amber-600 mr-4">
                      <FiLayers className="text-xl" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Fine-tuned with Domain Knowledge</h4>
                      <p className="text-gray-600">
                        We fine-tuned our models with security QnA pairs and policy documents to ensure domain-specific understanding and accurate responses.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md bg-green-100 text-green-600 mr-4">
                      <FiMessageCircle className="text-xl" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Dual-Mode Interface</h4>
                      <p className="text-gray-600">
                        Developed both conversational and batch processing capabilities for flexibility in handling various compliance workflows.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-md bg-red-100 text-red-600 mr-4">
                      <HiOutlineSpeakerphone className="text-xl" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">Yeti TTS (Coming Soon)</h4>
                      <p className="text-gray-600">
                        We're developing a human-like text-to-speech system where our Yeti mascot will verbally communicate with natural expressions and emotions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-1">
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-900">Technology Stack</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <FiDatabase className="mr-1 text-blue-500" /> Backend
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                            <TbBrandPython className="mr-1" /> Python
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                            <FiSettings className="mr-1" /> FastAPI
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
                            <LuBrain className="mr-1" /> PyTorch
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-yellow-100 text-yellow-800">
                            <FiDatabase className="mr-1" /> SQLAlchemy
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <FiCode className="mr-1 text-indigo-500" /> Frontend
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                            <TbBrandReact className="mr-1" /> React
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                            <TbBrandNextjs className="mr-1" /> Next.js
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-teal-100 text-teal-800">
                            <FiSettings className="mr-1" /> Tailwind CSS
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <TbRobot className="mr-1 text-red-500" /> AI Models
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800">
                            SentenceTransformer
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
                            TinyLlama
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                            Cosine Similarity
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                          <FiStar className="mr-1 text-amber-500" /> Features
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-100 text-green-800">
                            Chat Interface
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                            Batch Processing
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-amber-100 text-amber-800">
                            Visualization
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                            Authentication
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Research Section */}
      {activeTab === "research" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-blue-50 to-sky-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <HiOutlineDocumentText className="text-blue-500 mr-2" />
              Our Research Approach
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Research Methodology</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                      1
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-900">Problem Formulation</h4>
                      <p className="text-gray-600">
                        We defined the security compliance challenge as an information retrieval and natural language 
                        generation problem, requiring both semantic understanding and contextual awareness.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                      2
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-900">Dataset Creation</h4>
                      <p className="text-gray-600">
                        We collected and curated security policy documents and QnA pairs specific to compliance 
                        requirements, creating a specialized corpus for training and evaluation.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                      3
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-900">Model Selection & Fine-tuning</h4>
                      <p className="text-gray-600">
                        After evaluating multiple embedding and language models, we selected and fine-tuned 
                        our chosen architectures on domain-specific data.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                      4
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-900">Retrieval-Augmented Generation</h4>
                      <p className="text-gray-600">
                        We implemented a RAG architecture to combine the strengths of both retrieval and 
                        generation models, enhancing answer quality and factual accuracy.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                      5
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-gray-900">Evaluation & Iteration</h4>
                      <p className="text-gray-600">
                        We conducted comprehensive evaluations using both automated metrics and human feedback, 
                        iteratively improving our models and system architecture.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 bg-amber-50 border border-amber-100 rounded-lg p-4">
                  <h4 className="text-base font-medium text-amber-900 mb-2 flex items-center">
                    <FiFileText className="mr-2" /> Scientific Publication
                  </h4>
                  <p className="text-amber-800">
                    We documented our research approach, methodology, and findings in a comprehensive scientific 
                    paper that details the technical aspects of our solution and evaluates its effectiveness 
                    in real-world security compliance scenarios.
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Research Insights</h3>
                
                <div className="space-y-5">
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <h4 className="text-base font-medium text-gray-900 mb-2">Embedding Model Efficiency</h4>
                    <p className="text-gray-600">
                      Our research showed that SentenceTransformer 'all-MiniLM-L6-v2' provides an optimal 
                      balance between semantic accuracy and computational efficiency for security compliance 
                      text, outperforming larger models in our specific domain.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <h4 className="text-base font-medium text-gray-900 mb-2">Context Window Optimization</h4>
                    <p className="text-gray-600">
                      We discovered that carefully optimized text chunking with strategic overlap significantly 
                      improves retrieval quality, maintaining context while reducing redundancy.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <h4 className="text-base font-medium text-gray-900 mb-2">Model Size vs. Performance</h4>
                    <p className="text-gray-600">
                      Our experiments with TinyLlama-1.1B-Chat-v1.0 demonstrated that domain-specific fine-tuning 
                      can enable smaller models to perform comparably to much larger ones for specialized tasks, 
                      with significantly lower resource requirements.
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                    <h4 className="text-base font-medium text-gray-900 mb-2">Hybrid Architecture Benefits</h4>
                    <p className="text-gray-600">
                      The combination of embedding-based retrieval with generative LLM capabilities created 
                      a synergistic effect, producing more accurate and contextually relevant answers than 
                      either approach alone.
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-center mt-6">
                  <Image
                    src="/our.jpg"
                    alt="Our team's project"
                    width={500}
                    height={300}
                    className="rounded-lg shadow-sm border border-gray-100"
                    style={{ objectFit: 'contain' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Team Section */}
      {activeTab === "team" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <FiUsers className="text-purple-500 mr-2" />
              Our Team
            </h2>
          </div>
          
          <div className="p-6">
            <div className="text-center mb-8">
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Meet the minds behind UQat, combining expertise in machine learning, 
                software development, and UI/UX design to revolutionize security compliance.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center text-5xl">
                      {member.emoji}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-blue-600 font-medium">{member.role}</p>
                    <p className="text-gray-500 text-sm mt-1">{member.institution}</p>
                    
                    <div className="mt-4 flex space-x-3">
                      <a 
                        href={member.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      </a>
                      <a 
                        href={member.links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Acknowledgments</h3>
              <p className="text-gray-600">
                We would like to express our gratitude to NepalHacks, SecurityPal, and NAAMII for organizing this hackathon 
                and providing us with the opportunity to work on this challenging problem. Their support and resources 
                were instrumental in bringing UQat to life.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-6">
                <span className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium">NepalHacks</span>
                <span className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-medium">SecurityPal</span>
                <span className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium">NAAMII</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}