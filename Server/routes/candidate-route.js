import express from "express"
import { addCandidate, listCandidates, getCandidateById, advanceCandidate, rejectCandidate, updatePhase } from "../controllers/candidate-controller.js"

const candidateRouter = express.Router()

candidateRouter.post('/candidates/add', addCandidate)
candidateRouter.get('/candidates', listCandidates)
candidateRouter.get('/candidates/:id', getCandidateById)
candidateRouter.post('/candidates/:id/advance', advanceCandidate)
candidateRouter.post('/candidates/:id/reject', rejectCandidate)
candidateRouter.patch('/candidates/:id/phase/:phaseName', updatePhase)

export default candidateRouter
