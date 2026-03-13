'use server';

import { createClient } from '@supabase/supabase-js';

// Utilisation directe des variables d'env pour plus de fiabilité dans le nouveau projet
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
}

export async function validateParticipantForExam(email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Récupérer le participant
    const { data: participant, error: pError } = await supabase
      .from('school_participants')
      .select('id, full_name')
      .ilike('email', cleanEmail)
      .single();

    if (pError || !participant) {
      return { success: false, error: 'Email non trouvé. Assurez-vous d\'utiliser l\'adresse mail fournie lors de votre inscription.' };
    }

    // 2. Vérifier si l'examen a déjà été passé
    const { data: result } = await supabase
      .from('school_exam_results')
      .select('*')
      .eq('participant_id', participant.id)
      .maybeSingle();

    // SI DÉJÀ PASSÉ : On renvoie les résultats direct
    if (result) {
      return { 
        success: true, 
        alreadyFinished: true, 
        participantId: participant.id,
        existingResult: result 
      };
    }

    // 3. Récupérer la présence explicitement (pour les nouveaux)
    const { data: att, error: aError } = await supabase
      .from('school_attendance')
      .select('day_1, day_2, day_3')
      .eq('participant_id', participant.id)
      .maybeSingle();

    if (aError || !att) {
      return { success: false, error: 'Données de présence non trouvées. Veuillez contacter un organisateur.' };
    }

    // 4. Validation des conditions de présence
    if (!att.day_3) {
      return { success: false, error: 'La présence au Jour 3 (aujourd\'hui) est obligatoire pour passer l\'examen.' };
    }

    const presenceCount = [att.day_1, att.day_2, att.day_3].filter(Boolean).length;
    if (presenceCount < 2) {
      return { success: false, error: 'Vous devez avoir été présent au moins 2 jours sur 3 pour passer l\'examen.' };
    }

    return { success: true, alreadyFinished: false, participantId: participant.id };
  } catch (error: any) {
    console.error('Erreur validation:', error);
    return { success: false, error: 'Une erreur technique est survenue.' };
  }
}

/**
 * Récupérer les 21 questions (mélangées)
 */
export async function getExamQuestions() {
  try {
    const { data, error } = await supabase
      .from('school_exam_questions')
      .select('*')
      .limit(21);

    if (error) throw error;
    
    // Mélanger les questions pour chaque session
    const shuffled = data.sort(() => 0.5 - Math.random());
    
    return { success: true, questions: shuffled };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Enregistrer le résultat de l'examen avec les réponses
 */
export async function submitExamResult(participantId: string, questionsCorrect: number, durationSeconds: number, answers: Record<number, number>) {
  try {
    const { data: attendance } = await supabase
      .from('school_attendance')
      .select('*')
      .eq('participant_id', participantId)
      .single();

    let attendancePoints = 0;
    if (attendance) {
      if (attendance.day_1) attendancePoints += 4;
      if (attendance.day_2) attendancePoints += 6;
      if (attendance.day_3) attendancePoints += 6;
    }

    const examPoints = questionsCorrect * 4;
    const totalScore = attendancePoints + examPoints;

    const { error } = await supabase
      .from('school_exam_results')
      .insert([{
        participant_id: participantId,
        score: totalScore,
        total_questions: 21,
        completed_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        // answers: answers // Temporairement désactivé car la colonne n'existe pas dans la DB
      }]);

    if (error) throw error;
    return { success: true, totalScore, attendancePoints, examPoints };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
