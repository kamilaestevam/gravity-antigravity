import { prisma } from '../lib/prisma.js';

export async function processExportJob(jobId: string, _tenantId: string) {
  // Simulate processing time
  setTimeout(async () => {
    try {
      await prisma.relatorioExportar.update({
        where: { id_exportar_job: jobId },
        data: {
          status_exportar_job: 'PROCESSING',
          iniciado_em_exportar_job: new Date(),
        },
      });

      // Simulate file generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await prisma.relatorioExportar.update({
        where: { id_exportar_job: jobId },
        data: {
          status_exportar_job: 'DONE',
          url_arquivo_exportar_job: `https://storage.example.com/exports/${jobId}.csv`,
          concluido_em_exportar_job: new Date(),
        },
      });
    } catch (err) {
      console.error(`Error processing job ${jobId}:`, err);
      try {
        await prisma.relatorioExportar.update({
          where: { id_exportar_job: jobId },
          data: {
            status_exportar_job: 'FAILED',
            erro_exportar_job: err instanceof Error ? err.message : 'Unknown error',
            concluido_em_exportar_job: new Date(),
          },
        });
      } catch (e) {}
    }
  }, 100);
}
