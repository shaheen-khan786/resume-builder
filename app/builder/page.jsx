

// 'use client';

// import { useEffect, useState, Suspense } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';

// function BuilderContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const resumeId = searchParams.get('id');

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [generating, setGenerating] = useState(false);
  
//   // Analyzer states
//   const [jobDescription, setJobDescription] = useState('');
//   const [analyzing, setAnalyzing] = useState(false);
//   const [atsResult, setAtsResult] = useState(null);

//   const [template, setTemplate] = useState('modern');

//   // Form State
//   const [formData, setFormData] = useState({
//     title: 'My Resume',
//     personal_info: {
//       fullName: '',
//       email: '',
//       phone: '',
//       jobTitle: '',
//       summary: '',
//     },
//     education: {
//       degree: '',
//       institution: '',
//       year: '',
//     },
//     experience: {
//       title: '',
//       company: '',
//       duration: '',
//       description: '',
//     },
//     skills: '',
//   });

//   useEffect(() => {
//     const fetchResume = async () => {
//       const { data: { session } } = await supabase.auth.getSession();
//       if (!session) {
//         router.push('/auth');
//         return;
//       }

//       if (resumeId) {
//         const { data, error } = await supabase
//           .from('resumes')
//           .select('*')
//           .eq('id', resumeId)
//           .single();

//         if (data) {
//           setFormData({
//             title: data.title || 'My Resume',
//             personal_info: data.personal_info || {},
//             education: data.education || {},
//             experience: data.experience || {},
//             skills: data.skills || '',
//           });
//         } else if (error) {
//           console.error('Error fetching resume:', error);
//         }
//       }
//       setLoading(false);
//     };

//     fetchResume();
//   }, [resumeId, router]);

//   const handleChange = (section, field, value) => {
//     if (section) {
//       setFormData((prev) => ({
//         ...prev,
//         [section]: {
//           ...prev[section],
//           [field]: value,
//         },
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         [field]: value,
//       }));
//     }
//   };

//   const handleAISummary = async () => {
//     setGenerating(true);
//     try {
//       const res = await fetch('/api/ai-optimize', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action: 'generate_summary',
//           jobTitle: formData.personal_info?.jobTitle,
//           skills: formData.skills,
//           experience: formData.experience,
//         }),
//       });

//       const data = await res.json();
//       if (res.ok && data.summary) {
//         handleChange('personal_info', 'summary', data.summary);
//       } else {
//         alert(data.error || 'Failed to generate summary.');
//       }
//     } catch (err) {
//       console.error(err);
//       alert('AI service error. Please try again.');
//     } finally {
//       setGenerating(false);
//     }
//   };

//   const handleAnalyzeJD = async () => {
//     if (!jobDescription.trim()) {
//       alert('Please paste a job description first.');
//       return;
//     }

//     setAnalyzing(true);
//     try {
//       const res = await fetch('/api/ai-optimize', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           action: 'analyze_jd',
//           jobTitle: formData.personal_info?.jobTitle || '',
//           skills: formData.skills || '',
//           experience: formData.experience || '',
//           jobDescription: jobDescription,
//         }),
//       });

//       const data = await res.json();

//       if (res.ok && data) {
//         setAtsResult({
//           matchScore: data.matchScore || 0,
//           missingKeywords: data.missingKeywords || [],
//           suggestions: data.suggestions || '',
//         });
//       } else {
//         alert(data.error || 'Failed to analyze Job Description.');
//       }
//     } catch (err) {
//       console.error('Analysis error:', err);
//       alert('Failed to analyze. Please try again.');
//     } finally {
//       setAnalyzing(false);
//     }
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     const { data: { session } } = await supabase.auth.getSession();
//     if (!session) {
//       router.push('/auth');
//       return;
//     }

//     const payload = {
//       user_id: session.user.id,
//       title: formData.title || 'Untitled Resume',
//       personal_info: formData.personal_info,
//       education: formData.education,
//       experience: formData.experience,
//       skills: formData.skills,
//     };

//     if (resumeId) {
//       const { error } = await supabase
//         .from('resumes')
//         .update(payload)
//         .eq('id', resumeId);

//       if (error) alert('Error updating: ' + error.message);
//       else router.push('/dashboard');
//     } else {
//       const { error } = await supabase
//         .from('resumes')
//         .insert([payload]);

//       if (error) alert('Error saving: ' + error.message);
//       else router.push('/dashboard');
//     }
//     setSaving(false);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
//         <div className="flex items-center gap-3">
//           <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//           <p className="text-sm font-medium text-slate-300">Loading Builder...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">

//      {/* Print Global Styles for Clean PDF Export */}
//       <style jsx global>{`
//         @media print {
//           body {
//             background: white !important;
//             color: black !important;
//           }
//           header, .no-print, form, input, textarea, button {
//             display: none !important;
//           }
//           #printable-resume {
//             display: block !important;
//             position: absolute !important;
//             left: 0 !important;
//             top: 0 !important;
//             width: 100% !important;
//             box-shadow: none !important;
//             border: none !important;
//             margin: 0 !important;
//             padding: 10px !important;
//             background: white !important;
//             color: black !important;
//           }
//         }
//       `}</style>

//       {/* Top Navbar */}
//       <header className="no-print bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex justify-between items-center sticky top-0 z-50">
//         <div className="flex items-center gap-4">
//           <button
//             onClick={() => router.push('/dashboard')}
//             className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all"
//           >
//             ← Dashboard
//           </button>
//           <input
//             type="text"
//             value={formData.title}
//             onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//             className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-indigo-500 px-1 py-0.5 outline-none transition-all"
//             placeholder="Resume Title"
//           />
//         </div>

//         {/* Template Switcher & Actions */}
//         <div className="flex items-center gap-3">
//           <div className="hidden sm:flex bg-slate-950 p-1 rounded-xl border border-slate-800">
//             <button
//               onClick={() => setTemplate('modern')}
//               className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${template === 'modern' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
//             >
//               Modern
//             </button>
//             <button
//               onClick={() => setTemplate('classic')}
//               className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${template === 'classic' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
//             >
//               Classic
//             </button>
//             <button
//               onClick={() => setTemplate('minimalist')}
//               className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${template === 'minimalist' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
//             >
//               Minimalist
//             </button>
//           </div>

//           <button
//             onClick={() => window.print()}
//             className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all"
//           >
//             PDF Export
//           </button>
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
//           >
//             {saving ? 'Saving...' : 'Save & Exit'}
//           </button>
//         </div>
//       </header>

//       {/* Main Workspace */}
//       <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 max-w-[1600px] w-full mx-auto p-6 gap-8">
        
//         {/* Left Side: Form Builder */}
//         <div className="no-print space-y-6 overflow-y-auto max-h-[calc(100vh-100px)] pr-2">
          
//           {/* Section 1: Personal Info */}
//           <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-4">
//             <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">1. Personal Information</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//               <div>
//                 <label className="text-[11px] text-slate-400 mb-1 block">Full Name</label>
//                 <input
//                   type="text"
//                   value={formData.personal_info.fullName || ''}
//                   onChange={(e) => handleChange('personal_info', 'fullName', e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
//                   placeholder="Shaheen Khan"
//                 />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400 mb-1 block">Job Title</label>
//                 <input
//                   type="text"
//                   value={formData.personal_info.jobTitle || ''}
//                   onChange={(e) => handleChange('personal_info', 'jobTitle', e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
//                   placeholder="Full Stack Developer"
//                 />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400 mb-1 block">Email</label>
//                 <input
//                   type="email"
//                   value={formData.personal_info.email || ''}
//                   onChange={(e) => handleChange('personal_info', 'email', e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
//                   placeholder="shaheen@gmail.com"
//                 />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400 mb-1 block">Phone</label>
//                 <input
//                   type="text"
//                   value={formData.personal_info.phone || ''}
//                   onChange={(e) => handleChange('personal_info', 'phone', e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
//                   placeholder="+92 300 1234567"
//                 />
//               </div>
//             </div>

//             <div>
//               <div className="flex justify-between items-center mb-1">
//                 <label className="text-[11px] text-slate-400">Professional Summary</label>
//                 <button
//                   type="button"
//                   onClick={handleAISummary}
//                   disabled={generating}
//                   className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/80 border border-indigo-800/50 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
//                 >
//                   {generating ? '✨ Generating...' : '✨ AI Generate Summary'}
//                 </button>
//               </div>
//               <textarea
//                 rows={3}
//                 value={formData.personal_info.summary || ''}
//                 onChange={(e) => handleChange('personal_info', 'summary', e.target.value)}
//                 className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
//                 placeholder="Write a brief professional summary..."
//               />
//             </div>
//           </div>

//           {/* Section 2: Education */}
//           <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-4">
//             <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">2. Education</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               <div>
//                 <label className="text-[11px] text-slate-400 mb-1 block">Degree</label>
//                 <input
//                   type="text"
//                   value={formData.education.degree || ''}
//                   onChange={(e) => handleChange('education', 'degree', e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
//                   placeholder="BSCS"
//                 />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400 mb-1 block">Institution</label>
//                 <input
//                   type="text"
//                   value={formData.education.institution || ''}
//                   onChange={(e) => handleChange('education', 'institution', e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
//                   placeholder="Virtual University"
//                 />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400 mb-1 block">Year</label>
//                 <input
//                   type="text"
//                   value={formData.education.year || ''}
//                   onChange={(e) => handleChange('education', 'year', e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
//                   placeholder="2027"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Section 3: Experience */}
//           <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-4">
//             <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">3. Experience</h3>
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               <div>
//                 <label className="text-[11px] text-slate-400 mb-1 block">Role Title</label>
//                 <input
//                   type="text"
//                   value={formData.experience.title || ''}
//                   onChange={(e) => handleChange('experience', 'title', e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
//                   placeholder="Full Stack Developer"
//                 />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400 mb-1 block">Company</label>
//                 <input
//                   type="text"
//                   value={formData.experience.company || ''}
//                   onChange={(e) => handleChange('experience', 'company', e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
//                   placeholder="Freelance / Project"
//                 />
//               </div>
//               <div>
//                 <label className="text-[11px] text-slate-400 mb-1 block">Duration</label>
//                 <input
//                   type="text"
//                   value={formData.experience.duration || ''}
//                   onChange={(e) => handleChange('experience', 'duration', e.target.value)}
//                   className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
//                   placeholder="2 Years"
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="text-[11px] text-slate-400 mb-1 block">Description</label>
//               <textarea
//                 rows={3}
//                 value={formData.experience.description || ''}
//                 onChange={(e) => handleChange('experience', 'description', e.target.value)}
//                 className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
//                 placeholder="Developed responsive web applications..."
//               />
//             </div>
//           </div>

//           {/* Section 4: Skills */}
//           <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-4">
//             <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">4. Skills</h3>
//             <div>
//               <label className="text-[11px] text-slate-400 mb-1 block">Comma-separated skills</label>
//               <input
//                 type="text"
//                 value={formData.skills || ''}
//                 onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
//                 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
//                 placeholder="Next.js, React, Node.js, Tailwind CSS, Supabase"
//               />
//             </div>
//           </div>

//           {/* Section 5: AI JOB DESCRIPTION ANALYZER */}
//           <div className="bg-slate-900/60 rounded-2xl border border-indigo-500/30 p-6 shadow-inner space-y-4">
//             <div className="flex items-center gap-2">
//               <span className="text-base">🤖</span>
//               <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
//                 AI Job Description Analyzer
//               </h3>
//             </div>

//             <textarea
//               rows={4}
//               value={jobDescription}
//               onChange={(e) => setJobDescription(e.target.value)}
//               placeholder="Paste target Job Description here to calculate ATS match score..."
//               className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
//             />

//             <button
//               type="button"
//               onClick={handleAnalyzeJD}
//               disabled={analyzing}
//               className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
//             >
//               {analyzing ? (
//                 <>
//                   <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Analyzing Match...
//                 </>
//               ) : (
//                 '🔍 Analyze Job Match'
//               )}
//             </button>

//             {/* ATS MATCH RESULTS DISPLAY */}
//             {atsResult && (
//               <div className="mt-4 p-4 bg-slate-950/90 rounded-xl border border-slate-800/80 space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs font-bold text-slate-300">ATS Match Score</span>
//                   <span className="text-sm font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-lg">
//                     {atsResult.matchScore}%
//                   </span>
//                 </div>

//                 {atsResult.missingKeywords && atsResult.missingKeywords.length > 0 && (
//                   <div>
//                     <p className="text-[11px] font-semibold text-rose-400 mb-1.5">Missing Keywords:</p>
//                     <div className="flex flex-wrap gap-1.5">
//                       {atsResult.missingKeywords.map((kw, idx) => (
//                         <span
//                           key={idx}
//                           className="text-[10px] bg-rose-950/40 text-rose-300 border border-rose-800/40 px-2 py-0.5 rounded-md"
//                         >
//                           + {kw}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {atsResult.suggestions && (
//                   <div className="pt-2 border-t border-slate-800/80">
//                     <p className="text-[11px] font-semibold text-indigo-300 mb-1">AI Recommendation:</p>
//                     <p className="text-xs text-slate-400 leading-relaxed">
//                       {atsResult.suggestions}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//         </div>

//         {/* Right Side: Live Resume Preview */}
//         <div className="bg-slate-900/40 rounded-2xl border border-slate-800 p-8 flex flex-col justify-start items-center sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto">
          
//           {/* Resume Container with Dynamic Template Classes */}
//           <div
//             id="printable-resume"
//             className={`w-full max-w-[650px] text-slate-900 p-8 rounded-xl shadow-2xl min-h-[750px] flex flex-col justify-between transition-all ${
//               template === 'classic'
//                 ? 'bg-amber-50/90 font-serif border-2 border-amber-900/20'
//                 : template === 'minimalist'
//                 ? 'bg-stone-50 font-mono border border-stone-300'
//                 : 'bg-white font-sans'
//             }`}
//           >
//             <div>
//               {/* Header */}
//               <div className={`pb-4 mb-6 ${template === 'classic' ? 'border-b-2 border-amber-900/30 text-center' : template === 'minimalist' ? 'border-b border-stone-400' : 'border-b border-slate-300'}`}>
//                 <h1 className={`text-2xl font-extrabold tracking-tight ${template === 'classic' ? 'text-amber-950 font-serif' : template === 'minimalist' ? 'text-stone-950 tracking-widest uppercase' : 'text-slate-900'}`}>
//                   {formData.personal_info.fullName || 'Your Name'}
//                 </h1>
//                 <p className={`text-sm font-semibold mt-0.5 ${template === 'classic' ? 'text-amber-800 italic font-serif' : template === 'minimalist' ? 'text-stone-600' : 'text-indigo-600'}`}>
//                   {formData.personal_info.jobTitle || 'Professional Title'}
//                 </p>
//                 <div className={`flex gap-4 text-xs mt-2 ${template === 'classic' ? 'justify-center text-amber-900/80' : template === 'minimalist' ? 'text-stone-600' : 'text-slate-600'}`}>
//                   <span>{formData.personal_info.email || 'email@example.com'}</span>
//                   <span>•</span>
//                   <span>{formData.personal_info.phone || 'Phone Number'}</span>
//                 </div>
//               </div>

//               {/* Summary */}
//               {formData.personal_info.summary && (
//                 <div className="mb-6">
//                   <h2 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${template === 'classic' ? 'text-amber-900 font-serif text-center' : template === 'minimalist' ? 'text-stone-900 font-bold border-b border-stone-300 pb-1' : 'text-slate-400'}`}>
//                     Professional Summary
//                   </h2>
//                   <p className={`text-xs leading-relaxed ${template === 'classic' ? 'text-amber-950 text-center italic' : template === 'minimalist' ? 'text-stone-800' : 'text-slate-700'}`}>
//                     {formData.personal_info.summary}
//                   </p>
//                 </div>
//               )}

//               {/* Experience */}
//               {(formData.experience.title || formData.experience.company) && (
//                 <div className="mb-6">
//                   <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 ${template === 'classic' ? 'text-amber-900 font-serif text-center' : template === 'minimalist' ? 'text-stone-900 font-bold border-b border-stone-300 pb-1' : 'text-slate-400'}`}>
//                     Experience
//                   </h2>
//                   <div className="flex justify-between items-start mb-1">
//                     <h3 className={`text-xs font-bold ${template === 'classic' ? 'text-amber-950 font-serif' : 'text-slate-800'}`}>
//                       {formData.experience.title} {formData.experience.company && `— ${formData.experience.company}`}
//                     </h3>
//                     <span className="text-[11px] text-slate-500 font-medium">{formData.experience.duration}</span>
//                   </div>
//                   <p className="text-xs text-slate-600 leading-relaxed">{formData.experience.description}</p>
//                 </div>
//               )}

//               {/* Education */}
//               {(formData.education.degree || formData.education.institution) && (
//                 <div className="mb-6">
//                   <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 ${template === 'classic' ? 'text-amber-900 font-serif text-center' : template === 'minimalist' ? 'text-stone-900 font-bold border-b border-stone-300 pb-1' : 'text-slate-400'}`}>
//                     Education
//                   </h2>
//                   <div className="flex justify-between items-center">
//                     <h3 className={`text-xs font-bold ${template === 'classic' ? 'text-amber-950 font-serif' : 'text-slate-800'}`}>
//                       {formData.education.degree} {formData.education.institution && `at ${formData.education.institution}`}
//                     </h3>
//                     <span className="text-[11px] text-slate-500 font-medium">{formData.education.year}</span>
//                   </div>
//                 </div>
//               )}

//               {/* Skills */}
//               {formData.skills && (
//                 <div>
//                   <h2 className={`text-xs font-bold uppercase tracking-wider mb-2 ${template === 'classic' ? 'text-amber-900 font-serif text-center' : template === 'minimalist' ? 'text-stone-900 font-bold border-b border-stone-300 pb-1' : 'text-slate-400'}`}>
//                     Skills
//                   </h2>
//                   <p className="text-xs text-slate-700 leading-relaxed">{formData.skills}</p>
//                 </div>
//               )}
//             </div>

//             <div className={`text-center pt-6 border-t text-[10px] ${template === 'classic' ? 'border-amber-900/20 text-amber-900/60' : template === 'minimalist' ? 'border-stone-300 text-stone-500' : 'border-slate-200 text-slate-400'}`}>
//               Powered by CareerCraft AI Studio
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// export default function BuilderPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
//         <div className="flex items-center gap-3">
//           <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//           <p className="text-sm font-medium text-slate-300">Loading Builder...</p>
//         </div>
//       </div>
//     }>
//       <BuilderContent />
//     </Suspense>
//   );
// }













'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Analyzer states
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState(null);

  const [template, setTemplate] = useState('modern');

  // Form State
  const [formData, setFormData] = useState({
    title: 'My Resume',
    personal_info: {
      fullName: '',
      email: '',
      phone: '',
      jobTitle: '',
      summary: '',
    },
    education: {
      degree: '',
      institution: '',
      year: '',
    },
    experience: {
      title: '',
      company: '',
      duration: '',
      description: '',
    },
    skills: '',
  });

  useEffect(() => {
    const fetchResume = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth');
        return;
      }

      if (resumeId) {
        const { data, error } = await supabase
          .from('resumes')
          .select('*')
          .eq('id', resumeId)
          .single();

        if (data) {
          setFormData({
            title: data.title || 'My Resume',
            personal_info: data.personal_info || {},
            education: data.education || {},
            experience: data.experience || {},
            skills: data.skills || '',
          });
        } else if (error) {
          console.error('Error fetching resume:', error);
        }
      }
      setLoading(false);
    };

    fetchResume();
  }, [resumeId, router]);

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAISummary = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/ai-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_summary',
          jobTitle: formData.personal_info?.jobTitle,
          skills: formData.skills,
          experience: formData.experience,
        }),
      });

      const data = await res.json();
      if (res.ok && data.summary) {
        handleChange('personal_info', 'summary', data.summary);
      } else {
        alert(data.error || 'Failed to generate summary.');
      }
    } catch (err) {
      console.error(err);
      alert('AI service error. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnalyzeJD = async () => {
    if (!jobDescription.trim()) {
      alert('Please paste a job description first.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await fetch('/api/ai-optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_jd',
          jobTitle: formData.personal_info?.jobTitle || '',
          skills: formData.skills || '',
          experience: formData.experience || '',
          jobDescription: jobDescription,
        }),
      });

      const data = await res.json();

      if (res.ok && data) {
        setAtsResult({
          matchScore: data.matchScore || 0,
          missingKeywords: data.missingKeywords || [],
          suggestions: data.suggestions || '',
        });
      } else {
        alert(data.error || 'Failed to analyze Job Description.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      alert('Failed to analyze. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth');
      return;
    }

    const payload = {
      user_id: session.user.id,
      title: formData.title || 'Untitled Resume',
      personal_info: formData.personal_info,
      education: formData.education,
      experience: formData.experience,
      skills: formData.skills,
    };

    if (resumeId) {
      const { error } = await supabase
        .from('resumes')
        .update(payload)
        .eq('id', resumeId);

      if (error) alert('Error updating: ' + error.message);
      else router.push('/dashboard');
    } else {
      const { error } = await supabase
        .from('resumes')
        .insert([payload]);

      if (error) alert('Error saving: ' + error.message);
      else router.push('/dashboard');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-300">Loading Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Absolute Clean Print CSS */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 15mm;
          }
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, .no-print {
            display: none !important;
          }
          #printable-resume {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
        }
      `}</style>

      {/* Top Navbar */}
      <header className="no-print bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all"
          >
            ← Dashboard
          </button>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="bg-transparent text-sm font-bold text-white border-b border-transparent hover:border-slate-700 focus:border-indigo-500 px-1 py-0.5 outline-none transition-all"
            placeholder="Resume Title"
          />
        </div>

        {/* Template Switcher & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTemplate('modern')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${template === 'modern' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Modern
            </button>
            <button
              onClick={() => setTemplate('classic')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${template === 'classic' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Classic
            </button>
            <button
              onClick={() => setTemplate('minimalist')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${template === 'minimalist' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Minimalist
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-all"
          >
            PDF Export
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            {saving ? 'Saving...' : 'Save & Exit'}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 max-w-[1600px] w-full mx-auto p-6 gap-8">
        
        {/* Left Side: Form Builder */}
        <div className="no-print space-y-6 overflow-y-auto max-h-[calc(100vh-100px)] pr-2">
          
          {/* Section 1: Personal Info */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">1. Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Full Name</label>
                <input
                  type="text"
                  value={formData.personal_info.fullName || ''}
                  onChange={(e) => handleChange('personal_info', 'fullName', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Shaheen Khan"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Job Title</label>
                <input
                  type="text"
                  value={formData.personal_info.jobTitle || ''}
                  onChange={(e) => handleChange('personal_info', 'jobTitle', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Full Stack Developer"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Email</label>
                <input
                  type="email"
                  value={formData.personal_info.email || ''}
                  onChange={(e) => handleChange('personal_info', 'email', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="shaheen@gmail.com"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Phone</label>
                <input
                  type="text"
                  value={formData.personal_info.phone || ''}
                  onChange={(e) => handleChange('personal_info', 'phone', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[11px] text-slate-400">Professional Summary</label>
                <button
                  type="button"
                  onClick={handleAISummary}
                  disabled={generating}
                  className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-950/80 border border-indigo-800/50 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
                >
                  {generating ? '✨ Generating...' : '✨ AI Generate Summary'}
                </button>
              </div>
              <textarea
                rows={3}
                value={formData.personal_info.summary || ''}
                onChange={(e) => handleChange('personal_info', 'summary', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                placeholder="Write a brief professional summary..."
              />
            </div>
          </div>

          {/* Section 2: Education */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">2. Education</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Degree</label>
                <input
                  type="text"
                  value={formData.education.degree || ''}
                  onChange={(e) => handleChange('education', 'degree', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="BSCS"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Institution</label>
                <input
                  type="text"
                  value={formData.education.institution || ''}
                  onChange={(e) => handleChange('education', 'institution', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Virtual University"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Year</label>
                <input
                  type="text"
                  value={formData.education.year || ''}
                  onChange={(e) => handleChange('education', 'year', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="2027"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Experience */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">3. Experience</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Role Title</label>
                <input
                  type="text"
                  value={formData.experience.title || ''}
                  onChange={(e) => handleChange('experience', 'title', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Full Stack Developer"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Company</label>
                <input
                  type="text"
                  value={formData.experience.company || ''}
                  onChange={(e) => handleChange('experience', 'company', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Freelance / Project"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 mb-1 block">Duration</label>
                <input
                  type="text"
                  value={formData.experience.duration || ''}
                  onChange={(e) => handleChange('experience', 'duration', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="2 Years"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Description</label>
              <textarea
                rows={3}
                value={formData.experience.description || ''}
                onChange={(e) => handleChange('experience', 'description', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                placeholder="Developed responsive web applications..."
              />
            </div>
          </div>

          {/* Section 4: Skills */}
          <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400">4. Skills</h3>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Comma-separated skills</label>
              <input
                type="text"
                value={formData.skills || ''}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="Next.js, React, Node.js, Tailwind CSS, Supabase"
              />
            </div>
          </div>

          {/* Section 5: AI JOB DESCRIPTION ANALYZER */}
          <div className="bg-slate-900/60 rounded-2xl border border-indigo-500/30 p-6 shadow-inner space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-base">🤖</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                AI Job Description Analyzer
              </h3>
            </div>

            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste target Job Description here to calculate ATS match score..."
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all resize-none"
            />

            <button
              type="button"
              onClick={handleAnalyzeJD}
              disabled={analyzing}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing Match...
                </>
              ) : (
                '🔍 Analyze Job Match'
              )}
            </button>

            {/* ATS MATCH RESULTS DISPLAY */}
            {atsResult && (
              <div className="mt-4 p-4 bg-slate-950/90 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">ATS Match Score</span>
                  <span className="text-sm font-extrabold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-3 py-1 rounded-lg">
                    {atsResult.matchScore}%
                  </span>
                </div>

                {atsResult.missingKeywords && atsResult.missingKeywords.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-rose-400 mb-1.5">Missing Keywords:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {atsResult.missingKeywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-rose-950/40 text-rose-300 border border-rose-800/40 px-2 py-0.5 rounded-md"
                        >
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {atsResult.suggestions && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <p className="text-[11px] font-semibold text-indigo-300 mb-1">AI Recommendation:</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {atsResult.suggestions}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Professional Live Resume Preview */}
        <div className="preview-wrapper bg-slate-900/40 rounded-2xl border border-slate-800 p-8 flex flex-col justify-start items-center sticky top-20 max-h-[calc(100vh-100px)] overflow-y-auto">
          
          <div
            id="printable-resume"
            className="w-full max-w-[650px] bg-white text-slate-900 p-10 shadow-2xl min-h-[800px] flex flex-col justify-between font-sans rounded-none border border-slate-200"
          >
            <div>
              {/* Header based on Template */}
              {template === 'classic' ? (
                <div className="border-b-2 border-black pb-4 mb-6 text-center font-serif">
                  <h1 className="text-2xl font-bold tracking-wide uppercase text-black">
                    {formData.personal_info.fullName || 'Full Name'}
                  </h1>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-700 mt-1">
                    {formData.personal_info.jobTitle || 'Professional Title'}
                  </p>
                  <div className="flex justify-center gap-3 text-xs text-slate-600 mt-2">
                    <span>{formData.personal_info.email || 'email@example.com'}</span>
                    <span>•</span>
                    <span>{formData.personal_info.phone || 'Phone'}</span>
                  </div>
                </div>
              ) : template === 'minimalist' ? (
                <div className="border-b border-slate-400 pb-4 mb-6">
                  <h1 className="text-3xl font-light tracking-tight text-black">
                    {formData.personal_info.fullName || 'Full Name'}
                  </h1>
                  <div className="flex justify-between items-center mt-1 text-xs text-slate-600">
                    <span className="font-semibold uppercase tracking-wider">{formData.personal_info.jobTitle || 'Professional Title'}</span>
                    <span>{formData.personal_info.email || 'email@example.com'} • {formData.personal_info.phone || 'Phone'}</span>
                  </div>
                </div>
              ) : (
                <div className="border-b-2 border-indigo-600 pb-4 mb-6">
                  <h1 className="text-2xl font-extrabold text-slate-900">
                    {formData.personal_info.fullName || 'Full Name'}
                  </h1>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                      {formData.personal_info.jobTitle || 'Professional Title'}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      {formData.personal_info.email || 'email@example.com'} | {formData.personal_info.phone || 'Phone'}
                    </span>
                  </div>
                </div>
              )}

              {/* Summary */}
              {formData.personal_info.summary && (
                <div className="mb-5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-300 pb-1 mb-1.5">
                    Professional Summary
                  </h2>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {formData.personal_info.summary}
                  </p>
                </div>
              )}

              {/* Experience */}
              {(formData.experience.title || formData.experience.company) && (
                <div className="mb-5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-300 pb-1 mb-2">
                    Experience
                  </h2>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-xs font-bold text-black">
                      {formData.experience.title} {formData.experience.company && `at ${formData.experience.company}`}
                    </h3>
                    <span className="text-[11px] text-slate-600 font-semibold">{formData.experience.duration}</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">{formData.experience.description}</p>
                </div>
              )}

              {/* Education */}
              {(formData.education.degree || formData.education.institution) && (
                <div className="mb-5">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-300 pb-1 mb-2">
                    Education
                  </h2>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-bold text-black">
                      {formData.education.degree} {formData.education.institution && `— ${formData.education.institution}`}
                    </h3>
                    <span className="text-[11px] text-slate-600 font-semibold">{formData.education.year}</span>
                  </div>
                </div>
              )}

              {/* Skills */}
              {formData.skills && (
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-300 pb-1 mb-1.5">
                    Skills
                  </h2>
                  <p className="text-xs text-slate-800 leading-relaxed">{formData.skills}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500">
              CareerCraft Studio • ATS Optimized
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-300">Loading Builder...</p>
        </div>
      </div>
    }>
      <BuilderContent />
    </Suspense>
  );
}