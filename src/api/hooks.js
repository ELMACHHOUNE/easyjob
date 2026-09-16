import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from './axios'

// Auth hooks are in AuthContext

// Profile hooks
export const useProfile = () => useQuery({
  queryKey: ['profile'],
  queryFn: async () => { const { data } = await api.get('/profile'); return data },
})

export const useUpdateProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates) => { const { data } = await api.put('/profile', updates); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}

// Jobs hooks
export const useJobs = (filters = {}, options = {}) => useQuery({
  queryKey: ['jobs', filters],
  queryFn: async () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const { data } = await api.get(`/jobs?${params}`)
    return data
  },
  ...options,
})

export const useJob = (id) => useQuery({
  queryKey: ['job', id],
  queryFn: async () => { const { data } = await api.get(`/jobs/${id}`); return data },
  enabled: !!id,
})

export const useSavedJobs = () => useQuery({
  queryKey: ['jobs', 'saved'],
  queryFn: async () => { const { data } = await api.get('/jobs/saved'); return data },
})

export const useToggleSaveJob = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (jobId) => { const { data } = await api.post(`/jobs/${jobId}/save`); return data },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
      qc.invalidateQueries({ queryKey: ['jobs', 'saved'] })
    },
  })
}

// Applications hooks
export const useApplications = (filters = {}) => useQuery({
  queryKey: ['applications', filters],
  queryFn: async () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const { data } = await api.get(`/applications?${params}`)
    return data
  },
})

export const useMarkApplied = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (jobOfferId) => { const { data } = await api.post('/applications/mark-applied', { jobOfferId }); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  })
}

export const useApplication = (id) => useQuery({
  queryKey: ['application', id],
  queryFn: async () => { const { data } = await api.get(`/applications/${id}`); return data },
  enabled: !!id,
})

export const useCreateApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (appData) => { const { data } = await api.post('/applications', appData); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  })
}

export const useSendApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, emailData }) => { const { data } = await api.post(`/applications/${id}/send`, { email: emailData }); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  })
}

export const useUpdateApplicationStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }) => { const { data } = await api.put(`/applications/${id}/status`, { status }); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  })
}

export const useDeleteApplication = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => { const { data } = await api.delete(`/applications/${id}`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  })
}

// Dashboard hooks
export const useDashboardStats = () => useQuery({
  queryKey: ['dashboard', 'stats'],
  queryFn: async () => { const { data } = await api.get('/dashboard/stats'); return data },
})

export const useDashboardActivity = () => useQuery({
  queryKey: ['dashboard', 'activity'],
  queryFn: async () => { const { data } = await api.get('/dashboard/activity'); return data },
})

// Notifications hooks
export const useNotifications = (filters = {}) => useQuery({
  queryKey: ['notifications', filters],
  queryFn: async () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const { data } = await api.get(`/notifications?${params}`)
    return data
  },
})

export const useUnreadNotificationCount = () => useQuery({
  queryKey: ['notifications', 'unreadCount'],
  queryFn: async () => {
    const { data } = await api.get('/notifications')
    return data.unreadCount ?? 0
  },
  refetchInterval: 30000,
})

export const useMarkNotificationRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => { const { data } = await api.put(`/notifications/${id}/read`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => { const { data } = await api.put('/notifications/read-all'); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

// Recruiters hooks
export const useRecruiters = (filters = {}) => useQuery({
  queryKey: ['recruiters', filters],
  queryFn: async () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const { data } = await api.get(`/recruiters?${params}`)
    return data
  },
})

export const useRecruiter = (id) => useQuery({
  queryKey: ['recruiter', id],
  queryFn: async () => { const { data } = await api.get(`/recruiters/${id}`); return data },
  enabled: !!id,
})

export const useCreateRecruiter = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (recruiterData) => { const { data } = await api.post('/recruiters', recruiterData); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruiters'] }),
  })
}

export const useDeleteRecruiter = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => { const { data } = await api.delete(`/recruiters/${id}`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruiters'] }),
  })
}

export const useScrapeRecruiters = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params) => { const { data } = await api.post('/recruiters/scrape', params || {}); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruiters'] }),
  })
}

// CV hooks
export const useUploadCV = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (formData) => {
      const { data } = await api.post('/profile/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cv'] }),
  })
}

export const useCV = () => useQuery({
  queryKey: ['cv'],
  queryFn: async () => { const { data } = await api.get('/profile/cv'); return data },
})

export const useDeleteCV = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => { const { data } = await api.delete(`/profile/cv/${id}`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cv'] }),
  })
}

export const useMatchJobs = () => {
  return useMutation({
    mutationFn: async (params) => { const { data } = await api.post('/profile/cv/match-jobs', params || {}); return data },
  })
}

export const useAnalyzeCV = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (cvId) => { const { data } = await api.put(`/profile/cv/${cvId}`, { reanalyze: true }); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cv'] }),
  })
}

// Scraping hooks
export const useRunScraping = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (params) => { const { data } = await api.post('/scraping/run', params || {}); return data },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
      qc.invalidateQueries({ queryKey: ['scraping', 'logs'] })
    },
  })
}

export const useScrapingLogs = () => useQuery({
  queryKey: ['scraping', 'logs'],
  queryFn: async () => { const { data } = await api.get('/scraping/logs'); return data },
})

// Email templates hooks
export const useEmailTemplates = () => useQuery({
  queryKey: ['emailTemplates'],
  queryFn: async () => { const { data } = await api.get('/emails/templates'); return data },
})

export const useCreateEmailTemplate = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (templateData) => { const { data } = await api.post('/emails/templates', templateData); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emailTemplates'] }),
  })
}

export const useUpdateEmailTemplate = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => { const { data } = await api.put(`/emails/templates/${id}`, updates); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emailTemplates'] }),
  })
}

export const useDeleteEmailTemplate = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => { const { data } = await api.delete(`/emails/templates/${id}`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['emailTemplates'] }),
  })
}

// Search Profiles hooks
export const useSearchProfiles = () => useQuery({
  queryKey: ['searchProfiles'],
  queryFn: async () => { const { data } = await api.get('/search-profiles'); return data },
})

export const useCreateSearchProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (profileData) => { const { data } = await api.post('/search-profiles', profileData); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['searchProfiles'] }),
  })
}

export const useUpdateSearchProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => { const { data } = await api.put(`/search-profiles/${id}`, updates); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['searchProfiles'] }),
  })
}

export const useDeleteSearchProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => { const { data } = await api.delete(`/search-profiles/${id}`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['searchProfiles'] }),
  })
}

export const useToggleSearchProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => { const { data } = await api.post(`/search-profiles/${id}/activate`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['searchProfiles'] }),
  })
}

// Analytics hooks
export const useAnalyticsOverview = () => useQuery({
  queryKey: ['analytics', 'overview'],
  queryFn: async () => { const { data } = await api.get('/analytics/overview'); return data },
})

export const useAnalyticsApplications = () => useQuery({
  queryKey: ['analytics', 'applications'],
  queryFn: async () => { const { data } = await api.get('/analytics/applications'); return data },
})

export const useAnalyticsSources = () => useQuery({
  queryKey: ['analytics', 'sources'],
  queryFn: async () => { const { data } = await api.get('/analytics/sources'); return data },
})

// Portfolio hooks
export const usePortfolio = () => useQuery({
  queryKey: ['portfolio'],
  queryFn: async () => { const { data } = await api.get('/profile/portfolio'); return data },
})

export const useUpdatePortfolio = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (portfolioData) => { const { data } = await api.put('/profile/portfolio', portfolioData); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portfolio'] }),
  })
}

// Application notes hook
export const useUpdateApplicationNotes = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, notes }) => { const { data } = await api.put(`/applications/${id}`, { notes }); return data },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['application', variables.id] })
    },
  })
}

// Recruiter update hook
export const useUpdateRecruiter = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => { const { data } = await api.put(`/recruiters/${id}`, updates); return data },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['recruiters'] })
      qc.invalidateQueries({ queryKey: ['recruiter', variables.id] })
    },
  })
}

// ─── RECRUITER SPACE HOOKS ────────────────────────────────────
export const useRecruiterDashboard = () => useQuery({
  queryKey: ['recruiterSpace', 'dashboard'],
  queryFn: async () => { const { data } = await api.get('/recruiter-space/dashboard'); return data },
})

export const useRecruiterProfile = () => useQuery({
  queryKey: ['recruiterSpace', 'profile'],
  queryFn: async () => { const { data } = await api.get('/recruiter-space/profile'); return data },
})

export const useUpdateRecruiterProfile = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (updates) => { const { data } = await api.put('/recruiter-space/profile', updates); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recruiterSpace', 'profile'] }),
  })
}

export const useRecruiterJobs = (filters = {}) => useQuery({
  queryKey: ['recruiterSpace', 'jobs', filters],
  queryFn: async () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const { data } = await api.get(`/recruiter-space/jobs?${params}`)
    return data
  },
})

export const useRecruiterJob = (id) => useQuery({
  queryKey: ['recruiterSpace', 'job', id],
  queryFn: async () => { const { data } = await api.get(`/recruiter-space/jobs/${id}`); return data },
  enabled: !!id,
})

export const useCreateRecruiterJob = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (jobData) => { const { data } = await api.post('/recruiter-space/jobs', jobData); return data },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recruiterSpace', 'jobs'] })
      qc.invalidateQueries({ queryKey: ['recruiterSpace', 'dashboard'] })
    },
  })
}

export const useUpdateRecruiterJob = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => { const { data } = await api.put(`/recruiter-space/jobs/${id}`, updates); return data },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recruiterSpace', 'jobs'] })
      qc.invalidateQueries({ queryKey: ['recruiterSpace', 'dashboard'] })
    },
  })
}

export const useDeleteRecruiterJob = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => { const { data } = await api.delete(`/recruiter-space/jobs/${id}`); return data },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recruiterSpace', 'jobs'] })
      qc.invalidateQueries({ queryKey: ['recruiterSpace', 'dashboard'] })
    },
  })
}

export const useToggleRecruiterJob = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => { const { data } = await api.put(`/recruiter-space/jobs/${id}/toggle`); return data },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recruiterSpace', 'jobs'] })
      qc.invalidateQueries({ queryKey: ['recruiterSpace', 'dashboard'] })
    },
  })
}

export const useRecruiterCandidates = (filters = {}) => useQuery({
  queryKey: ['recruiterSpace', 'candidates', filters],
  queryFn: async () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const { data } = await api.get(`/recruiter-space/candidates?${params}`)
    return data
  },
})

export const useRecruiterCandidateDetail = (userId) => useQuery({
  queryKey: ['recruiterSpace', 'candidate', userId],
  queryFn: async () => { const { data } = await api.get(`/recruiter-space/candidates/${userId}`); return data },
  enabled: !!userId,
})

export const useMatchingCandidates = (jobId, filters = {}) => useQuery({
  queryKey: ['recruiterSpace', 'matching', jobId, filters],
  queryFn: async () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const { data } = await api.get(`/recruiter-space/jobs/${jobId}/matching-candidates?${params}`)
    return data
  },
  enabled: !!jobId,
})

export const useRecruiterApplications = (filters = {}) => useQuery({
  queryKey: ['recruiterSpace', 'applications', filters],
  queryFn: async () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const { data } = await api.get(`/recruiter-space/applications?${params}`)
    return data
  },
})

export const useUpdateRecruiterApplicationStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }) => { const { data } = await api.put(`/recruiter-space/applications/${id}/status`, { status }); return data },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recruiterSpace', 'applications'] })
      qc.invalidateQueries({ queryKey: ['recruiterSpace', 'dashboard'] })
    },
  })
}

export const useRecruiterSendEmail = () => {
  return useMutation({
    mutationFn: async ({ userId, subject, message }) => {
      const { data } = await api.post(`/recruiter-space/candidates/${userId}/email`, { subject, message })
      return data
    },
  })
}

// ─── RECRUITER JOB BOARD (for candidates) ────────────────────
export const useRecruiterJobBoard = (filters = {}, options = {}) => useQuery({
  queryKey: ['jobs', 'recruiterBoard', filters],
  queryFn: async () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const { data } = await api.get(`/jobs/recruiter-board?${params}`)
    return data
  },
  ...options,
})

export const useApplyToRecruiterJob = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ jobId, coverLetter }) => { const { data } = await api.post(`/jobs/${jobId}/apply`, { coverLetter }); return data },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs', 'recruiterBoard'] })
      qc.invalidateQueries({ queryKey: ['applications'] })
    },
  })
}

// ─── JOB SEARCH STATUS ───────────────────────────────────────
export const useUpdateJobSearchStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (status) => { const { data } = await api.put('/auth/job-search-status', { status }); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}

// ─── COMPANY EMAILS ───────────────────────────────────────────
export const useCompanyEmails = (filters = {}) => useQuery({
  queryKey: ['companyEmails', filters],
  queryFn: async () => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const { data } = await api.get(`/company-emails?${params}`)
    return data
  },
})

export const useCompanyEmailFilters = () => useQuery({
  queryKey: ['companyEmails', 'filters'],
  queryFn: async () => { const { data } = await api.get('/company-emails/filters'); return data },
})

export const useCompanyEmail = (id) => useQuery({
  queryKey: ['companyEmail', id],
  queryFn: async () => { const { data } = await api.get(`/company-emails/${id}`); return data },
  enabled: !!id,
})

export const useCreateCompanyEmail = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => { const { data: res } = await api.post('/company-emails', data); return res },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companyEmails'] }),
  })
}

export const useUpdateCompanyEmail = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }) => { const { data } = await api.put(`/company-emails/${id}`, updates); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companyEmails'] }),
  })
}

export const useDeleteCompanyEmail = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => { const { data } = await api.delete(`/company-emails/${id}`); return data },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['companyEmails'] }),
  })
}
