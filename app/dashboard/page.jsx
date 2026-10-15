// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { supabase } from '@/lib/supabaseClient';

// export default function DashboardPage() {
//   const [user, setUser] = useState(null);
//   const [resumes, setResumes] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchUserAndResumes = async () => {
//       const { data: { session } } = await supabase.auth.getSession();

//       if (!session) {
//         router.push('/auth');
//         return;
//       }

//       setUser(session.user);

//       const { data } = await supabase
//         .from('resumes')
//         .select('*')
//         .eq('user_id', session.user.id)
//         .order('id', { ascending: false });

//       if (data) {
//         setResumes(data);
//       }
//       setLoading(false);
//     };

//     fetchUserAndResumes();
//   }, [router]);

//   const handleCreateNew = () => {
//     router.push('/builder');
//   };

//   const handleDelete = async (id) => {
//     if (!confirm('Are you sure you want to delete this resume?')) return;

//     const { error } = await supabase
//       .from('resumes')
//       .delete()
//       .eq('id', id);

//     if (error) {
//       alert('Error deleting resume: ' + error.message);
//     } else {
//       setResumes(resumes.filter((r) => r.id !== id));
//     }
//   };

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     router.push('/auth');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
//         <div className="flex items-center gap-3">
//           <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
//           <p className="text-sm font-medium text-slate-300">Loading Workspace...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
//       {/* Top Header */}
//       <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 sm:px-8 py-3.5 flex justify-between items-center sticky top-0 z-50">
//         <div className="flex items-center gap-3">
//           <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center font-extrabold text-white shadow-lg shadow-indigo-500/30">
//             C
//           </div>
//           <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
//             CareerCraft <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">AI Studio</span>
//           </h1>
//         </div>

//         <div className="flex items-center gap-4">
//           <div className="hidden sm:flex flex-col text-right max-w-[200px]">
//             <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Logged in as</span>
//             <span className="text-xs font-medium text-slate-300 truncate" title={user?.email}>
//               {user?.email}
//             </span>
//           </div>
//           <button
//             onClick={handleLogout}
//             className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-lg text-xs font-medium transition-all"
//           >
//             Sign Out
//           </button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl w-full mx-auto px-6 py-10 flex-1">
//         {/* Banner Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-slate-800/80">
//           <div>
//             <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
//               Resume Workspace
//             </h2>
//             <p className="text-xs sm:text-sm text-slate-400">
//               Manage, optimize, and customize your ATS-ready resumes with Gemini AI.
//             </p>
//           </div>
//           <button
//             onClick={handleCreateNew}
//             className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
//           >
//             <span className="text-base font-normal">+</span> Create New Resume
//           </button>
//         </div>

//         {/* Resumes Grid */}
//         {resumes.length === 0 ? (
//           <div className="bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-12 text-center max-w-lg mx-auto my-12">
//             <div className="w-12 h-12 bg-slate-800/80 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4 text-xl">
//               📄
//             </div>
//             <h3 className="text-base font-bold text-slate-200 mb-1">No resumes created yet</h3>
//             <p className="text-xs text-slate-400 mb-6">Build your first AI-enhanced resume in less than 2 minutes.</p>
//             <button
//               onClick={handleCreateNew}
//               className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all"
//             >
//               Start Building
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {resumes.map((resume, idx) => (
//               <div
//                 key={resume.id}
//                 className="group bg-slate-900/50 hover:bg-slate-900/90 rounded-2xl border border-slate-800/90 hover:border-indigo-500/40 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5"
//               >
//                 <div>
//                   <div className="flex justify-between items-center gap-2 mb-4">
//                     <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-1 rounded-md max-w-[180px] truncate">
//                       {resume.personal_info?.jobTitle || 'General Title'}
//                     </span>
//                     <span className="text-[10px] font-semibold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
//                       #{resumes.length - idx}
//                     </span>
//                   </div>

//                   <h3 className="font-bold text-slate-100 text-base mb-2 group-hover:text-indigo-300 transition-colors truncate">
//                     {resume.title || 'Untitled Resume'}
//                   </h3>

//                   <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-6 min-h-[32px]">
//                     {resume.personal_info?.summary || 'No summary added. Click edit to customize.'}
//                   </p>
//                 </div>

//                 <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
//                   <button
//                     onClick={() => router.push(`/builder?id=${resume.id}`)}
//                     className="flex-1 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-600 rounded-xl text-xs font-semibold transition-all text-center"
//                   >
//                     Edit Resume
//                   </button>
//                   <button
//                     onClick={() => handleDelete(resume.id)}
//                     className="px-3 py-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-slate-800 hover:border-rose-500/20 transition-all text-xs font-medium"
//                     title="Delete Resume"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }





'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndResumes = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/auth');
        return;
      }

      setUser(session.user);

      const { data } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', session.user.id)
        .order('id', { ascending: false });

      if (data) {
        setResumes(data);
      }
      setLoading(false);
    };

    fetchUserAndResumes();
  }, [router]);

  const handleCreateNew = () => {
    router.push('/builder');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting resume: ' + error.message);
    } else {
      setResumes(resumes.filter((r) => r.id !== id));
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-300">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  // Get first letter of email for avatar badge
  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 sm:px-8 py-3.5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center font-extrabold text-white shadow-lg shadow-indigo-500/30">
            C
          </div>
          <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
            CareerCraft <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">AI Studio</span>
          </h1>
        </div>

        {/* User Badge & Sign Out Button */}
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs flex items-center justify-center cursor-default"
            title={user?.email}
          >
            {userInitial}
          </div>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-lg text-xs font-medium transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto px-6 py-10 flex-1">
        {/* Banner Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-slate-800/80">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
              Resume Workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage, optimize, and customize your ATS-ready resumes with Gemini AI.
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
          >
            <span className="text-base font-normal">+</span> Create New Resume
          </button>
        </div>

        {/* Resumes Grid */}
        {resumes.length === 0 ? (
          <div className="bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 p-12 text-center max-w-lg mx-auto my-12">
            <div className="w-12 h-12 bg-slate-800/80 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4 text-xl">
              📄
            </div>
            <h3 className="text-base font-bold text-slate-200 mb-1">No resumes created yet</h3>
            <p className="text-xs text-slate-400 mb-6">Build your first AI-enhanced resume in less than 2 minutes.</p>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all"
            >
              Start Building
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume, idx) => (
              <div
                key={resume.id}
                className="group bg-slate-900/50 hover:bg-slate-900/90 rounded-2xl border border-slate-800/90 hover:border-indigo-500/40 p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5"
              >
                <div>
                  <div className="flex justify-between items-center gap-2 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2.5 py-1 rounded-md max-w-[180px] truncate">
                      {resume.personal_info?.jobTitle || 'General Title'}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      #{resumes.length - idx}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-base mb-2 group-hover:text-indigo-300 transition-colors truncate">
                    {resume.title || 'Untitled Resume'}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-6 min-h-[32px]">
                    {resume.personal_info?.summary || 'No summary added. Click edit to customize.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => router.push(`/builder?id=${resume.id}`)}
                    className="flex-1 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 hover:border-indigo-600 rounded-xl text-xs font-semibold transition-all text-center"
                  >
                    Edit Resume
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="px-3 py-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl border border-slate-800 hover:border-rose-500/20 transition-all text-xs font-medium"
                    title="Delete Resume"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}