import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ttweevkkvqpjzbmrnack.supabase.co'
const supabaseKey = 'sb_publishable_iCPqs9o_h_XwYHgjHbB5UA_j87NPDtp'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Auth helpers
export const signUp = async (email, password, name) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })
  if (!error && data.user) {
    // Insert profile row
    await supabase.from('profiles').insert([
      { id: data.user.id, name, coins: 0, avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}` }
    ]);
  }
  return { data, error }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// CRUD for tasks
export const getTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
  return { data, error }
}

export const getTaskById = async (id) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .single()
  return { data, error }
}

// For user_tasks 
export const getUserTasks = async () => {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }
  const { data, error } = await supabase
    .from('user_tasks')
    .select('*, tasks(*)')
    .eq('user_id', user.id)
  return { data, error }
}

export const updateUserTaskStatus = async (taskId, status) => {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }
  const { data, error } = await supabase
    .from('user_tasks')
    .upsert([
      { user_id: user.id, task_id: taskId, status, started_at: status === 'in-progress' ? new Date().toISOString() : undefined, completed_at: status === 'completed' ? new Date().toISOString() : undefined }
    ])
  return { data, error }
}

// For submissions
export const submitSolution = async (taskId, solutionCode) => {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }
  const { data, error } = await supabase
    .from('submissions')
    .insert([
      { user_id: user.id, task_id: taskId, solution_code: solutionCode, status: 'pending' }
    ])
  return { data, error }
}

export const getUserSubmissions = async () => {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }
  const { data, error } = await supabase
    .from('submissions')
    .select('*, tasks(title, description)')
    .eq('user_id', user.id)
  return { data, error }
}

// For updating submission status (admin function)
export const updateSubmissionStatus = async (submissionId, status, coins, feedback, codeQuality, functionality, documentation) => {
  const { data, error } = await supabase
    .from('submissions')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      coins,
      feedback,
      code_quality: codeQuality,
      functionality,
      documentation
    })
    .eq('id', submissionId)
  return { data, error }
}

// For user performance
export const getUserPerformance = async () => {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }
  const { data, error } = await supabase
    .from('user_performance')
    .select('*')
    .eq('user_id', user.id)
    .single()
  return { data, error }
}

// Update profile
export const updateProfile = async (updates) => {
  const user = await getCurrentUser()
  if (!user) return { error: 'Not authenticated' }
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
  return { data, error }
}