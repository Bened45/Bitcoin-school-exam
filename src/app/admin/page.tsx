'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { useRouter } from 'next/navigation';
import Card from '@/app/components/ui/Card';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaChartBar,
  FaArrowRight,
  FaCog,
  FaTrophy
} from 'react-icons/fa';
import Link from 'next/link';

export default function GlobalAdminDashboard() {
  const [stats, setStats] = useState({
    totalParticipants: 0,
    activeEvents: 0,
    examsCompleted: 0
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      fetchGlobalStats();
    };
    init();
  }, [router]);

  const fetchGlobalStats = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const [participants, results] = await Promise.all([
        supabase.from('school_participants').select('*', { count: 'exact', head: true }),
        supabase.from('school_exam_results').select('*', { count: 'exact', head: true })
      ]);

      setStats({
        totalParticipants: participants.count || 0,
        activeEvents: 1, // Pour l'instant on a 1 événement actif (Bitcoin School)
        examsCompleted: results.count || 0
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardCards = [
    {
      title: 'Gestion Participants',
      description: 'Gérer les inscriptions et les présences.',
      icon: FaUsers,
      count: stats.totalParticipants,
      href: '/admin/participants',
      color: 'from-brand-green to-emerald-500'
    },
    {
      title: 'Configuration Examens',
      description: 'Modifier les questions et les points.',
      icon: FaCog,
      count: 21,
      href: '/admin/questions',
      color: 'from-blue-500 to-brand-electric'
    },
    {
      title: 'Résultats & Classement',
      description: 'Voir les scores et les gagnants.',
      icon: FaTrophy,
      count: stats.examsCompleted,
      href: '/admin/results',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <div className="p-8 md:p-12">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-4">
          Events <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-accent">Platform</span>
        </h1>
        <p className="text-xl text-gray-400">Administration centralisée des événements Bitcoin Bénin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {dashboardCards.map((card, index) => (
          <Link href={card.href} key={index} className="group">
            <Card className="p-8 h-full bg-brand-charcoal hover:border-brand-green/30 transition-all duration-500 border border-white/5">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} p-4 text-white text-2xl mb-8`}>
                <card.icon />
              </div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">{card.title}</div>
              <div className="text-4xl font-display font-black text-white mb-4">{loading ? '...' : card.count}</div>
              <p className="text-gray-400 text-sm mb-6">{card.description}</p>
              <div className="flex items-center gap-2 text-brand-green font-bold">Gérer <FaArrowRight /></div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
