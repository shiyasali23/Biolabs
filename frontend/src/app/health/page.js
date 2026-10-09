"use client";
import { headingCase } from "@/lib/heading-case";

import PageToolbar from "@/components/PageToolbar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, RotateCcw } from "lucide-react";
import CustomSlider from "@/components/ui/CustomSlider";
import { useHealth } from "@/contexts/healthContext";
import { useUser } from "@/contexts/userContext";

export default function HealthPage() {
  const { userData } = useUser();
  const questions = useHealth();
  const [inputData, setInputData] = useState({});
  const [index, setIndex] = useState(0);
  const [isFollowup, setIsFollowup] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!userData?.age) return;
    setInputData((current) => current.age ? current : { ...current, age: { userInput: userData.age } });
  }, [userData?.age]);

  const currentQuestion = questions[index];
  const displayQuestion = isFollowup ? currentQuestion?.followup : currentQuestion;
  const questionKey = isFollowup ? `${index}_followup` : `${index}`;

  useEffect(() => {
    setCurrentAnswer(inputData[questionKey]?.userInput ?? null);
  }, [inputData, questionKey]);

  const advance = (includeFollowup = true) => {
    if (!isFollowup && includeFollowup && currentQuestion?.followup) {
      setIsFollowup(true);
      return;
    }
    if (index < questions.length - 1) {
      setIndex((current) => current + 1);
      setIsFollowup(false);
    } else {
      setComplete(true);
    }
  };

  const saveAndContinue = () => {
    if (currentAnswer === null || currentAnswer === "") return;
    setInputData((current) => ({
      ...current,
      [questionKey]: { userInput: currentAnswer, question: displayQuestion.question },
    }));
    advance(true);
  };

  const skip = () => {
    setInputData((current) => {
      const next = { ...current };
      delete next[questionKey];
      return next;
    });
    advance(false);
  };

  const previous = () => {
    if (isFollowup) setIsFollowup(false);
    else if (index > 0) {
      const previousIndex = index - 1;
      setIndex(previousIndex);
      setIsFollowup(Boolean(questions[previousIndex]?.followup));
    }
  };

  const editAnswer = (key) => {
    setComplete(false);
    setIndex(Number.parseInt(key.split("_")[0], 10));
    setIsFollowup(key.includes("_followup"));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reset = () => {
    setInputData(userData?.age ? { age: { userInput: userData.age } } : {});
    setIndex(0);
    setIsFollowup(false);
    setCurrentAnswer(null);
    setComplete(false);
  };

  const answers = Object.entries(inputData)
    .filter(([key]) => key !== "age")
    .sort(([left], [right]) => Number.parseInt(left, 10) - Number.parseInt(right, 10));
  const isLastStep = index === questions.length - 1 && (isFollowup || !currentQuestion?.followup);

  return (
    <main className="bio-page pb-24">
      <div className="bio-container !max-w-[900px]"><PageToolbar title="Health Check-In" description="A self-reported check-in. Responses stay in this session and are not saved to your clinical record."/>
        {!complete ? (
          <div className="grid gap-6">
            <section className="bio-card overflow-hidden" aria-labelledby="check-in-question">
              <div className="border-b bg-[var(--biolabs-mist)] px-5 py-4 sm:px-8">
                <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[var(--biolabs-slate)]"><span>Question {index + 1} of {questions.length}{isFollowup ? " · Follow-up" : ""}</span><span>{answers.length} answered</span></div>
                
              </div>
              <div className="p-5 sm:p-8 lg:p-10">
                <p className="bio-eyebrow !mb-3">Select One Response</p>
                <h2 id="check-in-question" className="max-w-2xl text-2xl font-medium tracking-tight sm:text-3xl">{headingCase(displayQuestion?.question)}</h2>
                <div className="mt-9"><CustomSlider input={displayQuestion?.input} selectedValue={currentAnswer} setSelectedValue={setCurrentAnswer} /></div>
                <div className="mt-10 flex flex-col-reverse justify-between gap-3 border-t pt-6 sm:flex-row">
                  <button type="button" className="bio-button-secondary" disabled={index === 0 && !isFollowup} onClick={previous}><ArrowLeft aria-hidden="true" size={16} />Previous</button>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {displayQuestion?.skippable && <button type="button" className="bio-button-secondary" onClick={skip}>Skip</button>}
                    <button type="button" className="bio-button-primary" disabled={currentAnswer === null || currentAnswer === ""} onClick={saveAndContinue}>{isLastStep ? <><Check aria-hidden="true" size={16} />Complete check-in</> : <>Continue<ArrowRight aria-hidden="true" size={16} /></>}</button>
                  </div>
                </div>
              </div>
            </section>

            <details className="bio-panel p-5"><summary className="cursor-pointer text-sm font-medium">Review your responses ({answers.length})</summary><div className="mt-4" aria-labelledby="answered-heading">
              <div className="flex items-center justify-between gap-3"><h2 id="answered-heading" className="text-sm font-semibold">Your Responses</h2><span className="text-xs font-semibold text-[var(--biolabs-slate)]">{answers.length} answered</span></div>
              {answers.length ? <ol className="mt-4 space-y-2">{answers.map(([key, data]) => <li key={key}><button type="button" className="w-full rounded-md border bg-white p-3 text-left transition hover:border-[var(--biolabs-teal)]" onClick={() => editAnswer(key)}><span className="line-clamp-1 text-[11px] font-semibold text-[var(--biolabs-slate)]">{data.question}</span><span className="mt-1 block text-sm font-semibold text-[var(--biolabs-ink)]">{data.userInput}</span></button></li>)}</ol> : <p className="mt-4 text-xs leading-5 text-[var(--biolabs-slate)]">Responses appear here as you progress. Select any response later to edit it.</p>}
            </div></details>
          </div>
        ) : (
          <section className="bio-card mx-auto max-w-3xl p-6 text-center sm:p-10 lg:p-14" aria-labelledby="assessment-complete-heading">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[var(--biolabs-success-bg)] text-[var(--biolabs-success)]"><ClipboardCheck aria-hidden="true" size={25} /></span>
            <p className="bio-eyebrow !mb-3 mt-7">Check-In Complete</p>
            <h2 id="assessment-complete-heading" className="bio-title">Your Responses Are Ready To Review.</h2>
            <p className="bio-body mx-auto mt-4 max-w-xl">You completed {answers.length} responses. Use this summary to notice patterns or prepare for a conversation with a qualified healthcare professional.</p>
            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">{answers.map(([key, data]) => <button key={key} type="button" className="rounded-lg border bg-[var(--biolabs-mist)] p-4 transition hover:border-[var(--biolabs-teal)]" onClick={() => editAnswer(key)}><span className="block text-xs font-semibold text-[var(--biolabs-slate)]">{data.question}</span><span className="mt-1 block text-sm font-semibold">{data.userInput}</span></button>)}</div>
            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link href="/workspace/analytics" className="bio-button-primary">Review health analytics<ArrowRight aria-hidden="true" size={16} /></Link><button type="button" className="bio-button-secondary" onClick={reset}><RotateCcw aria-hidden="true" size={16} />Start again</button></div>
          </section>
        )}
      </div>
    </main>
  );
}
