import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { z } from "zod";
import { Prisma } from "../../generated/prisma";

const queryParamsSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

type GroupedWineResult = {
  wine_name: string;
  wine_id: string;
  updated_at: string | Date;
  customer_name: string;
  total_balance: number;
  total: string;
};

export async function listWineMetricsController(req: Request, res: Response) {
  try {
    const queryParams = queryParamsSchema.parse(req.query);

    const offset = (queryParams.page - 1) * queryParams.pageSize;

    const query = Prisma.sql`
    SELECT 
      w.name AS wine_name,
      w.id AS wine_id,
      w.updated_at AS updated_at,
      c.name AS customer_name,
      CAST(COUNT(*)  OVER() AS INTEGER)  AS total,
      CAST(SUM(woc.balance) AS INTEGER) AS total_balance
    FROM wines w
    JOIN wine_on_consigned woc ON w.id = woc.wine_id
    JOIN consigned con ON woc.consigned_id = con.id
    JOIN customers c ON con.customer_id = c.id
  `;

    const whereClause = queryParams.search
      ? Prisma.sql`  WHERE 
        (w.name ILIKE ${"%" + queryParams.search + "%"} 
        OR c.name ILIKE ${"%" + queryParams.search + "%"}) 
        AND con.status = 'EM_ANDAMENTO'
        AND c.disabled_at IS NULL`
      : Prisma.sql`
      WHERE 
        con.status = 'EM_ANDAMENTO'
        AND c.disabled_at IS NULL
    `;

    const groupOrderPagination = Prisma.sql`
    GROUP BY w.id, c.name
    ORDER BY c.name, w.id
    LIMIT ${queryParams.pageSize} OFFSET ${offset};
  `;

    const fullQuery = Prisma.sql`${query} ${whereClause} ${groupOrderPagination}`;

    const result = await prisma.$queryRaw<GroupedWineResult[]>(fullQuery);

    res.status(200).send({
      items: result.map((item) => ({
        wineId: item.wine_id,
        wineName: item.wine_name,
        lastUpdated: item.updated_at,
        customerName: item.customer_name,
        totalBalance: item.total_balance,
      })),

      page: queryParams.page,
      pageSize: queryParams.pageSize,
      total: result.length > 0 ? result[0].total : 0,
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
}
