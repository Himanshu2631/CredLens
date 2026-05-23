/**
 * Centralized API Client Utilities for CredLens SaaS Platform
 */

/**
 * Helper to handle fetch responses and parse standard JSON errors.
 * 
 * @param {Response} response 
 * @returns {Promise<Object>} Resolved JSON response
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorMsg = 'An unexpected server error occurred.';
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch (e) {
      // Fallback for non-JSON response errors
    }
    throw new Error(errorMsg);
  }
  return response.json();
}

/**
 * Sends audit inputs to the backend API to evaluate rules and persist the audit.
 * 
 * @param {Object} payload Audit form inputs (tools, plans, spend, seats, etc.)
 * @returns {Promise<Object>} Database persisted Audit report
 */
export async function createSpendAudit(payload) {
  const response = await fetch('/api/audit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      projectName: payload.projectName || 'My Startup AI Stack',
      tools: payload.tools || [],
      toolPlans: payload.toolPlans || {},
      seats: Number(payload.seats) || 1,
      inactiveSeats: Number(payload.inactiveSeats) || 0,
      monthlySpend: Number(payload.monthlySpend) || 0,
      useCase: payload.useCase,
      optimizationGoal: payload.optimizationGoal || '',
      isPublic: payload.isPublic ?? true, // Default to true to allow immediate sharing capabilities
      ownerId: payload.ownerId || null,
      metadata: payload.metadata || {}
    })
  });
  
  return handleResponse(response);
}

/**
 * Submits company lead capture info linked to an audit reference.
 * 
 * @param {Object} payload Lead parameters (companyName, email, contactName, auditId, etc.)
 * @returns {Promise<Object>} Database persisted Lead record
 */
export async function createLead(payload) {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      companyName: payload.companyName,
      contactName: payload.contactName || 'SaaS Operator',
      email: payload.email,
      phone: payload.phone || '',
      activeSpend: Number(payload.activeSpend) || 0,
      auditId: payload.auditId || null,
      teamSize: Number(payload.teamSize) || null,
      metadata: payload.metadata || {}
    })
  });

  return handleResponse(response);
}
