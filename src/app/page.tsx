'use client';

import Button from '@/app/components/ui/Button';
import { FaGraduationCap, FaCalendarCheck, FaAward, FaSchool, FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function ParticipantLanding() {
  const router = useRouter();

  const features = [
    {
      icon: FaSchool,
      title: "Formation Intensive",
      description: "Maîtrisez les fondamentaux de Bitcoin, de la théorie à la pratique."
    },
    {
      icon: FaCalendarCheck,
      title: "Présence Certifiée",
      description: "Validez votre participation pour accéder à l'examen final."
    },
    {
      icon: FaAward,
      title: "Certification",
      description: "Obtenez votre score au Bitcoin Exam et mesurez vos connaissances."
    }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden text-center">
        <div 
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/hero-background.jpg)' }}
        >
          <div className="absolute inset-0 bg-[#020617]/80" />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#53CB6015_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#53CB6010] border border-[#53CB6020] text-[#53CB60] mb-8">
            <FaGraduationCap />
            <span className="text-sm font-bold tracking-wider uppercase">Plateforme Participant</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Bitcoin <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#53CB60] to-[#3FA34C]">Exam</span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Bienvenue sur l'espace d'examen officiel. Identifiez-vous avec votre e-mail pour commencer votre évaluation de 21 questions.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              variant="primary" 
              size="lg" 
              className="px-10 py-5 text-xl font-bold rounded-full flex items-center gap-2 group shadow-[0_0_20px_-5px_rgba(83,203,96,0.3)]"
              onClick={() => router.push('/exam')}
            >
              Passer l'Examen <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-[#0F172A50]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="p-8 rounded-2xl bg-[#020617] border border-white/5 hover:border-[#53CB6030] transition-all group">
              <div className="w-14 h-14 rounded-xl bg-[#53CB6010] flex items-center justify-center text-[#53CB60] text-2xl mb-6 group-hover:scale-110 transition-transform">
                <feature.icon />
              </div>
              <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Info */}
      <footer className="py-12 text-center text-gray-500 text-sm">
        <p>&copy; 2026 Bitcoin Bénin - Plateforme d'Éducation Bitcoin</p>
      </footer>
    </div>
  );
}
