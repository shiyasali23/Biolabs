import React from "react";

const Nutrian = () => {
  const questions = {
    0: {
      topic: "nutrition",
      question: "What is your type?",
      answers: "vegan",
    },
    1: {
      topic: "nutrition",
      question: "What is your type?",
      answers: "not-vegan",
    },
  };
  return <div className="w-screen h-[92vh] xl:h-[88vh]"></div>;
};

export default React.memo(Nutrian);
