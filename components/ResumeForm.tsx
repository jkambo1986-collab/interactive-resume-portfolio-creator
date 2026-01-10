
/**
 * @file ResumeForm.tsx
 * Form for user input.
 */

import React, { useState, memo, useCallback } from 'react';
import type { ResumeData, WorkExperience, Education, Activity, Reference } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UndoIcon } from './icons/UndoIcon';
import { RedoIcon } from './icons/RedoIcon';
import { Pagination } from './Pagination';
import { fetchJobDescriptionFromUrl } from '../services/geminiService';
import { AutoFixIcon } from './icons/AutoFixIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { EnvelopeIcon } from './icons/EnvelopeIcon';
import { GlobeIcon } from './icons/GlobeIcon';
import ResumeUploader from './ResumeUploader';
import FontSelector from './FontSelector';
import ThemeSelector from './ThemeSelector';
import ABTestModal from './ABTestModal';
import { ScaleIcon } from './icons/ScaleIcon';
import { useAppContext } from '../context/AppContext';
import { TargetIcon } from './icons/TargetIcon';
import FitAnalysisModal from './FitAnalysisModal';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import IntelligenceBriefingModal from './IntelligenceBriefingModal';
import LoadingSpinner from './LoadingSpinner';
import { StackIcon } from './icons/StackIcon';
import ActionHint from './ActionHint';

const Input = memo(({ label, name, value, onChange, placeholder }: any) => (
    <div>
        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 tracking-wider">{label}</label>
        <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full px-3 py-2 border rounded text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none transition-all" />
    </div>
));

const Textarea = memo(({ label, name, value, onChange, placeholder, rows = 3 }: any) => (
    <div>
        <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 tracking-wider">{label}</label>
        <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full px-3 py-2 border rounded text-sm text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none transition-all resize-none" />
    </div>
));

const ActivityItem = memo(({ item, index, section, onChange, onRemove }: any) => (
    <div className="p-3 border rounded mb-3 relative bg-white shadow-sm">
        <button type="button" onClick={() => onRemove(section, index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"><TrashIcon /></button>
        <div className="grid grid-cols-2 gap-2 mb-2">
            <Input label="Title/Role" name="title" value={item.title} onChange={(e: any) => onChange(section, index, 'title', e.target.value)} placeholder="e.g. Volunteer Lead" />
            <Input label="Org" name="organization" value={item.organization} onChange={(e: any) => onChange(section, index, 'organization', e.target.value)} placeholder="e.g. Habitat for Humanity" />
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
            <Input label="Start" name="startDate" value={item.startDate} onChange={(e: any) => onChange(section, index, 'startDate', e.target.value)} placeholder="e.g. 2021" />
            <Input label="End" name="endDate" value={item.endDate} onChange={(e: any) => onChange(section, index, 'endDate', e.target.value)} placeholder="e.g. 2022" />
        </div>
        <Textarea label="Description" name="description" value={item.description} onChange={(e: any) => onChange(section, index, 'description', e.target.value)} rows={2} placeholder="Briefly describe your impact..." />
    </div>
));

const EducationItem = memo(({ item, index, onChange, onRemove }: any) => (
    <div className="p-3 border rounded mb-3 relative bg-white shadow-sm">
        <button type="button" onClick={() => onRemove(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"><TrashIcon /></button>
        <div className="grid grid-cols-2 gap-2 mb-2">
            <Input label="Degree / Field" name="degree" value={item.degree} onChange={(e: any) => onChange('education', index, 'degree', e.target.value)} placeholder="e.g. B.S. in Computer Science" />
            <Input label="Institution" name="institution" value={item.institution} onChange={(e: any) => onChange('education', index, 'institution', e.target.value)} placeholder="e.g. Stanford University" />
        </div>
        <div className="grid grid-cols-2 gap-2">
            <Input label="Start Date" name="startDate" value={item.startDate} onChange={(e: any) => onChange('education', index, 'startDate', e.target.value)} placeholder="e.g. Sep 2018" />
            <Input label="End Date" name="endDate" value={item.endDate} onChange={(e: any) => onChange('education', index, 'endDate', e.target.value)} placeholder="e.g. May 2022" />
        </div>
    </div>
));

const ReferenceItem = memo(({ refItem, index, onChange, onRemove }: any) => (
    <div className="p-3 border rounded mb-3 relative bg-white shadow-sm">
        <button type="button" onClick={() => onRemove(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"><TrashIcon /></button>
        <div className="grid grid-cols-2 gap-2 mb-2">
            <Input label="Name" name="name" value={refItem.name} onChange={(e: any) => onChange(index, 'name', e.target.value)} placeholder="e.g. John Smith" />
            <Input label="Title" name="title" value={refItem.title} onChange={(e: any) => onChange(index, 'title', e.target.value)} placeholder="e.g. Manager" />
        </div>
        <div className="grid grid-cols-2 gap-2">
            <Input label="Company" name="company" value={refItem.company} onChange={(e: any) => onChange(index, 'company', e.target.value)} placeholder="e.g. Tech Inc" />
            <Input label="Contact Info" name="contactInfo" value={refItem.contactInfo} onChange={(e: any) => onChange(index, 'contactInfo', e.target.value)} placeholder="e.g. john@tech.com" />
        </div>
    </div>
));

const WorkExperienceItem = memo(({ job, index, onChange, onRemove, onEnhance, onABTest, isEnhancing }: any) => {
    const handleChange = (e: any) => onChange(index, e.target.name, e.target.value);
    const displayTitle = (job.title || job.company)
        ? `${job.title}${job.title && job.company ? ' at ' : ''}${job.company}`
        : `Role ${index + 1}`;

    return (
        <div className="p-4 border rounded mb-4 relative bg-white shadow-sm hover:shadow-md transition-shadow">
            <button type="button" onClick={() => onRemove(index)} className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors" title="Remove Experience"><TrashIcon /></button>
            <div className="mb-3">
                <h4 className="text-[10px] font-bold text-sky-600 uppercase tracking-widest">{displayTitle}</h4>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                <Input label="Title" name="title" value={job.title} onChange={handleChange} placeholder="e.g. Senior Software Engineer" />
                <Input label="Company" name="company" value={job.company} onChange={handleChange} placeholder="e.g. Acme Corp" />
                <Input label="Start" name="startDate" value={job.startDate} onChange={handleChange} placeholder="e.g. Jan 2020" />
                <Input label="End" name="endDate" value={job.endDate} onChange={handleChange} placeholder="e.g. Present" />
            </div>
            <Textarea label="Responsibilities & Achievements" name="responsibilities" value={job.responsibilities} onChange={handleChange} rows={6} placeholder="Describe your impact..." />
            <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => onABTest(index)} className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-bold border transition-colors flex items-center gap-1"><ScaleIcon /> A/B Test</button>
                <button type="button" onClick={() => onEnhance(index)} disabled={isEnhancing} className="text-[10px] bg-violet-600 text-white hover:bg-violet-700 px-2 py-1 rounded font-bold transition-colors flex items-center gap-1">{isEnhancing ? <LoadingSpinner className="h-3 w-3 text-white" /> : 'AI Enhance'}</button>
            </div>
        </div>
    );
});

const ResumeForm: React.FC = () => {
    const {
        resumeData, setResumeData, handleGenerateResumes, handleUploadResume,
        undo, redo, canUndo, canRedo, currentStep, nextStep, prevStep, goToStep, setError, handleRunMetricMiner, handleEnhanceResponsibilities, setIsVersionModalOpen,
        handlePrepareInterview, isAnalyzingFit, handleAnalyzeResumeFit, fitAnalysisResult, isGeneratingBriefing, intelligenceBriefing, handleGenerateBriefing, handleGenerateOutreachKit, handleGeneratePortfolio
    } = useAppContext();

    const [isEnhancingMap, setIsEnhancingMap] = useState<any>({});
    const [abModal, setAbModal] = useState<any>(null);
    const [isFitModal, setIsFitModal] = useState(false);
    const [isBriefModal, setIsBriefModal] = useState(false);
    const [jobUrl, setJobUrl] = useState('');
    const [isFetchingJob, setIsFetchingJob] = useState(false);

    const handlePersonalInfoChange = (e: any) => {
        const { name, value } = e.target;
        setResumeData((prev: any) => ({ ...prev, personalInfo: { ...prev.personalInfo, [name]: value } }));
    };

    const handleGenericChange = (e: any) => setResumeData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));

    const handleWorkHistoryChange = (index: number, field: string, value: any) => {
        setResumeData((prev: any) => {
            const wh = [...prev.workHistory]; wh[index] = { ...wh[index], [field]: value };
            return { ...prev, workHistory: wh };
        });
    };

    const handleListChange = (section: string, index: number, field: string, value: any) => {
        setResumeData((prev: any) => {
            const list = [...(prev as any)[section]];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, [section]: list };
        });
    };

    const handleRemoveListItem = (section: string, index: number) => {
        setResumeData((prev: any) => ({ ...prev, [section]: (prev as any)[section].filter((_: any, i: number) => i !== index) }));
    };

    const handleAddItem = (section: string, template: any) => {
        setResumeData((prev: any) => ({ ...prev, [section]: [...(prev as any)[section], { ...template, id: crypto.randomUUID() }] }));
    };

    const handleFetchJD = async () => {
        if (!jobUrl) return;
        setIsFetchingJob(true);
        try {
            const d = await fetchJobDescriptionFromUrl(jobUrl);
            setResumeData((p: any) => ({ ...p, jobDescription: d }));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsFetchingJob(false);
        }
    };

    const handleABTestWorkExperience = (idx: number) => {
        const job = resumeData.workHistory[idx];
        const fieldName = (job.title || job.company)
            ? `${job.title}${job.title && job.company ? ' at ' : ''}${job.company}`
            : `Experience ${idx + 1}`;

        setAbModal({
            field: fieldName,
            text: job.responsibilities,
            onUp: (t: any) => handleWorkHistoryChange(idx, 'responsibilities', t)
        });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between border-b pb-2 mb-4">
                <h2 className="font-bold text-slate-800">Resume Builder</h2>
                <div className="flex gap-1">
                    <button type="button" onClick={undo} disabled={!canUndo} className="p-1 disabled:opacity-30 hover:text-sky-600 transition-colors" title="Undo"><UndoIcon /></button>
                    <button type="button" onClick={redo} disabled={!canRedo} className="p-1 disabled:opacity-30 hover:text-sky-600 transition-colors" title="Redo"><RedoIcon /></button>
                    <button type="button" onClick={() => setIsVersionModalOpen(true)} className="p-1 hover:text-sky-600 transition-colors" title="Saved Versions"><StackIcon /></button>
                </div>
            </div>

            <Pagination currentStep={currentStep} steps={['Target', 'Identity', 'About', 'History', 'Skills', 'Final']} onStepClick={goToStep} />

            <div className="flex-grow mt-6 overflow-y-auto max-h-[calc(100vh-380px)] px-1">
                {currentStep === 1 && (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="relative">
                            <ResumeUploader onUpload={handleUploadResume} />
                            {!resumeData.personalInfo.name && <ActionHint message="Upload your resume to start" className="absolute -top-3 left-4" />}
                        </div>
                        <div className="pt-4 border-t">
                            <h3 className="text-xs font-bold uppercase text-slate-500 mb-3">Job Description</h3>
                            <div className="flex gap-2 items-end mb-4">
                                <div className="flex-grow">
                                    <Input label="JD URL" value={jobUrl} onChange={(e: any) => setJobUrl(e.target.value)} placeholder="https://linkedin.com/jobs/view/..." />
                                </div>
                                <div className="relative">
                                    <button onClick={handleFetchJD} disabled={isFetchingJob} className={`bg-slate-800 text-white px-4 py-2 rounded text-xs font-bold uppercase h-[38px] transition-all hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed pulse-glow ${isFetchingJob ? 'animate-pulse' : ''}`}>
                                        {isFetchingJob ? <LoadingSpinner className="h-4 w-4 text-white" /> : 'Fetch AI'}
                                    </button>
                                    {jobUrl && !resumeData.jobDescription && !isFetchingJob && <ActionHint message="Analyze this job now" className="whitespace-nowrap" />}
                                </div>
                            </div>
                            <Textarea label="Target Job Description" name="jobDescription" value={resumeData.jobDescription} onChange={handleGenericChange} rows={18} placeholder="Paste requirements here..." />
                        </div>
                    </div>
                )}
                {currentStep === 2 && (
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Full Name" name="name" value={resumeData.personalInfo.name} onChange={handlePersonalInfoChange} placeholder="John Doe" />
                            <Input label="Email" name="email" value={resumeData.personalInfo.email} onChange={handlePersonalInfoChange} placeholder="john@example.com" />
                            <Input label="Phone" name="phone" value={resumeData.personalInfo.phone} onChange={handlePersonalInfoChange} placeholder="(555) 123-4567" />
                            <Input label="LinkedIn" name="linkedin" value={resumeData.personalInfo.linkedin} onChange={handlePersonalInfoChange} placeholder="linkedin.com/in/johndoe" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <FontSelector fonts={['Inter', 'Roboto', 'Merriweather', 'Lato']} selectedFont={resumeData.font} onSelectFont={(f: any) => setResumeData((p: any) => ({ ...p, font: f }))} />
                            <ThemeSelector themes={['Modern Blue', 'Classic Gray', 'Professional Teal']} selectedTheme={resumeData.colorTheme} onSelectTheme={(t: any) => setResumeData((p: any) => ({ ...p, colorTheme: t }))} />
                        </div>
                    </div>
                )}
                {currentStep === 3 && (
                    <div className="space-y-4 animate-fade-in-up">
                        <Textarea label="Profile Summary" name="summary" value={resumeData.summary} onChange={handleGenericChange} rows={12} placeholder="Summarize your professional identity and key achievements..." />
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setAbModal({
                                    field: 'Profile Summary',
                                    text: resumeData.summary,
                                    onUp: (newText: string) => setResumeData((prev: any) => ({ ...prev, summary: newText }))
                                })}
                                className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded font-bold border transition-colors flex items-center gap-1"
                            >
                                <ScaleIcon /> A/B Test Summary
                            </button>
                        </div>
                    </div>
                )}
                {currentStep === 4 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <section>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-xs font-bold uppercase text-slate-500">Work Experience</h3>
                                <button onClick={handleRunMetricMiner} className="text-[10px] bg-violet-100 text-violet-700 px-2 py-1 rounded font-bold hover:bg-violet-200 flex items-center gap-1">
                                    <AutoFixIcon /> Metric Miner
                                </button>
                            </div>
                            {resumeData.workHistory.map((j, i) => (
                                <WorkExperienceItem key={j.id} job={j} index={i} onChange={handleWorkHistoryChange} onRemove={(idx: any) => setResumeData((p: any) => ({ ...p, workHistory: p.workHistory.filter((_: any, k: any) => k !== idx) }))} onEnhance={(idx: any) => handleEnhanceResponsibilities(idx)} onABTest={() => handleABTestWorkExperience(i)} isEnhancing={isEnhancingMap[i]} />
                            ))}
                            <button onClick={() => handleAddItem('workHistory', { title: '', company: '', startDate: '', endDate: '', responsibilities: '' })} className="w-full py-2 border-2 border-dashed rounded text-slate-400 font-bold uppercase text-xs hover:border-slate-400 transition-colors">+ Add Work Experience</button>
                        </section>

                        <section className="pt-4 border-t">
                            <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Volunteering</h3>
                            {resumeData.volunteering.map((v, i) => <ActivityItem key={v.id} item={v} index={i} section="volunteering" onChange={handleListChange} onRemove={handleRemoveListItem} />)}
                            <button onClick={() => handleAddItem('volunteering', { title: '', organization: '', startDate: '', endDate: '', description: '' })} className="w-full py-2 border-2 border-dashed rounded text-slate-400 font-bold uppercase text-xs hover:border-slate-400 transition-colors">+ Add Volunteering</button>
                        </section>

                        <section className="pt-4 border-t">
                            <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Extracurricular Activities</h3>
                            {resumeData.extracurriculars.map((ex, i) => <ActivityItem key={ex.id} item={ex} index={i} section="extracurriculars" onChange={handleListChange} onRemove={handleRemoveListItem} />)}
                            <button onClick={() => handleAddItem('extracurriculars', { title: '', organization: '', startDate: '', endDate: '', description: '' })} className="w-full py-2 border-2 border-dashed rounded text-slate-400 font-bold uppercase text-xs hover:border-slate-400 transition-colors">+ Add Activity</button>
                        </section>
                    </div>
                )}
                {currentStep === 5 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <section>
                            <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Hard / Technical Skills</h3>
                            <Textarea
                                label="Technical Stack"
                                value={resumeData.hardSkills.join(', ')}
                                onChange={(e: any) => setResumeData((p: any) => ({ ...p, hardSkills: e.target.value.split(',').map((s: string) => s.trim()) }))}
                                rows={6}
                                placeholder="React, Python, AWS, Docker, Git..."
                            />
                        </section>
                        <section className="pt-4 border-t">
                            <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Soft / Interpersonal Skills</h3>
                            <Textarea
                                label="Behavioral Competencies"
                                value={resumeData.softSkills.join(', ')}
                                onChange={(e: any) => setResumeData((p: any) => ({ ...p, softSkills: e.target.value.split(',').map((s: string) => s.trim()) }))}
                                rows={6}
                                placeholder="Leadership, Mentoring, Strategic Thinking..."
                            />
                        </section>
                    </div>
                )}
                {currentStep === 6 && (
                    <div className="space-y-6 animate-fade-in-up">
                        <section>
                            <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">Education</h3>
                            {resumeData.education.map((e, i) => (
                                <EducationItem
                                    key={e.id}
                                    item={e}
                                    index={i}
                                    onChange={handleListChange}
                                    onRemove={(idx: number) => handleRemoveListItem('education', idx)}
                                />
                            ))}
                            <button onClick={() => handleAddItem('education', { institution: '', degree: '', startDate: '', endDate: '' })} className="w-full py-1.5 border border-dashed rounded text-slate-400 text-[10px] font-bold uppercase hover:border-slate-400 transition-colors">+ Add Education</button>
                        </section>

                        <section className="pt-4 border-t">
                            <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">References</h3>
                            {resumeData.references.map((r, i) => (
                                <ReferenceItem
                                    key={r.id}
                                    refItem={r}
                                    index={i}
                                    onChange={(idx: number, f: string, v: any) => handleListChange('references', idx, f, v)}
                                    onRemove={(idx: number) => handleRemoveListItem('references', idx)}
                                />
                            ))}
                            <button onClick={() => handleAddItem('references', { name: '', title: '', company: '', contactInfo: '' })} className="w-full py-1.5 border border-dashed rounded text-slate-400 text-[10px] font-bold uppercase hover:border-slate-400 transition-colors">+ Add Reference</button>
                        </section>
                    </div>
                )}
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t bg-white">
                <button onClick={prevStep} disabled={currentStep === 1} className="text-xs font-bold px-4 py-2 border rounded-md disabled:opacity-30 hover:bg-slate-50">Prev</button>
                <div className="flex gap-2">
                    {currentStep === 6 ? (
                        <div className="flex gap-2 flex-wrap justify-end">
                            <button onClick={() => { setIsFitModal(true); handleAnalyzeResumeFit(); }} className="p-2 bg-slate-100 rounded-md border hover:bg-slate-200" title="Job Fit Analysis"><TargetIcon className="h-5 w-5 text-slate-600" /></button>
                            <button onClick={() => { setIsBriefModal(true); handleGenerateBriefing(); }} className="p-2 bg-slate-100 rounded-md border hover:bg-slate-200" title="Intelligence Briefing"><BriefcaseIcon className="h-5 w-5 text-slate-600" /></button>
                            <button onClick={handleGenerateOutreachKit} className="p-2 bg-teal-50 rounded-md border border-teal-100 hover:bg-teal-100" title="Generate Cover Letter"><EnvelopeIcon className="h-5 w-5 text-teal-600" /></button>
                            <button onClick={handleGeneratePortfolio} className="p-2 bg-violet-50 rounded-md border border-violet-100 hover:bg-violet-100" title="Generate Portfolio Site"><GlobeIcon className="h-5 w-5 text-violet-600" /></button>
                            <button onClick={handlePrepareInterview} className="p-2 bg-rose-50 rounded-md border border-rose-100 hover:bg-rose-100" title="Mock Interview"><MicrophoneIcon className="h-5 w-5 text-rose-600" /></button>
                            <div className="relative">
                                <button onClick={handleGenerateResumes} className="bg-sky-600 text-white px-6 py-2 rounded-md text-sm font-bold uppercase hover:bg-sky-700 shadow-md transition-all active:scale-95 pulse-glow">Generate</button>
                                <ActionHint message="Ready to create your options?" className="whitespace-nowrap" />
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <button onClick={nextStep} className="bg-sky-600 text-white px-6 py-2 rounded-md text-sm font-bold uppercase hover:bg-sky-700 shadow-md transition-all active:scale-95 pulse-glow">Next</button>
                            {currentStep < 6 && <ActionHint message="Continue to next step" className="whitespace-nowrap" />}
                        </div>
                    )}
                </div>
            </div>

            {abModal && <ABTestModal isOpen={!!abModal} onClose={() => setAbModal(null)} onUpdate={abModal.onUp} originalText={abModal.text} fieldName={abModal.field} jobDescription={resumeData.jobDescription} />}
            {isFitModal && <FitAnalysisModal isOpen={isFitModal} onClose={() => setIsFitModal(false)} isLoading={isAnalyzingFit} result={fitAnalysisResult} />}
            {isBriefModal && <IntelligenceBriefingModal isOpen={isBriefModal} onClose={() => setIsBriefModal(false)} isLoading={isGeneratingBriefing} briefing={intelligenceBriefing} />}
        </div >
    );
};

export default ResumeForm;
