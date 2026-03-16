import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { prisma } from '../server'

export const keepDbAlive = async (_: Request, res: Response) => {
  await prisma.cronLog.create({ data: {} })

  res.status(StatusCodes.OK).json({ message: 'Ok' })
}
