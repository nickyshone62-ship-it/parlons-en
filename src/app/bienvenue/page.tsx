'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Lock,
  MessageCircle,
  Lightbulb,
  FlaskConical,
  Trophy,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CHARACTER_AVATARS } from '@/data/avatars';

export default function BienvenuePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const communityAvatars = CHARACTER_AVATARS.slice(0, 8);

  const handleFinishOnboarding = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('parlons_en_has_seen_onboarding', 'true');
    }
    router.push('/');
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinishOnboarding();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-900 text-white p-4 sm:p-8 lg:p-12 relative overflow-hidden font-sans transition-colors duration-300 antialiased">
      
      {/* Background Decorative Blur Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER BAR */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between z-20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shadow-lg border border-white/20">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 fill-white/20" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[10px] sm:text-xs font-black backdrop-blur-md border border-white/30">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>Présentation</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              PARLONS-EN
            </h1>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black backdrop-blur-md">
          <Lock className="w-3.5 h-3.5" />
          <span>Étape 1 / 3 : Présentation Obligatoire</span>
        </div>
      </header>

      {/* CENTER MAIN CONTENT (FULL PAGE CONTAINER) */}
      <main className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-center items-center text-center my-auto py-6 sm:py-10 z-20 space-y-6 sm:space-y-8">
        
        {/* Step Indicator Paginator */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-xs font-black uppercase tracking-widest text-amber-300 bg-white/15 px-4 py-1.5 rounded-full border border-white/25 backdrop-blur-md shadow-xs">
            Étape {currentStep} sur {totalSteps}
          </span>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`h-3 rounded-full transition-all duration-300 ${
                  currentStep === step
                    ? 'w-8 bg-amber-400 shadow-md'
                    : 'w-3 bg-white/30 hover:bg-white/50'
                }`}
                title={`Étape ${step}`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="w-full bg-white/10 backdrop-blur-xl border border-white/25 rounded-[36px] p-6 sm:p-12 space-y-6 shadow-2xl animate-fade-in text-center max-w-3xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-xl">
              <MessageCircle className="w-9 h-9 sm:w-11 sm:h-11 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                💬 1. Partage ton problème
              </h2>
              <p className="text-sm sm:text-lg text-blue-100 font-bold max-w-2xl mx-auto leading-relaxed">
                Expose une situation, un souci ou un dilemme que tu traverses. Rédige ton message librement, sans crainte de jugement ni de répercussions.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="w-full bg-white/10 backdrop-blur-xl border border-white/25 rounded-[36px] p-6 sm:p-12 space-y-6 shadow-2xl animate-fade-in text-center max-w-3xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-xl">
              <Lightbulb className="w-9 h-9 sm:w-11 sm:h-11 stroke-[2.5]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                💡 2. Découvre des pistes de solution
              </h2>
              <p className="text-sm sm:text-lg text-blue-100 font-bold max-w-2xl mx-auto leading-relaxed">
                La communauté te propose des conseils sincères, des retours d'expériences véçus et des solutions concrètes adaptés à ta situation.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="w-full bg-white/10 backdrop-blur-xl border border-white/25 rounded-[36px] p-6 sm:p-12 space-y-6 shadow-2xl animate-fade-in text-center max-w-3xl">
            <div className="flex items-center justify-center gap-3">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg">
                <FlaskConical className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.5]" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                🧪 3. Essaie une piste & 🏆 Partage le résultat
              </h2>
              <p className="text-sm sm:text-lg text-blue-100 font-bold max-w-2xl mx-auto leading-relaxed">
                Applique la meilleure réponse au quotidien, puis reviens indiquer à la communauté si elle t'a réellement aidé à débloquer ton problème !
              </p>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div className="w-full bg-white/10 backdrop-blur-xl border border-white/25 rounded-[36px] p-6 sm:p-12 space-y-6 shadow-2xl animate-fade-in text-center max-w-3xl">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-xl">
              <Lock className="w-9 h-9 sm:w-11 sm:h-11 stroke-[2.5]" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                🔐 4. Confidentialité & Anonymat total
              </h2>
              <p className="text-sm sm:text-lg text-blue-100 font-bold max-w-2xl mx-auto leading-relaxed">
                Toutes tes interventions se font sous un pseudonyme neutre et anonyme attribué par la plateforme :
              </p>

              <div className="inline-flex items-center gap-2.5 py-2.5 px-6 bg-white text-blue-900 rounded-full font-black text-base sm:text-lg shadow-xl">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span>"Utilisateur #4821"</span>
              </div>

              <div className="pt-4 border-t border-white/20 flex flex-wrap items-center justify-center gap-2">
                {communityAvatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${avatar.gradient} p-0.5 shadow-md`}
                  >
                    <img src={avatar.url} alt="Membre" className="w-full h-full object-cover rounded-[10px]" />
                  </div>
                ))}
                <span className="text-xs font-black text-amber-300 ml-2">+100 membres actifs</span>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION CONTROLS */}
        <div className="w-full max-w-3xl flex items-center justify-between gap-4 pt-2">
          <div>
            {currentStep > 1 ? (
              <button
                onClick={handlePrevStep}
                className="inline-flex items-center gap-2 text-sm sm:text-base font-black text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full border border-white/20 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Précédent
              </button>
            ) : <div />}
          </div>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNextStep}
              variant="primary"
              size="md"
              rightIcon={<ArrowRight className="w-5 h-5" />}
              className="bg-white text-blue-900 hover:bg-blue-50 font-black rounded-full shadow-xl text-sm sm:text-base px-7 py-3 border-none"
            >
              Suivant ({currentStep}/{totalSteps})
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
              <Link
                href="/inscription"
                onClick={() => {
                  if (typeof window !== 'undefined') localStorage.setItem('parlons_en_has_seen_onboarding', 'true');
                }}
                className="w-full sm:w-auto flex-1"
              >
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={<Sparkles className="w-5 h-5" />}
                  className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-full shadow-2xl shadow-amber-400/40 text-sm sm:text-base px-6 py-3.5 border-none"
                >
                  🚀 Pass à l'Étape 2 : Inscription
                </Button>
              </Link>
              <Link
                href="/connexion"
                onClick={() => {
                  if (typeof window !== 'undefined') localStorage.setItem('parlons_en_has_seen_onboarding', 'true');
                }}
                className="w-full sm:w-auto flex-1"
              >
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<UserCheck className="w-5 h-5 text-white" />}
                  className="w-full bg-white/15 hover:bg-white/25 text-white border-white/40 font-black rounded-full text-sm sm:text-base px-6 py-3.5 backdrop-blur-md"
                >
                  🔑 Connexion
                </Button>
              </Link>
            </div>
          )}
        </div>

      </main>

      {/* BOTTOM FOOTER BAR */}
      <footer className="w-full max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 z-20 pt-4 border-t border-white/20 text-xs font-black text-blue-100">
        <div>100% Anonyme & Confidentiel</div>
        <div className="flex items-center gap-4">
          <Link href="/connexion" className="hover:text-amber-300 underline underline-offset-4">
            Déjà inscrit ? Se connecter
          </Link>
          <span>•</span>
          <Link href="/inscription" className="hover:text-amber-300 underline underline-offset-4">
            Créer un compte
          </Link>
        </div>
      </footer>

    </div>
  );
}
