"use client";
import { useEffect, useState } from "react";
import { useUser } from "@/contexts/userContext";
import { useHealth } from "@/contexts/healthContext";
import CustomButton from "@/components/CustomButton";
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
    if (typeof questionInput === "number") {
      const maxValue = questionInput + 3;
      const minValue = Math.max(1, questionInput - 3);
      return (answer - minValue) / (maxValue - minValue);
    }
    return 0.5;
  };

  const getQualityColor = (quality) =>
    quality <= 0.33
      ? "bg-red-100 border-red-300 text-red-800"
      : quality <= 0.66
      ? "bg-yellow-100 border-yellow-300 text-yellow-800"
      : "bg-green-100 border-green-300 text-green-800";

  const transition = (direction, callback) => {
    setIsTransitioning(true);
    setTimeout(() => {
      callback();
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const next = () =>
    transition("next", () => {
      if (isFollowup) {
        setIsFollowup(false);
        setIndex((i) => (i + 1 < questions.length ? i + 1 : i));
      } else if (current?.followup && inputData[questionKey]) {
        setIsFollowup(true);
      } else {
        setIndex((i) => (i + 1 < questions.length ? i + 1 : i));
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
      setTimeout(next, 400);
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
    <div className="w-screen min-h-[92vh] xl:min-h-[88vh] flex flex-col items-center gap-5">
      <div className="w-[90%] xl:w-[60%] h-[60vh] xl:h-[50vh] m-auto shadow-lg px-2 py-5 pr-5 flex flex-col items-center justify-center mt-20 overflow-hidden ">
        <div className="w-full h-full flex items-center justify-center">
          {loading ? (
            <LoadingComponent />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <div
                className={`w-full h-full flex gap-10 flex-col items-center justify-center transition-all duration-300 ease-in-out ${
                  isTransitioning
                    ? "transform translate-x-full opacity-0"
                    : "transform translate-x-0 opacity-100"
                }`}
              >
                <h1 className="font-bold text-2xl w-full text-center mb-8">
                  {displayQ?.question}
                </h1>
                <CustomSlider
                  key={`${index}-${isFollowup}`}
                  input={displayQ?.input}
                  selectedValue={currentAnswer}
                  setSelectedValue={setCurrentAnswer}
                  onInteractionEnd={handleInteractionEnd}
                />
              </div>
            </div>
          )}
        </div>

        {!loading && (
          <div className="w-full flex items-center justify-center gap-4 min-h-[48px] mt-4">
            {(index > 0 || isFollowup) && (
              <Button
                className="rounded-lg  xl:w-1/6 w-1/4 xl:h-full tracking-wider hover:scale-105 transition-transform duration-200"
                onClick={prev}
                disabled={isTransitioning}
              >
                Back
              </Button>
            )}
            {displayQ?.skippable && (
              <Button
                className="rounded-lg  xl:w-1/6 w-1/4 xl:h-full tracking-wider hover:scale-105 transition-transform duration-200"
                onClick={next}
                disabled={isTransitioning}
              >
                Skip
              </Button>
            )}
          </div>
        )}

        {shouldShowStart && !loading && (
          <Button
            className="rounded-lg  h-1/6 w-1/4 m-5 text-base font-semibold tracking-wider hover:scale-105 transition-transform duration-200"
            onClick={() => {
              setLoading(true);
              console.log("Start clicked", inputData);
            }}
            disabled={isTransitioning}
          >
            Start
          </Button>
        )}
      </div>

      {Object.keys(inputData).length > 0 && (
        <div className=" xl:w-[60%] rounded-lg p-4">
          <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-2 items-center justify-between">
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
                  ? originalQuestion.followup.input
                  : originalQuestion.input;
                const quality = getAnswerQuality(data.userInput, questionInput);
                const colorClass = getQualityColor(quality);

                return (
                  <div
                    key={key}
                    className={`flex w-full items-center justify-between py-3 px-2 rounded-lg h-[60px] cursor-pointer hover:shadow-md transition-all duration-200 ${colorClass}`}
                    onClick={() => handleEditQuestion(key)}
                  >
                    <div className="flex flex-col">
                      <p className="font-medium text-xs mb-1">
                        {data.question} {isFollowupAnswer && "(Follow-up)"}
                      </p>
                      <p className="text-sm font-semibold">{data.userInput}</p>
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
