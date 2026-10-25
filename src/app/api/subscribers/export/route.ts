import { withAdmin } from "@/lib/auth";
import { subscribersCsv } from "@/modules/subscribers/subscriber.service";

// Download of every subscriber as a CSV file (admin).
export const GET = withAdmin(async () => {
  return new Response(await subscribersCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="brescia-lions-subscribers.csv"',
      "cache-control": "no-store",
    },
  });
});
