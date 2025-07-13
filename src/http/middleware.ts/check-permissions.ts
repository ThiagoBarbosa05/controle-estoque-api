import { NextFunction, Request, Response } from "express";

export function checkPermission(requiredPermission: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const permissions = req.user?.permissions || [];

    if (permissions.includes("all")) {
      next();
      return;
    }

    // Se o usuário tem a permissão específica, libera
    if (permissions.includes(requiredPermission)) {
      next();
      return;
    }

    // Caso contrário, bloqueia
    res.status(403).json({ message: "Acesso negado: Permissão insuficiente" });
    return;

    // try {
    //   const userId = req.user?.sub

    //   if(!userId) {
    //     res.status(401).send({message: "Nao autorizado: Usuário não encontrado"})
    //     return
    //   }

    //   const userWithRoles = await prisma.user.findUnique({
    //     where: {
    //       id: userId
    //     },
    //     select: {
    //       roles: {
    //         select: {
    //           role: {
    //             select: {
    //               permissions: {
    //                 select: {
    //                   permission: {
    //                     select: {
    //                       name: true
    //                     }
    //                   }
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   })

    //   if(!userWithRoles) {
    //     res.status(404).send({message: "Usuário não encontrado"})
    //     return
    //   }

    //   const permissions = userWithRoles.roles.flatMap(userRole => userRole.role.permissions.map(permission => permission.permission.name))

    //   if(permissions.includes("all")) {
    //     next()
    //     return
    //   }

    //   if(!permissions.includes(requiredPermission)) {
    //     res.status(403).send({message: "Acesso negado"})
    //     return
    //   }

    //   next()
    // }
    // catch (error) {}
  };
}
