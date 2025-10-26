"use client";

import { useState, useEffect } from "react";

type Option = { label: string; text: string };
type Question = { number: string; question: string; options: Option[] };

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("quizAnswers");
    if (saved) setAnswers(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("quizAnswers", JSON.stringify(answers));
  }, [answers]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "https://personal-pdf-converter.onrender.com/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.questions) setQuestions(data.questions);
      else alert("Failed to parse PDF");
      setSubmitted(false);
    } catch (err) {
      console.error(err);
      alert("Error uploading PDF");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qNumber: string, optionLabel: string) => {
    setAnswers((prev) => ({ ...prev, [qNumber]: optionLabel }));
  };

  const handleSubmit = () => setSubmitted(true);

  return (
    <div className="min-h-screen bg-white p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        PDF → Quiz
      </h1>
      <h2 className="text-center text-gray-800">© E10</h2>

      <div className="mb-6 flex justify-center">
        <div className="flex justify-center mb-6">
          <label className="cursor-pointer bg-yellow-500 text-white px-6 py-3 rounded shadow-md hover:bg-yellow-600 transition-colors font-semibold">
            Select PDF
            <input
              type="file"
              accept=".pdf"
              onChange={handleUpload}
              className="hidden" // hide the default input
            />
          </label>
        </div>
      </div>

      {loading && <p className="text-center text-gray-700">Parsing PDF...</p>}

      {questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((q) => (
            <div
              key={q.number}
              className="p-6 border rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 bg-white"
            >
              <p className="text-lg font-semibold mb-3 text-gray-800">
                {q.number}. {q.question}
              </p>
              <ul className="ml-5 list-decimal space-y-2">
                {q.options.map((opt) => (
                  <li
                    key={opt.label}
                    className={`p-2 rounded cursor-pointer transition-colors duration-150 ${
                      answers[q.number] === opt.label
                        ? "bg-yellow-100 text-yellow-900 font-semibold"
                        : "hover:bg-yellow-50 text-gray-800"
                    }`}
                    onClick={() => handleSelect(q.number, opt.label)}
                  >
                    <span className="font-medium">{opt.label})</span> {opt.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors font-semibold shadow-md"
            >
              Submit
            </button>
          </div>

          {submitted && (
            <div className="mt-8 p-4 border rounded bg-yellow-50">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">
                Your Answers:
              </h2>
              <ul className="list-disc ml-5 space-y-1 text-gray-800">
                {questions.map((q) => (
                  <li key={q.number}>
                    {answers[q.number]
                      ? answers[q.number]
                      : "No answer selected"}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
