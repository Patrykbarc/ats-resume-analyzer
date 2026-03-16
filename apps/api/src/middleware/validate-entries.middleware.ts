import type { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { z, ZodError } from 'zod'

interface MulterRequest extends Request {
  file?: Express.Multer.File
}

type Schema = z.ZodObject

export function validateFile(schema: Schema) {
  return (req: MulterRequest, res: Response, next: NextFunction) => {
    if (!req.file) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Invalid data',
        details: [
          {
            message: 'File is required.',
            path: 'file'
          }
        ]
      })
    }

    try {
      schema.parse(req.file)
      next()
    } catch (error) {
      errorHandler(error, res)
    }
  }
}

export function validateData(schema: Schema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const mergedData = {
      ...req.params,
      ...req.body,
      ...req.query
    }

    try {
      schema.parse(mergedData)
      next()
    } catch (error) {
      errorHandler(error, res)
    }
  }
}

const errorHandler = (error: unknown, res: Response) => {
  if (error instanceof ZodError) {
    const errorMessages = error.issues.map((issue) => ({
      ...issue,
      path: issue.path[0]
    }))
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: 'Invalid data', details: errorMessages })
  } else {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: 'Internal Server Error' })
  }
}
