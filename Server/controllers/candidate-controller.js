import Candidate from "../models/candidate-model.js"

const DEFAULT_PIPELINE = [
  "applied",
  "screening",
  "technical",
  "managerial",
  "hr",
  "behavioral",
  "offer",
  "hired"
]

const initPhases = () => DEFAULT_PIPELINE.map(name => ({ name, status: name === 'applied' ? 'in-progress' : 'pending' }))

export const addCandidate = async (req, res) => {
  try {
    // Support single object or array of objects
    let candidates = Array.isArray(req.body) ? req.body : [req.body]

    // Basic validation and normalization
    const invalid = []
    candidates = candidates.map((c, idx) => {
      const name = c?.name?.trim()
      const email = c?.email?.trim()
      if (!name || !email) invalid.push(idx)
      return {
        name,
        email,
        phone: c?.phone || undefined,
        roleApplied: c?.roleApplied || undefined,
        resumeUrl: c?.resumeUrl || undefined,
        source: c?.source || undefined,
        notes: c?.notes || undefined,
        currentPhase: 'applied',
        phases: initPhases(),
      }
    })

    if (invalid.length > 0) {
      return res.status(400).json({ success: false, message: `name and email are required for items at indices: ${invalid.join(', ')}` })
    }

    // Check duplicates by email to avoid dup candidates
    const emails = candidates.map(c => c.email)
    const existing = await Candidate.find({ email: { $in: emails } }, { email: 1 })
    if (existing.length > 0) {
      const existingEmails = existing.map(e => e.email)
      return res.status(400).json({ success: false, message: `Candidate(s) with the following email already exist: ${existingEmails.join(', ')}` })
    }

    // Insert
    const saved = await Candidate.insertMany(candidates)

    return res.status(201).json({ success: true, count: saved.length, data: saved })
  } catch (error) {
    console.error('addCandidate error:', error)
    return res.status(500).json({ success: false, message: 'Failed to add candidate', error: error.message })
  }
}

export const listCandidates = async (_req, res) => {
  try {
    const list = await Candidate.find({}).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, data: list })
  } catch (error) {
    console.error('listCandidates error:', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch candidates', error: error.message })
  }
}

export const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params
    const doc = await Candidate.findById(id)
    if (!doc) return res.status(404).json({ success: false, message: 'Candidate not found' })
    return res.status(200).json({ success: true, data: doc })
  } catch (error) {
    console.error('getCandidateById error:', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch candidate', error: error.message })
  }
}

export const advanceCandidate = async (req, res) => {
  try {
    const { id } = req.params
    const { feedback, score } = req.body || {}
    const doc = await Candidate.findById(id)
    if (!doc) return res.status(404).json({ success: false, message: 'Candidate not found' })
    if (doc.status !== 'active') return res.status(400).json({ success: false, message: 'Candidate is not active' })

    const currentIdx = DEFAULT_PIPELINE.indexOf(doc.currentPhase)
    if (currentIdx === -1) return res.status(400).json({ success: false, message: 'Invalid current phase' })

    // Complete current phase
    const now = new Date()
    const currentPhase = doc.phases.find(p => p.name === doc.currentPhase)
    if (currentPhase) {
      currentPhase.status = 'completed'
      if (feedback) currentPhase.feedback = feedback
      if (score) currentPhase.score = score
      currentPhase.updatedAt = now
    }

    // If already at last stage 'hired', mark hired
    if (doc.currentPhase === 'hired') {
      doc.status = 'hired'
    } else {
      // Move to next
      const nextIdx = Math.min(currentIdx + 1, DEFAULT_PIPELINE.length - 1)
      const nextPhaseName = DEFAULT_PIPELINE[nextIdx]
      doc.currentPhase = nextPhaseName
      const nextPhase = doc.phases.find(p => p.name === nextPhaseName)
      if (nextPhase) nextPhase.status = 'in-progress'
      if (nextPhaseName === 'hired') doc.status = 'hired'
    }

    await doc.save()
    return res.status(200).json({ success: true, data: doc })
  } catch (error) {
    console.error('advanceCandidate error:', error)
    return res.status(500).json({ success: false, message: 'Failed to advance candidate', error: error.message })
  }
}

export const rejectCandidate = async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body || {}
    const doc = await Candidate.findById(id)
    if (!doc) return res.status(404).json({ success: false, message: 'Candidate not found' })

    doc.status = 'rejected'
    const current = doc.phases.find(p => p.name === doc.currentPhase)
    if (current) {
      current.status = 'completed'
      if (reason) current.feedback = `Rejected: ${reason}`
      current.updatedAt = new Date()
    }

    await doc.save()
    return res.status(200).json({ success: true, data: doc })
  } catch (error) {
    console.error('rejectCandidate error:', error)
    return res.status(500).json({ success: false, message: 'Failed to reject candidate', error: error.message })
  }
}

export const updatePhase = async (req, res) => {
  try {
    const { id, phaseName } = req.params
    const { scheduledAt, interviewer, status, feedback, score } = req.body || {}
    const doc = await Candidate.findById(id)
    if (!doc) return res.status(404).json({ success: false, message: 'Candidate not found' })

    const phase = doc.phases.find(p => p.name === phaseName)
    if (!phase) return res.status(404).json({ success: false, message: 'Phase not found' })
    if (scheduledAt) phase.scheduledAt = new Date(scheduledAt)
    if (interviewer !== undefined) phase.interviewer = interviewer
    if (status) phase.status = status
    if (feedback !== undefined) phase.feedback = feedback
    if (score !== undefined) phase.score = score
    phase.updatedAt = new Date()

    await doc.save()
    return res.status(200).json({ success: true, data: doc })
  } catch (error) {
    console.error('updatePhase error:', error)
    return res.status(500).json({ success: false, message: 'Failed to update phase', error: error.message })
  }
}
