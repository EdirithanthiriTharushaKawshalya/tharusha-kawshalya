"use client";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="py-12 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 md:p-12 rounded-3xl"
      >
        <h1 className="text-4xl font-bold mb-6">About Me</h1>
        
        <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
          <p>
            Hello! I'm <strong>Edirithanthiri Tharusha Kawshalya</strong>, a passionate software engineer 
            and creative designer based in Sri Lanka.
          </p>
          
          <p>
            My journey began at <strong>Dharmasoka College</strong> (Grade 1-11), where I built my foundation. 
            driven by a curiosity for technology, I moved on to complete my <strong>Foundation for Higher Education</strong> at the 
            Informatics Institute of Technology (IIT).
          </p>

          <p>
            Currently, I am in the final stages of my <strong>Computer Science degree at the University of Westminster (UK)</strong>. 
            To bridge the gap between theory and practice, I am working as an <strong>Intern Software Engineer at Syntax Erreur</strong>, 
            where I contribute to full-stack web applications.
          </p>

          <p>
            Before diving deep into code, I explored my creative side as a <strong>Part-time Graphic Designer at Studio Zine</strong>. 
            This background allows me to merge technical logic with modern aesthetics—creating software that not only works 
            flawlessly but looks beautiful.
          </p>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-300/50 flex flex-wrap gap-8">
          <div>
            <h3 className="text-sm font-bold uppercase text-gray-500 mb-1">Location</h3>
            <p className="font-medium">Sri Lanka</p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase text-gray-500 mb-1">Education</h3>
            <p className="font-medium">University of Westminster</p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase text-gray-500 mb-1">Current Role</h3>
            <p className="font-medium">Intern @ Syntax Erreur</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}