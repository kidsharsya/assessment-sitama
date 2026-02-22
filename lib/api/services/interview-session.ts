// ============================================
// Interview Session API Service Stubs
// Placeholder functions - akan diganti dengan implementasi API sebenarnya
// ============================================

/**
 * Toggle active status sesi wawancara
 */
export async function toggleInterviewSessionActive(sessionId: string): Promise<void> {
  // TODO: Replace with actual API call
  console.log('Toggle active for session:', sessionId);
  await new Promise((resolve) => setTimeout(resolve, 300));
}

/**
 * Add participants ke sesi wawancara
 */
export async function addInterviewParticipants(sessionId: string, applicationIds: string[]): Promise<void> {
  // TODO: Replace with actual API call
  console.log('Add participants to session:', sessionId, applicationIds);
  await new Promise((resolve) => setTimeout(resolve, 300));
}

/**
 * Remove participants dari sesi wawancara
 */
export async function removeInterviewParticipants(sessionId: string, applicationIds: string[]): Promise<void> {
  // TODO: Replace with actual API call
  console.log('Remove participants from session:', sessionId, applicationIds);
  await new Promise((resolve) => setTimeout(resolve, 300));
}
