import { prisma } from '../lib/prisma.js';

export async function processExportJob(jobId: string, _tenantId: string) {
  // Simulate processing time
  setTimeout(async () => {
    try {
      await prisma.exportJob.update({
        where: { id: jobId },
        data: {
          status: 'PROCESSING',
          started_at: new Date(),
        },
      });

      // Simulate file generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await prisma.exportJob.update({
        where: { id: jobId },
        data: {
          status: 'DONE',
          url_arquivo: `https://storage.example.com/exports/${jobId}.csv`,
          completed_at: new Date(),
        },
      });
    } catch (err) {
      console.error(`Error processing job ${jobId}:`, err);
      try {
        await prisma.exportJob.update({
          where: { id: jobId },
          data: {
            status: 'FAILED',
            erro: err instanceof Error ? err.message : 'Unknown error',
            completed_at: new Date(),
          },
        });
      } catch (e) {}
    }
  }, 100);
}
