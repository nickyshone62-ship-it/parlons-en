import { signOutUser } from '@/lib/auth/actions';
import { deleteAllDiscussionsAndResetDatabase } from '@/lib/supabase/posts';
import { resetAdminSpaceToZero } from '@/lib/admin/admin';

/**
 * Remet l'intégralité de la plateforme à zéro :
 * - Efface tous les messages, discussions, votes et identités Supabase
 * - Remet l'espace administrateur à zéro (0 paiements, 0 signalements, 0 avertissements)
 * - Efface la totalité du localStorage et du sessionStorage
 * - Déconnecte toute session utilisateur active
 * - Redirige vers la page d'accueil / présentation
 */
export async function resetPlatformToZero() {
  try {
    await deleteAllDiscussionsAndResetDatabase();
  } catch (e) {
    console.error("Erreur lors de la purge Supabase:", e);
  }

  try {
    resetAdminSpaceToZero();
  } catch (e) {
    console.error("Erreur lors du reset Admin:", e);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error("Erreur lors du nettoyage du localStorage:", e);
    }
  }

  try {
    await signOutUser();
  } catch (e) {
    // Ignorer si déjà déconnecté
  }

  if (typeof window !== 'undefined') {
    window.location.href = '/bienvenue';
  }
}
