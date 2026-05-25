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

/**
 * Fetches a single audit report by its MongoDB ID or public shareToken.
 * 
 * @param {string} id MongoDB ObjectId or unique shareToken
 * @returns {Promise<Object>} Persisted Audit report
 */
export async function getSpendAudit(id) {
  const response = await fetch(`/api/audit/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
}

/**
 * Submits user details to request beta access for a planned feature.
 * 
 * @param {Object} payload (companyName, email, teamSize, featureKey)
 * @returns {Promise<Object>} Persisted BetaRequest record
 */
export async function createBetaRequest(payload) {
  const response = await fetch('/api/beta-requests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      companyName: payload.companyName,
      email: payload.email,
      teamSize: payload.teamSize ? Number(payload.teamSize) : null,
      featureKey: payload.featureKey || 'subscription_hub'
    })
  });

  return handleResponse(response);
}

/**
 * Submits product feedback data to the database API route.
 * 
 * @param {Object} payload (name, email, message)
 * @returns {Promise<Object>} Persisted Feedback record
 */
export async function createFeedback(payload) {
  const response = await fetch('/api/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      message: payload.message,
    })
  });

  return handleResponse(response);
}

