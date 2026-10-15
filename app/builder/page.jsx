// 'use client';

// import { useEffect, useState, useRef, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';
// import { useReactToPrint } from 'react-to-print';

// function BuilderContent() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [aiLoading, setAiLoading] = useState(false);
//   const [template, setTemplate] = useState('modern');
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const resumeId = searchParams.get('id');
//   const printRef = useRef();

//   const [targetJd, setTargetJd] = useState('');
//   const [analysisResult, setAnalysisResult] = useState(null);

//   const [resumeData, setResumeData] = useState({
//     title: 'My Resume',
//     personal_info: { fullName: '', email: '', phone: '', jobTitle: '', summary: '' },
//     education: { degree: '', institution: '', year: '' },
//     experience: { company: '', role: '', duration: '', description: '' },
//     skills: '',
//     projects: { title: '', link: '', description: '' },
//   });

//   useEffect(() => {
//     const checkUserAndFetchData = async () => {
//       const { data: { session } } = await supabase.auth.getSession();

//       if (!session) {
//         router.push('/auth');
//         return;
//       }

//       setUser(session.user);

//       if (resumeId) {
//         const { data } = await supabase
//           .from('resumes')
//           .select('*')
//           .eq('id', resumeId)
//           .single();

//         if (data) {
//           setResumeData({
//             title: data.title || 'My Resume',
//             personal_info: data.personal_info || resumeData.personal_info,
//             education: data.education || resumeData.education,
//             experience: data.experience || resumeData.experience,
//             skills: data.skills || '',
//             projects: data.projects || resumeData.projects,
//           });
//         }
//       }
//       setLoading(false);
//     };

//     checkUserAndFetchData();
//   }, [router, resumeId]);

//   const handleInputChange = (section, field, value) => {
//     if (section === 'skills') {
//       setResumeData({ ...resumeData, skills: value });
//     } else if (section === 'title') {
//       setResumeData({ ...resumeData, title: value });
//     } else {
//       setResumeData({
//         ...resumeData,
//         [section]: {
//           ...resumeData[section],
//           [field]: value,
//         },
//       });
//     }
//   };

//   const handleGenerateSummary = async () => {
//     setAiLoading(true);
//     try {
//       const res = await fetch('/api/ai-optimize', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action: 'generate_summary',
//           jobTitle: resumeData.personal_info.jobTitle,
//           experience: resumeData.experience,
//           skills: resumeData.skills,
//         }),
//       });

//       const data = await res.json();
//       if (data.summary) {
//         setResumeData((prev) => ({
//           ...prev,
//           personal_info: { ...prev.personal_info, summary: data.summary },
//         }));
//       } else if (data.error) {
//         alert('AI Error: ' + data.error);
//       }
//     } catch (err) {
//       alert('Error connecting to AI backend: ' + err.message);
//     }
//     setAiLoading(false);
//   };

//   const handleAnalyzeJd = async () => {
//     if (!targetJd) {
//       alert('Please paste a Job Description first!');
//       return;
//     }
//     setAiLoading(true);
//     try {
//       const res = await fetch('/api/ai-optimize', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action: 'analyze_jd',
//           jobTitle: resumeData.personal_info.jobTitle,
//           jobDescription: targetJd,
//           skills: resumeData.skills,
//           experience: resumeData.experience,
//         }),
//       });

//       const data = await res.json();
//       setAnalysisResult(data);
//     } catch (err) {
//       alert('Error analyzing JD: ' + err.message);
//     }
//     setAiLoading(false);
//   };

//   const handleSave = async () => {
//     if (!user) return;
//     setSaving(true);

//     let error;
//     if (resumeId) {
//       const res = await supabase
//         .from('resumes')
//         .update({
//           title: resumeData.title,
//           personal_info: resumeData.personal_info,
//           education: resumeData.education,
//           experience: resumeData.experience,
//           skills: resumeData.skills,
//           projects: resumeData.projects,
//         })
//         .eq('id', resumeId);
//       error = res.error;
//     } else {
//       const res = await supabase
//         .from('resumes')
//         .insert([
//           {
//             user_id: user.id,
//             title: resumeData.title,
//             personal_info: resumeData.personal_info,
//             education: resumeData.education,
//             experience: resumeData.experience,
//             skills: resumeData.skills,
//             projects: resumeData.projects,
//           },
//         ]);
//       error = res.error;
//     }

//     setSaving(false);
//     if (error) {
//       alert('Error saving resume: ' + error.message);
//     } else {
//       alert('Resume saved successfully!');
//       router.push('/dashboard');
//     }
//   };

//   const handlePrint = useReactToPrint({
//     contentRef: printRef,
//     documentTitle: `${resumeData.personal_info.fullName || 'Resume'}_CareerCraft`,
//   });

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
//         <div className="flex items-center gap-3">
//           <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//           <p className="text-sm font-medium text-slate-300">Loading Resume Builder...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
//       {/* Top Navbar */}
//       <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex flex-wrap gap-4 justify-between items-center sticky top-0 z-50">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => router.push('/dashboard')}
//             className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60"
//           >
//             ← Dashboard
//           </button>
//           <div className="flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
//             <input
//               type="text"
//               value={resumeData.title}
//               onChange={(e) => handleInputChange('title', '', e.target.value)}
//               className="text-base font-bold text-slate-100 bg-transparent border-b border-slate-700 focus:border-indigo-500 focus:outline-none px-1 py-0.5 transition-colors"
//               placeholder="Resume Title"
//             />
//           </div>
//         </div>

//         <div className="flex items-center gap-3">
//           {/* Template Switcher */}
//           <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
//             <button
//               onClick={() => setTemplate('modern')}
//               className={`px-3 py-1 rounded-lg transition-all ${template === 'modern' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
//             >
//               Modern
//             </button>
//             <button
//               onClick={() => setTemplate('classic')}
//               className={`px-3 py-1 rounded-lg transition-all ${template === 'classic' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
//             >
//               Classic
//             </button>
//             <button
//               onClick={() => setTemplate('minimalist')}
//               className={`px-3 py-1 rounded-lg transition-all ${template === 'minimalist' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
//             >
//               Minimalist
//             </button>
//           </div>

//           <button
//             onClick={handlePrint}
//             className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
//           >
//             📥 PDF Export
//           </button>
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
//           >
//             {saving ? 'Saving...' : 'Save & Exit'}
//           </button>
//         </div>
//       </header>

//       {/* Main Split Screen */}
//       <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 lg:p-6 max-w-[1700px] mx-auto w-full">
        
//         {/* Left Side: Form Controls */}
//         <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 overflow-y-auto max-h-[85vh] space-y-6 custom-scrollbar">
//           <div className="flex justify-between items-center border-b border-slate-800 pb-3">
//             <h2 className="text-sm font-bold tracking-wide uppercase text-indigo-400 flex items-center gap-2">
//               ✏️ Content Builder
//             </h2>
//             <span className="text-[10px] text-slate-500">Auto-syncing preview</span>
//           </div>

//           {/* Personal Info */}
//           <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
//             <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">1. Personal Information</h3>
//             <input
//               type="text"
//               placeholder="Full Name"
//               value={resumeData.personal_info.fullName}
//               onChange={(e) => handleInputChange('personal_info', 'fullName', e.target.value)}
//               className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//             />
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <input
//                 type="email"
//                 placeholder="Email Address"
//                 value={resumeData.personal_info.email}
//                 onChange={(e) => handleInputChange('personal_info', 'email', e.target.value)}
//                 className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//               />
//               <input
//                 type="text"
//                 placeholder="Phone Number"
//                 value={resumeData.personal_info.phone}
//                 onChange={(e) => handleInputChange('personal_info', 'phone', e.target.value)}
//                 className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//               />
//             </div>
//             <input
//               type="text"
//               placeholder="Target Job Title (e.g. Full Stack Developer)"
//               value={resumeData.personal_info.jobTitle}
//               onChange={(e) => handleInputChange('personal_info', 'jobTitle', e.target.value)}
//               className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//             />

//             <div className="flex justify-between items-center mt-2">
//               <label className="text-[11px] font-medium text-slate-400">Summary</label>
//               <button
//                 type="button"
//                 onClick={handleGenerateSummary}
//                 disabled={aiLoading}
//                 className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50"
//               >
//                 {aiLoading ? 'Generating...' : '✨ AI Generate Summary'}
//               </button>
//             </div>
//             <textarea
//               placeholder="Professional Summary"
//               rows={3}
//               value={resumeData.personal_info.summary}
//               onChange={(e) => handleInputChange('personal_info', 'summary', e.target.value)}
//               className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//             />
//           </div>

//           {/* Education */}
//           <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
//             <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">2. Education</h3>
//             <input
//               type="text"
//               placeholder="Degree / Major"
//               value={resumeData.education.degree}
//               onChange={(e) => handleInputChange('education', 'degree', e.target.value)}
//               className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//             />
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <input
//                 type="text"
//                 placeholder="Institution / University"
//                 value={resumeData.education.institution}
//                 onChange={(e) => handleInputChange('education', 'institution', e.target.value)}
//                 className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//               />
//               <input
//                 type="text"
//                 placeholder="Graduation Year / Duration"
//                 value={resumeData.education.year}
//                 onChange={(e) => handleInputChange('education', 'year', e.target.value)}
//                 className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//               />
//             </div>
//           </div>

//           {/* Experience */}
//           <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
//             <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">3. Experience</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <input
//                 type="text"
//                 placeholder="Company Name"
//                 value={resumeData.experience.company}
//                 onChange={(e) => handleInputChange('experience', 'company', e.target.value)}
//                 className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//               />
//               <input
//                 type="text"
//                 placeholder="Role / Designation"
//                 value={resumeData.experience.role}
//                 onChange={(e) => handleInputChange('experience', 'role', e.target.value)}
//                 className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//               />
//             </div>
//             <input
//               type="text"
//               placeholder="Duration (e.g. 2022 - Present)"
//               value={resumeData.experience.duration}
//               onChange={(e) => handleInputChange('experience', 'duration', e.target.value)}
//               className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//             />
//             <textarea
//               placeholder="Job Description & Key Achievements"
//               rows={3}
//               value={resumeData.experience.description}
//               onChange={(e) => handleInputChange('experience', 'description', e.target.value)}
//               className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//             />
//           </div>

//           {/* Skills */}
//           <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
//             <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">4. Skills</h3>
//             <input
//               type="text"
//               placeholder="Skills (e.g. Next.js, React, Node.js, Express, MongoDB)"
//               value={resumeData.skills}
//               onChange={(e) => handleInputChange('skills', '', e.target.value)}
//               className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//             />
//           </div>

//           {/* Projects */}
//           <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
//             <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">5. Projects</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <input
//                 type="text"
//                 placeholder="Project Title"
//                 value={resumeData.projects.title}
//                 onChange={(e) => handleInputChange('projects', 'title', e.target.value)}
//                 className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//               />
//               <input
//                 type="text"
//                 placeholder="Project Link"
//                 value={resumeData.projects.link}
//                 onChange={(e) => handleInputChange('projects', 'link', e.target.value)}
//                 className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//               />
//             </div>
//             <textarea
//               placeholder="Project Details"
//               rows={2}
//               value={resumeData.projects.description}
//               onChange={(e) => handleInputChange('projects', 'description', e.target.value)}
//               className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
//             />
//           </div>

//           {/* AI Job Description Match Analyzer */}
//           <div className="space-y-3 bg-gradient-to-b from-purple-950/30 to-indigo-950/30 p-4 rounded-xl border border-purple-500/30">
//             <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
//               🤖 AI Job Description Analyzer
//             </h3>
//             <textarea
//               placeholder="Paste target Job Description here..."
//               rows={3}
//               value={targetJd}
//               onChange={(e) => setTargetJd(e.target.value)}
//               className="w-full px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
//             />
//             <button
//               type="button"
//               onClick={handleAnalyzeJd}
//               disabled={aiLoading}
//               className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-purple-500/20 disabled:opacity-50"
//             >
//               {aiLoading ? 'Analyzing Match...' : '🔍 Analyze Job Match'}
//             </button>

//             {analysisResult && (
//               <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-purple-500/20 text-xs space-y-2">
//                 <div className="flex justify-between items-center">
//                   <span className="font-semibold text-slate-300">ATS Match Score</span>
//                   <span className="font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded text-[11px]">
//                     {analysisResult.matchScore}%
//                   </span>
//                 </div>
//                 {analysisResult.missingKeywords?.length > 0 && (
//                   <div>
//                     <p className="font-semibold text-rose-400 text-[11px] mb-1">Missing Keywords:</p>
//                     <div className="flex flex-wrap gap-1">
//                       {analysisResult.missingKeywords.map((kw, i) => (
//                         <span key={i} className="px-2 py-0.5 bg-rose-950/60 text-rose-300 border border-rose-800/50 rounded text-[10px]">
//                           {kw}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//                 {analysisResult.suggestions && (
//                   <p className="text-slate-400 text-[11px] leading-relaxed">
//                     <strong className="text-slate-300">Suggestion:</strong> {analysisResult.suggestions}
//                   </p>
//                 )}
//               </div>
//             )}
//           </div>

//         </div>

//         {/* Right Side: Resume Sheet Preview */}
//         <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 flex justify-center items-start overflow-y-auto max-h-[85vh]">
//           {/* Printable White Sheet Canvas */}
//           <div
//             ref={printRef}
//             className="w-full max-w-[800px] bg-white text-slate-900 p-10 rounded-lg shadow-2xl min-h-[1050px] transition-all"
//           >
//             {/* TEMPLATE 1: MODERN */}
//             {template === 'modern' && (
//               <div>
//                 <div className="border-b-2 border-indigo-600 pb-4 mb-6">
//                   <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
//                     {resumeData.personal_info.fullName || 'Your Name'}
//                   </h1>
//                   <p className="text-sm font-semibold text-indigo-600 mt-1">
//                     {resumeData.personal_info.jobTitle || 'Target Job Title'}
//                   </p>
//                   <p className="text-xs text-slate-500 mt-2">
//                     {resumeData.personal_info.email || 'email@example.com'} • {resumeData.personal_info.phone || '+92 300 1234567'}
//                   </p>
//                 </div>

//                 {resumeData.personal_info.summary && (
//                   <div className="mb-6">
//                     <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Professional Summary</h3>
//                     <p className="text-xs text-slate-700 leading-relaxed">{resumeData.personal_info.summary}</p>
//                   </div>
//                 )}

//                 {(resumeData.experience.company || resumeData.experience.role) && (
//                   <div className="mb-6">
//                     <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Experience</h3>
//                     <div className="flex justify-between text-xs font-bold text-slate-800">
//                       <span>{resumeData.experience.role} — {resumeData.experience.company}</span>
//                       <span className="text-slate-500 font-normal">{resumeData.experience.duration}</span>
//                     </div>
//                     <p className="text-xs text-slate-600 mt-1 leading-relaxed">{resumeData.experience.description}</p>
//                   </div>
//                 )}

//                 {(resumeData.education.degree || resumeData.education.institution) && (
//                   <div className="mb-6">
//                     <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Education</h3>
//                     <div className="flex justify-between text-xs font-bold text-slate-800">
//                       <span>{resumeData.education.degree}</span>
//                       <span className="text-slate-500 font-normal">{resumeData.education.year}</span>
//                     </div>
//                     <p className="text-xs text-slate-600">{resumeData.education.institution}</p>
//                   </div>
//                 )}

//                 {resumeData.skills && (
//                   <div className="mb-6">
//                     <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Skills</h3>
//                     <p className="text-xs text-slate-700 leading-relaxed">{resumeData.skills}</p>
//                   </div>
//                 )}

//                 {(resumeData.projects.title || resumeData.projects.description) && (
//                   <div className="mb-6">
//                     <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Projects</h3>
//                     <div className="flex justify-between text-xs font-bold text-slate-800">
//                       <span>{resumeData.projects.title}</span>
//                       <span className="text-indigo-600 text-[10px] font-normal">{resumeData.projects.link}</span>
//                     </div>
//                     <p className="text-xs text-slate-600 mt-1 leading-relaxed">{resumeData.projects.description}</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* TEMPLATE 2: CLASSIC */}
//             {template === 'classic' && (
//               <div className="font-serif">
//                 <div className="text-center border-b border-slate-300 pb-4 mb-6">
//                   <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">
//                     {resumeData.personal_info.fullName || 'Your Name'}
//                   </h1>
//                   <p className="text-sm italic text-slate-700 mt-1">
//                     {resumeData.personal_info.jobTitle || 'Target Job Title'}
//                   </p>
//                   <p className="text-xs text-slate-600 mt-1">
//                     {resumeData.personal_info.email} | {resumeData.personal_info.phone}
//                   </p>
//                 </div>

//                 {resumeData.personal_info.summary && (
//                   <div className="mb-5">
//                     <h3 className="text-xs font-bold uppercase border-b border-slate-400 pb-1 mb-2">Summary</h3>
//                     <p className="text-xs text-slate-800 leading-relaxed">{resumeData.personal_info.summary}</p>
//                   </div>
//                 )}

//                 {(resumeData.experience.company || resumeData.experience.role) && (
//                   <div className="mb-5">
//                     <h3 className="text-xs font-bold uppercase border-b border-slate-400 pb-1 mb-2">Work Experience</h3>
//                     <div className="flex justify-between text-xs font-bold">
//                       <span>{resumeData.experience.role}, {resumeData.experience.company}</span>
//                       <span>{resumeData.experience.duration}</span>
//                     </div>
//                     <p className="text-xs text-slate-700 mt-1 leading-relaxed">{resumeData.experience.description}</p>
//                   </div>
//                 )}

//                 {(resumeData.education.degree || resumeData.education.institution) && (
//                   <div className="mb-5">
//                     <h3 className="text-xs font-bold uppercase border-b border-slate-400 pb-1 mb-2">Education</h3>
//                     <div className="flex justify-between text-xs font-bold">
//                       <span>{resumeData.education.degree}</span>
//                       <span>{resumeData.education.year}</span>
//                     </div>
//                     <p className="text-xs text-slate-700">{resumeData.education.institution}</p>
//                   </div>
//                 )}

//                 {resumeData.skills && (
//                   <div className="mb-5">
//                     <h3 className="text-xs font-bold uppercase border-b border-slate-400 pb-1 mb-2">Key Skills</h3>
//                     <p className="text-xs text-slate-800 leading-relaxed">{resumeData.skills}</p>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* TEMPLATE 3: MINIMALIST */}
//             {template === 'minimalist' && (
//               <div className="font-mono">
//                 <div className="mb-6">
//                   <h1 className="text-2xl font-bold text-slate-900">
//                     {resumeData.personal_info.fullName || 'Your Name'}
//                   </h1>
//                   <p className="text-xs text-slate-500">
//                     {resumeData.personal_info.jobTitle} // {resumeData.personal_info.email}
//                   </p>
//                 </div>

//                 {resumeData.personal_info.summary && (
//                   <div className="mb-4">
//                     <p className="text-xs text-slate-700 leading-relaxed">{'> '} {resumeData.personal_info.summary}</p>
//                   </div>
//                 )}

//                 {(resumeData.experience.company || resumeData.experience.role) && (
//                   <div className="mb-4">
//                     <h3 className="text-xs font-bold underline mb-1">// EXPERIENCE</h3>
//                     <p className="text-xs font-bold">{resumeData.experience.role} @ {resumeData.experience.company}</p>
//                     <p className="text-xs text-slate-600 mt-0.5">{resumeData.experience.description}</p>
//                   </div>
//                 )}

//                 {(resumeData.education.degree || resumeData.education.institution) && (
//                   <div className="mb-4">
//                     <h3 className="text-xs font-bold underline mb-1">// EDUCATION</h3>
//                     <p className="text-xs">{resumeData.education.degree} - {resumeData.education.institution}</p>
//                   </div>
//                 )}

//                 {resumeData.skills && (
//                   <div className="mb-4">
//                     <h3 className="text-xs font-bold underline mb-1">// SKILLS</h3>
//                     <p className="text-xs">{resumeData.skills}</p>
//                   </div>
//                 )}
//               </div>
//             )}

//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// export default function BuilderPage() {
//   return (
//     <Suspense fallback={<div className="p-6 text-center text-slate-400">Loading Builder UI...</div>}>
//       <BuilderContent />
//     </Suspense>
//   );
// }





'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useReactToPrint } from 'react-to-print';

function BuilderContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [template, setTemplate] = useState('modern');
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');
  const printRef = useRef();

  const [targetJd, setTargetJd] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const [resumeData, setResumeData] = useState({
    title: 'My Resume',
    personal_info: { fullName: '', email: '', phone: '', jobTitle: '', summary: '' },
    education: { degree: '', institution: '', year: '' },
    experience: { company: '', role: '', duration: '', description: '' },
    skills: '',
    projects: { title: '', link: '', description: '' },
  });

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth');
        return;
      }

      setUser(session.user);

      if (resumeId) {
        const { data } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', resumeId)
          .single();

        if (data) {
          setResumeData({
            title: data.title || 'My Resume',
            personal_info: data.personal_info || resumeData.personal_info,
            education: data.education || resumeData.education,
            experience: data.experience || resumeData.experience,
            skills: data.skills || '',
            projects: data.projects || resumeData.projects,
          });
        }
      } else {
        // Pre-fill email for fresh new resume
        setResumeData((prev) => ({
          ...prev,
          personal_info: { ...prev.personal_info, email: session.user.email || '' },
        }));
      }
      setLoading(false);
    };

    checkUserAndFetchData();
  }, [router, resumeId]);

  const handleInputChange = (section, field, value) => {
    if (section === 'skills') {
      setResumeData({ ...resumeData, skills: value });
    } else if (section === 'title') {
      setResumeData({ ...resumeData, title: value });
    } else {
      setResumeData({
        ...resumeData,
        [section]: {
          ...resumeData[section],
          [field]: value,
        },
      });
    }
  };

  const handleGenerateSummary = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_summary',
          jobTitle: resumeData.personal_info.jobTitle,
          experience: resumeData.experience,
          skills: resumeData.skills,
        }),
      });

      const data = await res.json();
      if (data.summary) {
        setResumeData((prev) => ({
          ...prev,
          personal_info: { ...prev.personal_info, summary: data.summary },
        }));
      } else if (data.error) {
        alert('AI Error: ' + data.error);
      }
    } catch (err) {
      alert('Error connecting to AI backend: ' + err.message);
    }
    setAiLoading(false);
  };

  const handleAnalyzeJd = async () => {
    if (!targetJd) {
      alert('Please paste a Job Description first!');
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_jd',
          jobTitle: resumeData.personal_info.jobTitle,
          jobDescription: targetJd,
          skills: resumeData.skills,
          experience: resumeData.experience,
        }),
      });

      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      alert('Error analyzing JD: ' + err.message);
    }
    setAiLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    if (!resumeData.personal_info.fullName && !resumeData.personal_info.jobTitle) {
      alert('Please fill in at least your Full Name or Job Title before saving.');
      return;
    }

    setSaving(true);

    let error;
    if (resumeId) {
      const res = await supabase
        .from('resumes')
        .update({
          title: resumeData.title || 'My Resume',
          personal_info: resumeData.personal_info,
          education: resumeData.education,
          experience: resumeData.experience,
          skills: resumeData.skills,
          projects: resumeData.projects,
        })
        .eq('id', resumeId);
      error = res.error;
    } else {
      const res = await supabase
        .from('resumes')
        .insert([
          {
            user_id: user.id,
            title: resumeData.title || 'My Resume',
            personal_info: resumeData.personal_info,
            education: resumeData.education,
            experience: resumeData.experience,
            skills: resumeData.skills,
            projects: resumeData.projects,
          },
        ]);
      error = res.error;
    }

    setSaving(false);

    if (error) {
      alert('Error saving resume: ' + error.message);
    } else {
      router.push('/dashboard');
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `${resumeData.personal_info.fullName || 'Resume'}_CareerCraft`,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-300">Loading Resume Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex flex-wrap gap-4 justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60"
          >
            ← Dashboard
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <input
              type="text"
              value={resumeData.title}
              onChange={(e) => handleInputChange('title', '', e.target.value)}
              className="text-base font-bold text-slate-100 bg-transparent border-b border-slate-700 focus:border-indigo-500 focus:outline-none px-1 py-0.5 transition-colors"
              placeholder="Resume Title"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Template Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setTemplate('modern')}
              className={`px-3 py-1 rounded-lg transition-all ${template === 'modern' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Modern
            </button>
            <button
              onClick={() => setTemplate('classic')}
              className={`px-3 py-1 rounded-lg transition-all ${template === 'classic' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Classic
            </button>
            <button
              onClick={() => setTemplate('minimalist')}
              className={`px-3 py-1 rounded-lg transition-all ${template === 'minimalist' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              Minimalist
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            📥 PDF Export
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Exit'}
          </button>
        </div>
      </header>

      {/* Main Split Screen */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 lg:p-6 max-w-[1700px] mx-auto w-full">
        
        {/* Left Side: Form Controls */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 overflow-y-auto max-h-[85vh] space-y-6 custom-scrollbar">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold tracking-wide uppercase text-indigo-400 flex items-center gap-2">
              ✏️ Content Builder
            </h2>
            <span className="text-[10px] text-slate-500">Auto-syncing preview</span>
          </div>

          {/* Personal Info */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">1. Personal Information</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={resumeData.personal_info.fullName}
              onChange={(e) => handleInputChange('personal_info', 'fullName', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Email Address"
                value={resumeData.personal_info.email}
                onChange={(e) => handleInputChange('personal_info', 'email', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={resumeData.personal_info.phone}
                onChange={(e) => handleInputChange('personal_info', 'phone', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Target Job Title (e.g. Full Stack Developer)"
              value={resumeData.personal_info.jobTitle}
              onChange={(e) => handleInputChange('personal_info', 'jobTitle', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />

            <div className="flex justify-between items-center mt-2">
              <label className="text-[11px] font-medium text-slate-400">Summary</label>
              <button
                type="button"
                onClick={handleGenerateSummary}
                disabled={aiLoading}
                className="px-2.5 py-1 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 rounded-lg text-[11px] font-bold transition-all disabled:opacity-50"
              >
                {aiLoading ? 'Generating...' : '✨ AI Generate Summary'}
              </button>
            </div>
            <textarea
              placeholder="Professional Summary"
              rows={3}
              value={resumeData.personal_info.summary}
              onChange={(e) => handleInputChange('personal_info', 'summary', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Education */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">2. Education</h3>
            <input
              type="text"
              placeholder="Degree / Major"
              value={resumeData.education.degree}
              onChange={(e) => handleInputChange('education', 'degree', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Institution / University"
                value={resumeData.education.institution}
                onChange={(e) => handleInputChange('education', 'institution', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Graduation Year / Duration"
                value={resumeData.education.year}
                onChange={(e) => handleInputChange('education', 'year', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Experience */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">3. Experience</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Company Name"
                value={resumeData.experience.company}
                onChange={(e) => handleInputChange('experience', 'company', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Role / Designation"
                value={resumeData.experience.role}
                onChange={(e) => handleInputChange('experience', 'role', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <input
              type="text"
              placeholder="Duration (e.g. 2022 - Present)"
              value={resumeData.experience.duration}
              onChange={(e) => handleInputChange('experience', 'duration', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
            <textarea
              placeholder="Job Description & Key Achievements"
              rows={3}
              value={resumeData.experience.description}
              onChange={(e) => handleInputChange('experience', 'description', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Skills */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">4. Skills</h3>
            <input
              type="text"
              placeholder="Skills (e.g. Next.js, React, Node.js, Express, MongoDB)"
              value={resumeData.skills}
              onChange={(e) => handleInputChange('skills', '', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Projects */}
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/50">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">5. Projects</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Project Title"
                value={resumeData.projects.title}
                onChange={(e) => handleInputChange('projects', 'title', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Project Link"
                value={resumeData.projects.link}
                onChange={(e) => handleInputChange('projects', 'link', e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <textarea
              placeholder="Project Details"
              rows={2}
              value={resumeData.projects.description}
              onChange={(e) => handleInputChange('projects', 'description', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* AI Job Description Match Analyzer */}
          <div className="space-y-3 bg-gradient-to-b from-purple-950/30 to-indigo-950/30 p-4 rounded-xl border border-purple-500/30">
            <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
              🤖 AI Job Description Analyzer
            </h3>
            <textarea
              placeholder="Paste target Job Description here..."
              rows={3}
              value={targetJd}
              onChange={(e) => setTargetJd(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-xs text-slate-200 focus:border-purple-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAnalyzeJd}
              disabled={aiLoading}
              className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-purple-500/20 disabled:opacity-50"
            >
              {aiLoading ? 'Analyzing Match...' : '🔍 Analyze Job Match'}
            </button>

            {analysisResult && (
              <div className="mt-3 p-3 bg-slate-900/90 rounded-lg border border-purple-500/20 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-300">ATS Match Score</span>
                  <span className="font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded text-[11px]">
                    {analysisResult.matchScore}%
                  </span>
                </div>
                {analysisResult.missingKeywords?.length > 0 && (
                  <div>
                    <p className="font-semibold text-rose-400 text-[11px] mb-1">Missing Keywords:</p>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.missingKeywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-rose-950/60 text-rose-300 border border-rose-800/50 rounded text-[10px]">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {analysisResult.suggestions && (
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    <strong className="text-slate-300">Suggestion:</strong> {analysisResult.suggestions}
                  </p>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Resume Sheet Preview */}
        <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-6 flex justify-center items-start overflow-y-auto max-h-[85vh]">
          {/* Printable White Sheet Canvas */}
          <div
            ref={printRef}
            className="w-full max-w-[800px] bg-white text-slate-900 p-10 rounded-lg shadow-2xl min-h-[1050px] transition-all"
          >
            {/* TEMPLATE 1: MODERN */}
            {template === 'modern' && (
              <div>
                <div className="border-b-2 border-indigo-600 pb-4 mb-6">
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {resumeData.personal_info.fullName || 'Your Name'}
                  </h1>
                  <p className="text-sm font-semibold text-indigo-600 mt-1">
                    {resumeData.personal_info.jobTitle || 'Target Job Title'}
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    {resumeData.personal_info.email || 'email@example.com'} • {resumeData.personal_info.phone || '+92 300 1234567'}
                  </p>
                </div>

                {resumeData.personal_info.summary && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Professional Summary</h3>
                    <p className="text-xs text-slate-700 leading-relaxed">{resumeData.personal_info.summary}</p>
                  </div>
                )}

                {(resumeData.experience.company || resumeData.experience.role) && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Experience</h3>
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{resumeData.experience.role} — {resumeData.experience.company}</span>
                      <span className="text-slate-500 font-normal">{resumeData.experience.duration}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{resumeData.experience.description}</p>
                  </div>
                )}

                {(resumeData.education.degree || resumeData.education.institution) && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Education</h3>
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{resumeData.education.degree}</span>
                      <span className="text-slate-500 font-normal">{resumeData.education.year}</span>
                    </div>
                    <p className="text-xs text-slate-600">{resumeData.education.institution}</p>
                  </div>
                )}

                {resumeData.skills && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Skills</h3>
                    <p className="text-xs text-slate-700 leading-relaxed">{resumeData.skills}</p>
                  </div>
                )}

                {(resumeData.projects.title || resumeData.projects.description) && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Projects</h3>
                    <div className="flex justify-between text-xs font-bold text-slate-800">
                      <span>{resumeData.projects.title}</span>
                      <span className="text-indigo-600 text-[10px] font-normal">{resumeData.projects.link}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{resumeData.projects.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* TEMPLATE 2: CLASSIC */}
            {template === 'classic' && (
              <div className="font-serif">
                <div className="text-center border-b border-slate-300 pb-4 mb-6">
                  <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900">
                    {resumeData.personal_info.fullName || 'Your Name'}
                  </h1>
                  <p className="text-sm italic text-slate-700 mt-1">
                    {resumeData.personal_info.jobTitle || 'Target Job Title'}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {resumeData.personal_info.email} | {resumeData.personal_info.phone}
                  </p>
                </div>

                {resumeData.personal_info.summary && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase border-b border-slate-400 pb-1 mb-2">Summary</h3>
                    <p className="text-xs text-slate-800 leading-relaxed">{resumeData.personal_info.summary}</p>
                  </div>
                )}

                {(resumeData.experience.company || resumeData.experience.role) && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase border-b border-slate-400 pb-1 mb-2">Work Experience</h3>
                    <div className="flex justify-between text-xs font-bold">
                      <span>{resumeData.experience.role}, {resumeData.experience.company}</span>
                      <span>{resumeData.experience.duration}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">{resumeData.experience.description}</p>
                  </div>
                )}

                {(resumeData.education.degree || resumeData.education.institution) && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase border-b border-slate-400 pb-1 mb-2">Education</h3>
                    <div className="flex justify-between text-xs font-bold">
                      <span>{resumeData.education.degree}</span>
                      <span>{resumeData.education.year}</span>
                    </div>
                    <p className="text-xs text-slate-700">{resumeData.education.institution}</p>
                  </div>
                )}

                {resumeData.skills && (
                  <div className="mb-5">
                    <h3 className="text-xs font-bold uppercase border-b border-slate-400 pb-1 mb-2">Key Skills</h3>
                    <p className="text-xs text-slate-800 leading-relaxed">{resumeData.skills}</p>
                  </div>
                )}
              </div>
            )}

            {/* TEMPLATE 3: MINIMALIST */}
            {template === 'minimalist' && (
              <div className="font-mono">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {resumeData.personal_info.fullName || 'Your Name'}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {resumeData.personal_info.jobTitle} // {resumeData.personal_info.email}
                  </p>
                </div>

                {resumeData.personal_info.summary && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-700 leading-relaxed">{'> '} {resumeData.personal_info.summary}</p>
                  </div>
                )}

                {(resumeData.experience.company || resumeData.experience.role) && (
                  <div className="mb-4">
                    <h3 className="text-xs font-bold underline mb-1">// EXPERIENCE</h3>
                    <p className="text-xs font-bold">{resumeData.experience.role} @ {resumeData.experience.company}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{resumeData.experience.description}</p>
                  </div>
                )}

                {(resumeData.education.degree || resumeData.education.institution) && (
                  <div className="mb-4">
                    <h3 className="text-xs font-bold underline mb-1">// EDUCATION</h3>
                    <p className="text-xs">{resumeData.education.degree} - {resumeData.education.institution}</p>
                  </div>
                )}

                {resumeData.skills && (
                  <div className="mb-4">
                    <h3 className="text-xs font-bold underline mb-1">// SKILLS</h3>
                    <p className="text-xs">{resumeData.skills}</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-slate-400">Loading Builder UI...</div>}>
      <BuilderContent />
    </Suspense>
  );
}