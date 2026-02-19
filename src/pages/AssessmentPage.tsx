import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { LevelBadge } from "@/components/ui/level-badge";
import { ASSESSMENT_QUESTIONS, calculateProskillLevel } from "@/lib/constants";
import { ArrowRight, ArrowLeft, CheckCircle2, Target, TrendingUp, Brain, Shield, Zap } from "lucide-react";

export default function AssessmentPage() {
  const navigate = useNavigate();
  const { user, completeAssessment } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [capital, setCapital] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [calculatedLevel, setCalculatedLevel] = useState(1);

  const totalQuestions = ASSESSMENT_QUESTIONS.length;
  const progress = ((currentQuestion + 1) / (totalQuestions + 1)) * 100;

  const handleAnswer = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    } else {
      navigate("/dashboard");
    }
  };

  const handleSubmit = () => {
    const level = calculateProskillLevel(answers);
    setCalculatedLevel(level);
    setShowResults(true);
    const capitalNum = parseFloat(capital) || 10000;
    completeAssessment(level, capitalNum);
  };

  const handleEnterDashboard = () => {
    navigate("/dashboard");
  };

  const currentQ = ASSESSMENT_QUESTIONS[currentQuestion];
  const isCapitalQuestion = currentQuestion === totalQuestions;
  const canProceed = isCapitalQuestion ? capital.length > 0 : answers[currentQ?.id];

  // Results screen
  if (showResults) {
    const unlockedFeatures = [
      { name: "The Lab (Backtesting)", level: 1, unlocked: true, icon: Brain },
      { name: "Basic Screener", level: 1, unlocked: true, icon: Target },
      { name: "Trade Journal", level: 2, unlocked: calculatedLevel >= 2, icon: TrendingUp },
      { name: "Scanner Filters", level: 3, unlocked: calculatedLevel >= 3, icon: Shield },
      { name: "RSI Divergence Filter", level: 5, unlocked: calculatedLevel >= 5, icon: Zap },
      { name: "RVOL Analysis", level: 7, unlocked: calculatedLevel >= 7, icon: TrendingUp },
      { name: "Funded Trader Challenge", level: 9, unlocked: calculatedLevel >= 9, icon: Target },
    ];

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="mesh-gradient fixed inset-0 pointer-events-none opacity-50" />
        <div className="grid-overlay fixed inset-0 pointer-events-none opacity-10" />

        <div className="relative max-w-2xl w-full space-y-8">
          {/* Success header */}
          <div className="text-center animate-fade-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-6 shadow-glow">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-bold mb-2">Assessment Complete!</h1>
            <p className="text-muted-foreground text-lg">Here's your Skill Level</p>
          </div>

          {/* Level Reveal */}
          <div className="glass-elevated p-10 text-center animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="mb-6">
              <div className="text-7xl font-bold font-mono mb-4 text-gradient-primary inline-block">
                Level {calculatedLevel}
              </div>
              <div className="flex justify-center">
                <LevelBadge level={calculatedLevel} size="lg" />
              </div>
            </div>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {calculatedLevel >= 6
                ? "Excellent! You have strong risk management fundamentals."
                : calculatedLevel >= 4
                  ? "Good foundation. Focus on discipline and you'll level up quickly."
                  : "We'll help you build solid trading habits from the ground up."}
            </p>
          </div>

          {/* Unlocked Features */}
          <div className="glass p-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <h3 className="font-display text-lg font-semibold mb-4">Feature Access</h3>
            <div className="space-y-2">
              {unlockedFeatures.map((feature) => (
                <div
                  key={feature.name}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${feature.unlocked
                    ? "bg-profit/10 border border-profit/20"
                    : "bg-card-elevated border border-border/30"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    {feature.unlocked ? (
                      <div className="p-1.5 rounded-lg bg-profit/20">
                        <CheckCircle2 className="w-4 h-4 text-profit" />
                      </div>
                    ) : (
                      <div className="p-1.5 rounded-lg bg-muted">
                        <feature.icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className={feature.unlocked ? "font-medium" : "text-muted-foreground"}>
                      {feature.name}
                    </span>
                  </div>
                  <LevelBadge level={feature.level} showLabel={false} size="sm" />
                </div>
              ))}
            </div>
          </div>

          {/* Capital Display */}
          <div className="glass p-5 flex items-center justify-between animate-fade-up" style={{ animationDelay: "300ms" }}>
            <span className="text-muted-foreground">Trading Capital</span>
            <span className="font-mono font-bold text-2xl text-primary">
              ${parseFloat(capital || "10000").toLocaleString()}
            </span>
          </div>

          <Button
            size="lg"
            className="w-full h-14 text-lg btn-glow animate-fade-up"
            style={{ animationDelay: "400ms" }}
            onClick={handleEnterDashboard}
          >
            Enter Your Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  // Quiz screen
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="grid-overlay opacity-15" />
      </div>

      <div className="relative max-w-2xl w-full space-y-8">
        {/* Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-display font-medium">Skill Assessment</span>
            <span className="text-muted-foreground font-mono">
              {currentQuestion + 1} / {totalQuestions + 1}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <div className="glass-elevated p-8">
          {isCapitalQuestion ? (
            <div className="space-y-6 animate-fade-up" key="capital">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold">
                  What's your trading capital?
                </h2>
                <p className="text-muted-foreground">
                  This helps us personalize your dashboard and position sizing recommendations.
                </p>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">
                  $
                </span>
                <Input
                  type="number"
                  placeholder="10,000"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  className="pl-10 text-2xl h-16 font-mono bg-card-elevated border-border/50 focus:border-primary"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Don't worry, you can change this later in settings.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-up" key={currentQ.id}>
              <h2 className="font-display text-2xl font-bold">{currentQ.question}</h2>
              <div className="space-y-3">
                {currentQ.options.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(currentQ.id, option.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${answers[currentQ.id] === option.value
                      ? "border-primary bg-primary/10 shadow-glow-sm"
                      : "border-border/50 hover:border-primary/30 hover:bg-card-hover"
                      }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg mr-3 text-sm font-medium transition-colors ${answers[currentQ.id] === option.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                        }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="border-border/50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>

          {isCapitalQuestion ? (
            <Button onClick={handleSubmit} disabled={!canProceed} className="btn-glow">
              Complete Assessment
              <CheckCircle2 className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
