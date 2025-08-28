import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function QuizApp() {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Fetch random questions from Open Trivia DB API
  useEffect(() => {
    fetch("https://opentdb.com/api.php?amount=10&type=multiple")
      .then((res) => res.json())
      .then((data) => {
        const formattedQuestions = data.results.map((q) => {
          const options = [...q.incorrect_answers];
          const randomIndex = Math.floor(Math.random() * (options.length + 1));
          options.splice(randomIndex, 0, q.correct_answer);
          return {
            question: q.question,
            options,
            answer: q.correct_answer,
          };
        });
        setQuestions(formattedQuestions);
      });
  }, []);

  const handleAnswer = (option) => {
    setSelected(option);
    if (option === questions[currentQ].answer) {
      setFeedback("✅ Correct!");
      setScore((prev) => prev + 1);
    } else {
      setFeedback(`❌ Incorrect! Correct Answer: ${questions[currentQ].answer}`);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 < questions.length) {
      setSelected(null);
      setFeedback("");
      setCurrentQ((prev) => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQ(0);
    setSelected(null);
    setFeedback("");
    setScore(0);
    setShowResults(false);
    // Refetch questions for a new game
    fetch("https://opentdb.com/api.php?amount=10&type=multiple")
      .then((res) => res.json())
      .then((data) => {
        const formattedQuestions = data.results.map((q) => {
          const options = [...q.incorrect_answers];
          const randomIndex = Math.floor(Math.random() * (options.length + 1));
          options.splice(randomIndex, 0, q.correct_answer);
          return {
            question: q.question,
            options,
            answer: q.correct_answer,
          };
        });
        setQuestions(formattedQuestions);
      });
  };

  if (questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600">
        <p className="text-white text-xl font-semibold">Loading Questions...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
      <Card className="w-full max-w-xl shadow-2xl rounded-2xl">
        <CardContent className="p-6 text-center">
          {!showResults ? (
            <>
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold mb-2 text-gray-800"
              >
                {questions[currentQ].question}
              </motion.h1>

              <p className="text-md font-medium text-gray-600 mb-6">
                Score: {score} | Question {currentQ + 1} of {questions.length}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {questions[currentQ].options.map((option, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => handleAnswer(option)}
                      className={`w-full py-3 rounded-2xl text-lg font-semibold shadow-md transition-all duration-300 ${
                        selected === option
                          ? option === questions[currentQ].answer
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                          : "bg-white text-gray-800 hover:bg-indigo-100"
                      }`}
                    >
                      {option}
                    </Button>
                  </motion.div>
                ))}
              </div>

              {feedback && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-medium mb-4"
                >
                  {feedback}
                </motion.p>
              )}

              {selected && (
                <Button
                  onClick={nextQuestion}
                  className="mt-2 px-6 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md"
                >
                  {currentQ + 1 < questions.length ? "Next Question" : "Finish Quiz"}
                </Button>
              )}
            </>
          ) : (
            <>
              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold mb-4 text-gray-800"
              >
                🎉 Quiz Completed!
              </motion.h2>
              <p className="text-xl font-medium mb-6 text-gray-700">
                Your Final Score: {score}
              </p>
              <Button
                onClick={restartQuiz}
                className="px-6 py-3 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md"
              >
                Restart Quiz
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
