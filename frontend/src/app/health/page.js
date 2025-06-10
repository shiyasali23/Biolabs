"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/userContext";
import { useHealth } from "@/contexts/healthContext";
import CustomSlider from "@/components/ui/CustomSlider";
import LoadingComponent from "@/components/LoadingComponent";
import { Button } from "@/components/ui/button";

const Health = () => {
  const { userData } = useUser();
  const questions = useHealth();
  const [inputData, setInputData] = useState({});
  const [index, setIndex] = useState(0);
  const [isFollowup, setIsFollowup] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (userData?.age && !inputData.age) {
      setInputData((prev) => ({ ...prev, age: { userInput: userData.age } }));
    }
  }, [userData?.age]);

  useEffect(() => {
    const questionKey = isFollowup ? `${index}_followup` : index;
    const existingAnswer = inputData[questionKey]?.userInput;
    setCurrentAnswer(existingAnswer ?? null);
  }, [index, isFollowup, inputData]);

  const current = questions[index];
  const displayQ = isFollowup ? current?.followup : current;
  const questionKey = isFollowup ? `${index}_followup` : index;
  const answeredCount = Object.keys(inputData).filter(
    (k) => !k.includes("_followup")
  ).length;

  const getAnswerQuality = (answer, questionInput) => {
    if (Array.isArray(questionInput)) {
      return questionInput.indexOf(answer) / (questionInput.length - 1);
    }
    return 0.5;
  };

  const getQualityColor = (quality) =>
    quality <= 0.33
      ? "bg-red-500/5 border-red-500/20 text-red-300"
      : quality <= 0.66
      ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-300"
      : "bg-green-500/5 border-green-500/20 text-green-300";

  const transition = (direction, callback) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => setIsTransitioning(false), 100);
    }, 300);
  };

  const next = () =>
    transition("next", () => {
      if (isFollowup) {
        setIsFollowup(false);
        const nextIndex = index + 1;
        if (nextIndex < questions.length) {
          setIndex(nextIndex);
        } else {
          // All questions finished, set loading to true
          setLoading(true);
        }
      } else if (current?.followup && inputData[questionKey]) {
        setIsFollowup(true);
      } else {
        const nextIndex = index + 1;
        if (nextIndex < questions.length) {
          setIndex(nextIndex);
        } else {
          // All questions finished, set loading to true
          setLoading(true);
        }
      }
    });

  const prev = () =>
    transition("prev", () => {
      isFollowup ? setIsFollowup(false) : setIndex((i) => (i > 0 ? i - 1 : 0));
    });

  const handleInteractionEnd = () => {
    if (currentAnswer !== null) {
      setInputData((prev) => ({
        ...prev,
        [questionKey]: {
          userInput: currentAnswer,
          question: displayQ.question,
        },
      }));
      setTimeout(next, 600);
    }
  };

  const handleEditQuestion = (key) => {
    const [questionIndex] = key.split("_").map(Number);
    const isFollowupEdit = key.includes("_followup");
    transition(questionIndex > index ? "next" : "prev", () => {
      setIndex(questionIndex);
      setIsFollowup(isFollowupEdit);
    });
  };

  const isLastQuestion = index === questions.length - 1 && !current?.followup;
  const shouldShowStart = answeredCount >= 4 || isLastQuestion;

  return (
    <div className="xl:min-h-[88vh] min-h-[90vh]  overflow-hidden flex flex-col items-center justify-center ">
      <div className=" backdrop-blur-2xl border border-black/5 rounded-xl px-3 xl:px-10 py-5 shadow-lg   mx-auto w-[90vw] xl:w-[60vw]  max-h-[60vh] flex flex-col  justify-between gap-10 relative">
        {loading ? (
          <LoadingComponent />
        ) : (
          <div
            className={`transition-all duration-500 ease-out flex flex-col gap-20   ${
              isTransitioning
                ? "transform translate-x-8 opacity-0"
                : "transform translate-x-0 opacity-100"
            }`}
          >
            <h1 className="text-3xl font-light text-gray-800 text-center  leading-relaxed">
              {displayQ?.question}
            </h1>

            <CustomSlider
              key={`${index}-${isFollowup}`}
              input={displayQ?.input}
              selectedValue={currentAnswer}
              setSelectedValue={setCurrentAnswer}
              onInteractionEnd={handleInteractionEnd}
            />

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-6">
              {(index > 0 || isFollowup) && (
                <Button
                  onClick={prev}
                  disabled={isTransitioning}
                  className=" px-6 py-3 bg-gray-900"
                >
                  Previous
                </Button>
              )}

              {displayQ?.skippable && (
                <Button
                  onClick={next}
                  disabled={isTransitioning}
                  className=" px-6 py-3 bg-gray-900 "
                >
                  Skip
                </Button>
              )}
            </div>

            {/* Start Button */}
            {shouldShowStart && (
              <Button
                className=" px-6 py-3 bg-gray-900 w-1/2 mx-auto"
                onClick={() => {
                  setLoading(true);
                  console.log("Start clicked", inputData);
                }}
                disabled={isTransitioning}
              >
                Get Assessment
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Answer Summary */}
      {Object.keys(inputData).length > 0 && (
        <div className="backdrop-blur-xl p-6 w-[90vw] xl:w-[70vw] mx-auto mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(inputData)
              .filter(([key]) => key !== "age")
              .sort(
                ([keyA], [keyB]) =>
                  parseInt(keyB.split("_")[0]) - parseInt(keyA.split("_")[0])
              )
              .map(([key, data]) => {
                const questionIndex = parseInt(key.split("_")[0]);
                const isFollowupAnswer = key.includes("_followup");
                const originalQuestion = questions[questionIndex];
                const questionInput = isFollowupAnswer
                  ? originalQuestion?.followup?.input
                  : originalQuestion?.input;
                const quality = getAnswerQuality(data.userInput, questionInput);
                const colorClass = getQualityColor(quality);

                return (
                  <div
                    key={key}
                    onClick={() => handleEditQuestion(key)}
                    className={`p-4 border rounded-xl cursor-pointer hover:scale-105 transition-all duration-300 backdrop-blur-sm ${colorClass}`}
                  >
                    <p className="text-gray-800 text-md font-semibold mb-2 line-clamp-2">
                      {data.question} {isFollowupAnswer && "(Follow-up)"}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          quality <= 0.33
                            ? "bg-red-400"
                            : quality <= 0.66
                            ? "bg-yellow-400"
                            : "bg-green-400"
                        }`}
                      />
                      <p className="text-gray-600 font-medium">
                        {data.userInput}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Health;