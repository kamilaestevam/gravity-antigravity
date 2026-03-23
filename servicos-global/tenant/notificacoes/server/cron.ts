import cron from 'node-cron'
import { getBoss } from './queue/pg-boss'

// Simulated Prisma 
const prisma = {} as any

export function initCron() {
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Cron] Scanning for scheduled notifications...')
    try {
      await scanReminders()
      await scanNextSteps()
      await scanRecordings()
    } catch (err) {
      console.error('[Cron] Error running scans:', err)
    }
  })
  console.log('Cron daemon initialized.')
}

async function scanReminders() {
  // Select activities where reminder_at <= now AND reminder_sent == false
  // For each: enqueue job and mark reminder_sent = true
  console.log('Scanning Reminders...')
}

async function scanNextSteps() {
  // Select activities where next_step_date <= tomorrow AND next_step_reminder_sent == false
  console.log('Scanning Next Steps...')
}

async function scanRecordings() {
  // Select activities where recording_url != null AND recording_sent == false
  console.log('Scanning Recordings...')
}
