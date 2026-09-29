/**
 * Worker entrypoint. In the Supabase-backed phase it claims PENDING rows from
 * ImportJob, parses files through @traderlab/profit-importer and persists the
 * resulting candidates. The API preview keeps local development usable before
 * DATABASE_URL is configured.
 */
console.log('TraderLab worker ready. Waiting for Supabase-backed import jobs.');
setInterval(() => console.log('Worker heartbeat', new Date().toISOString()), 60_000);

