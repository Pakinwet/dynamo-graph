/* @flow */

import type { Graph } from '../index'
import type { Context } from './utils'

import { DynamoDB } from 'aws-sdk'

import generateSystem from './system'
import generateVertex from './vertex'
import generateEdge from './edge'

import { httpOptions } from '../adapter'

const indent = (ctx : Context): Context =>
  ( { ...ctx
    , out: ctx.out.bind(console, '>')
    }
  )

export default async function(g: Graph): Promise<Graph> {

  const ddb : DynamoDB =
    new DynamoDB
      ( { region: g.region
        , httpOptions
        }
      )

  const ctx : Context =
    { out: console.log.bind(console)
    , ddb
    , g
    }

  ctx.out(`Generating tables for ${g.name}`)

  // TODO: handle the >100 tables case
  const { TableNames: tables } : { TableNames: Array<string> } =
    await ddb.listTables().promise()

  await generateSystem(indent(ctx), tables)
  await generateVertex(indent(ctx), tables)
  await generateEdge(indent(ctx), tables)

  return g

}
