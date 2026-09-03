'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { signUpUser } from '@/lib/auth/actions';
import { Mail, Lock, ShieldCheck, UserPlus, AlertCircle, CheckCircle2, User, MessageSquare, Copy, ExternalLink, CreditCard, Check, PhoneCall, UploadCloud, Image as ImageIcon, Trash2, Camera } from 'lucide-react';
import { AvatarPicker } from '@/components/auth/AvatarPicker';
import { PRESET_AVATARS, AvatarOption } from '@/data/avatars';
import { OrangeMoneyLogo, WaveLogo } from '@/components/ui/PaymentLogos';

export default function InscriptionPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarOption>(PRESET_AVATARS[0]);

  // Payment State (500 FCFA Mandatory Screenshot Upload)
  const [paymentMethod, setPaymentMethod] = useState<'orange_money' | 'wave'>('orange_money');
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [copiedUSSD, setCopiedUSSD] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    anonymousName: string;
    avatar: AvatarOption;
  } | null>(null);

  const USSD_CODE = '*144*2*1*06887330*500#';
  const WAVE_PAYMENT_URL = 'https://wave.com/send?phone=22106887330&amount=500';

  const handleCopyUSSD = () => {
    navigator.clipboard.writeText(USSD_CODE);
    setCopiedUSSD(true);
    setTimeout(() => setCopiedUSSD(false), 2500);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('La taille de la capture d\'écran ne doit pas dépasser 10 Mo.');
        return;
      }
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result as string);
        setErrorMessage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!firstName.trim() || !lastName.trim() || !email || !password || !confirmPassword) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    // MANDATORY Payment Screenshot Validation
    if (!paymentScreenshot) {
      setErrorMessage("Veuillez joindre la capture d'écran de votre preuve de paiement de 500 FCFA.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await signUpUser({
        email,
        password,
        firstName,
        lastName,
        avatarUrl: selectedAvatar.url,
        paymentMethod,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Erreur lors de l’inscription.');
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('parlons_en_has_seen_onboarding', 'true');
        }
        
        // Save payment to admin dashboard with screenshot
        try {
          const { addPaymentRecord } = await import('@/lib/admin/admin');
          addPaymentRecord({
            user_email: email,
            user_name: `${firstName} ${lastName}`,
            payment_screenshot_url: paymentScreenshot,
            payment_method: paymentMethod,
          });
        } catch (e) {
          console.error("Failed to add payment record to admin dashboard", e);
        }

        setSuccessInfo({
          anonymousName: res.anonymousName || 'Utilisateur #4821',
          avatar: selectedAvatar,
        });
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur inattendue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F7FF] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 antialiased">
      <Header />

      {/* Main Container */}
      <main className="flex-1 flex items-start sm:items-center justify-center px-2.5 sm:px-6 pt-2.5 sm:pt-6 pb-36 md:pb-12">
        
        {/* Compact & Wide Horizontal Form Container */}
        <div className="w-full max-w-5xl rounded-[32px] bg-white dark:bg-slate-900 shadow-2xl shadow-blue-600/20 overflow-hidden border-2 border-blue-300/80 dark:border-slate-800">
          
          {/* Top Blue Gradient Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-3.5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-2.5 border-b border-blue-500/30">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0 shadow-lg border border-white/20">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 fill-white/20" />
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-black backdrop-blur-md border border-white/30">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>Inscription Anonyme</span>
                </div>
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  Créer un compte PARLONS-EN
                </h1>
                <p className="text-[11px] sm:text-xs text-blue-100 font-medium hidden sm:block">
                  Rejoins notre communauté bienveillante. Frais d'entrée : <strong className="text-amber-300">500 FCFA</strong>.
                </p>
              </div>
            </div>

            <div className="shrink-0 text-center sm:text-right hidden sm:block">
              <span className="text-xs font-black uppercase tracking-widest text-slate-950 bg-[#FFFC00] px-3.5 py-1 rounded-full border border-yellow-400 shadow-xs">
                Accès 500 FCFA
              </span>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-3.5 sm:p-8 pb-8 sm:pb-8 bg-gradient-to-b from-blue-50/50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            
            {successInfo ? (
              <div className="py-8 text-center space-y-5 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-blue-200 dark:border-slate-800 shadow-xl max-w-xl mx-auto">
                <div className="relative w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 p-1 shadow-xl">
                  <div className={`w-full h-full rounded-[22px] bg-gradient-to-br ${successInfo.avatar.gradient} flex items-center justify-center text-3xl overflow-hidden`}>
                    <img
                      src={successInfo.avatar.url}
                      alt="Avatar Anonyme"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    Bienvenue {firstName} !
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold">
                    Paiement de 500 FCFA validé ! Ton identité anonyme attribuée :
                  </p>
                  <div className="inline-flex items-center gap-2 py-2 px-6 bg-blue-600 text-white rounded-full font-black text-lg shadow-lg mt-2">
                    <span>{successInfo.anonymousName}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => router.push('/')}
                    className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black rounded-full shadow-xl text-base py-3.5 border-none"
                  >
                    Accéder à la plateforme (Accueil 🚀)
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 max-w-4xl mx-auto">
                
                {errorMessage && (
                  <div className="p-3.5 bg-rose-500/15 border-2 border-rose-500/60 rounded-2xl text-rose-700 dark:text-rose-300 font-extrabold text-xs flex items-center gap-2.5 shadow-xs">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* ROW 1: Names + Email */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5">
                  <Input
                    label="Prénom"
                    placeholder="Prénom"
                    leftIcon={<User className="w-3.5 h-3.5" />}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    label="Nom"
                    placeholder="Nom"
                    leftIcon={<User className="w-3.5 h-3.5" />}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                  <div className="col-span-2 md:col-span-1">
                    <Input
                      label="Adresse e-mail"
                      type="email"
                      placeholder="votre.email@exemple.com"
                      leftIcon={<Mail className="w-3.5 h-3.5" />}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* ROW 2: Bitmoji Picker Bar */}
                <div className="bg-blue-600/10 dark:bg-slate-800/80 p-2.5 sm:p-3 rounded-3xl border border-blue-200/80 dark:border-slate-700 shadow-sm">
                  <AvatarPicker
                    selectedAvatar={selectedAvatar}
                    onSelectAvatar={setSelectedAvatar}
                  />
                </div>

                {/* ROW 3: Passwords */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  <Input
                    label="Mot de passe"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-3.5 h-3.5" />}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Input
                    label="Confirmer le mot de passe"
                    type="password"
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-3.5 h-3.5" />}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* ROW 4: MANDATORY 500 FCFA PAYMENT SECTION */}
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-yellow-500/10 dark:from-amber-500/15 dark:to-slate-900 border-2 border-amber-400/60 dark:border-amber-500/40 space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-300/40 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow">
                        💳
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>Frais d'inscription obligatoires</span>
                          <span className="text-amber-600 dark:text-amber-400 font-extrabold">(500 FCFA)</span>
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                          Choisissez votre moyen de paiement et effectuez le transfert vers le <strong className="text-slate-900 dark:text-white font-black">06887330</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="px-3 py-1 bg-amber-400 text-slate-950 text-xs font-black rounded-full shadow-xs self-start sm:self-center">
                      500 FCFA Fixe
                    </div>
                  </div>

                  {/* Payment Method Tabs with Real Logos */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Orange Money Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('orange_money')}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition text-left ${
                        paymentMethod === 'orange_money'
                          ? 'border-[#FF6600] bg-[#FF6600]/10 dark:bg-[#FF6600]/20 shadow-md ring-2 ring-[#FF6600]'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#FF6600]/50'
                      }`}
                    >
                      <OrangeMoneyLogo className="w-10 h-10 shrink-0" />
                      <div className="space-y-0.5">
                        <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                          <span>Orange Money</span>
                          {paymentMethod === 'orange_money' && <Check className="w-3.5 h-3.5 text-[#FF6600] stroke-[3]" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                          USSD Code Rapide
                        </p>
                      </div>
                    </button>

                    {/* Wave Option */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('wave')}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 transition text-left ${
                        paymentMethod === 'wave'
                          ? 'border-[#1DC4FF] bg-[#1DC4FF]/10 dark:bg-[#1DC4FF]/20 shadow-md ring-2 ring-[#1DC4FF]'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-[#1DC4FF]/50'
                      }`}
                    >
                      <WaveLogo className="w-10 h-10 shrink-0" />
                      <div className="space-y-0.5">
                        <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1">
                          <span>Wave</span>
                          {paymentMethod === 'wave' && <Check className="w-3.5 h-3.5 text-[#1DC4FF] stroke-[3]" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                          Lien Redirection Direct
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Instructions per Payment Method */}
                  {paymentMethod === 'orange_money' ? (
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-amber-300 dark:border-slate-800 space-y-2.5 overflow-hidden">
                      <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex flex-wrap items-center justify-between gap-1.5">
                        <span>📱 Code USSD Orange Money :</span>
                        <span className="text-[10px] text-[#FF6600] font-extrabold uppercase bg-orange-100 dark:bg-orange-950 px-2 py-0.5 rounded-full border border-orange-300">
                          Redirection Appel 📞
                        </span>
                      </div>
                      
                      <a
                        href="tel:*144*2*1*06887330*500%23"
                        className="flex flex-col sm:flex-row items-center justify-between gap-2.5 bg-gradient-to-r from-[#FF6600]/15 via-orange-50 to-[#FF6600]/25 dark:from-[#FF6600]/25 dark:to-slate-950 p-3 rounded-xl border-2 border-[#FF6600] hover:bg-[#FF6600]/20 transition group shadow-sm cursor-pointer w-full text-center sm:text-left"
                        title="Cliquer pour composer le code USSD sur votre téléphone"
                      >
                        <div className="flex items-center justify-center sm:justify-start gap-2 min-w-0">
                          <PhoneCall className="w-5 h-5 text-[#FF6600] animate-pulse shrink-0" />
                          <code className="text-xs sm:text-sm font-black font-mono text-[#FF6600] tracking-wider group-hover:underline truncate">
                            {USSD_CODE}
                          </code>
                        </div>
                        <span className="w-full sm:w-auto px-4 py-2 bg-[#FF6600] text-white font-black text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 shrink-0">
                          <span>Appeler / Lancer 📞</span>
                        </span>
                      </a>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                        <span>Destinataire : <strong>06887330</strong> (500 F)</span>
                        <button
                          type="button"
                          onClick={handleCopyUSSD}
                          className="text-[#FF6600] hover:underline font-bold flex items-center gap-1 bg-orange-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-orange-200 dark:border-slate-700"
                        >
                          {copiedUSSD ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#FF6600]" />}
                          <span>{copiedUSSD ? 'Code copié !' : 'Copier le code'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-amber-300 dark:border-slate-800 space-y-2.5">
                      <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                        🌊 Lien Direct de Paiement Wave (500 FCFA vers 06887330) :
                      </div>
                      <a
                        href={WAVE_PAYMENT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-4 bg-[#1DC4FF] hover:bg-cyan-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Ouvrir l'application Wave pour Payer 500 FCFA</span>
                      </a>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium">
                        Si la redirection ne s'ouvre pas automatiquement, effectuez le transfert Wave vers le <strong>06887330</strong>.
                      </p>
                    </div>
                  )}

                  {/* MANDATORY PAYMENT SCREENSHOT UPLOAD */}
                  <div className="space-y-2 pt-1">
                    <label className="text-xs font-black text-slate-900 dark:text-white flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Camera className="w-4 h-4 text-amber-500" />
                        <span>Capture d'écran de la preuve de paiement (Obligatoire) *</span>
                      </span>
                      {paymentScreenshot && (
                        <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          ✅ Capture jointe
                        </span>
                      )}
                    </label>

                    <input
                      type="file"
                      id="payment-screenshot-input"
                      accept="image/*"
                      onChange={handleScreenshotChange}
                      className="hidden"
                    />

                    {!paymentScreenshot ? (
                      <label
                        htmlFor="payment-screenshot-input"
                        className="p-5 sm:p-6 rounded-2xl border-2 border-dashed border-amber-400 dark:border-amber-500/60 bg-amber-400/5 hover:bg-amber-400/10 transition cursor-pointer flex flex-col items-center justify-center text-center space-y-2 group shadow-xs"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-500 flex items-center justify-center group-hover:scale-110 transition">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                            Cliquez pour téléverser votre capture d'écran de paiement
                          </p>
                          <p className="text-[11px] text-slate-500 font-bold">
                            Reçu Orange Money ou Wave (JPG, PNG, WEBP — Max 10 Mo)
                          </p>
                        </div>
                      </label>
                    ) : (
                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500/60 flex items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 bg-slate-950">
                            <img src={paymentScreenshot} alt="Capture de paiement" className="w-full h-full object-cover" />
                          </div>
                          <div className="space-y-0.5 truncate">
                            <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {screenshotName || 'capture_paiement_500fcfa.png'}
                            </p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Image de reçu validée
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <label
                            htmlFor="payment-screenshot-input"
                            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black cursor-pointer border border-slate-300 dark:border-slate-700"
                          >
                            Changer
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentScreenshot(null);
                              setScreenshotName('');
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl border border-rose-200 dark:border-rose-950 cursor-pointer"
                            title="Supprimer la capture"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold pt-0.5">
                      ⚠️ La capture d'écran nette du SMS ou reçu de votre transfert (500 FCFA) est vérifiée par l'administrateur avant l'activation du compte.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isLoading}
                    leftIcon={<UserPlus className="w-5 h-5" />}
                    className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-full shadow-xl shadow-amber-400/40 py-3.5 text-base border-none tracking-wide"
                  >
                    Valider le Paiement (500 FCFA) & S'inscrire
                  </Button>
                </div>

              </form>
            )}

            {/* Bottom Link with Permanent Admin Link */}
            <div className="mt-4 pt-3 pb-2 border-t border-blue-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-black text-slate-700 dark:text-slate-300">
              <div>
                <span>Déjà membre de la communauté ?</span>{' '}
                <Link
                  href="/connexion"
                  className="font-black text-blue-700 dark:text-blue-300 hover:text-blue-900 underline underline-offset-4 text-sm ml-1 inline-block py-1"
                >
                  Se connecter
                </Link>
              </div>

              {/* Permanent Secret Admin Link */}
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 text-amber-400 font-black text-xs rounded-full border border-amber-400/50 shadow-md transition shrink-0"
                title="Accès réservé à l'administrateur (Protégé par Code Secret)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Espace Administrateur 🛡️</span>
              </Link>
            </div>

          </div>

        </div>
      </main>

      <MobileNav />
    </div>
  );
}

