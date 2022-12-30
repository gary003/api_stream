import express from "express"
import stream from "stream"
import { promisify } from "util"

// Defining pipelineAsync method
const pipelineAsync = promisify(stream.pipeline)

const app = express()

const fakeUpload = (req: any, res: any, next: () => void) => {
  const fakeSource = function* () {
    yield "azerty"
    yield "qwerty"
    yield "poiuyt"
    yield "wxcvbn"
  }

  req.sourceData = stream.Readable.from(fakeSource())

  next()
}

app.get("/file", fakeUpload, async (req: any, res) => {
  // console.log(req.sourceData)

  const transform = async function* (source: any) {
    for await (const value of source) {
      yield `${value},`
    }
  }

  try {
    return await pipelineAsync(req.sourceData, transform, res.status(250))
  } catch (e) {
    const errorPipeline = new Error("Error in pipeline")
    console.error(errorPipeline)
    return res.status(500).send(errorPipeline)
  }
})

app.listen(8888, () => console.log("Listening on 8888"))
